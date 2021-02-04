use crate::{api, components};
use mogwai::prelude::*;

#[allow(unused_braces)]
pub fn game(game_id: api::GameId) -> ViewBuilder<HtmlElement> {
    use components::game::CellInteract;
    // Create a transmitter to send button clicks into.
    let tx_game: Transmitter<api::GameState> = Transmitter::new();
    let tx_cells: Transmitter<CellInteract> = Transmitter::new();
    // Create the upstream `Transmitter` for `tx_game` (i.e. messages sent to `tx_api` will be
    // passed to `tx_game` if the response is success.
    let tx_api =
        tx_game.contra_filter_map(|r: &Result<api::GameState, api::FetchError>| r.clone().ok());
    tx_api.send_async(api::get_game(game_id));
    // Set up to receive board interactions which will trigger future board states through api
    // responses received in `tx_api`.
    tx_cells.spawn_recv().respond(move |interaction| {
        let input = api::GameMoveInput {
            game_id,
            column: interaction.column,
            row: interaction.row,
            move_type: match interaction.flag {
                true => api::GameMoveType::FLAG,
                false => api::GameMoveType::OPEN,
            },
        };
        tx_api.send_async(api::patch_game(input));
    });
    builder! {
        <main class="container">
            <div class="overlay">
                "This site is only supported in portrait mode."
            </div>
            <div class="game-board" data-game-id=&game_id.to_hyphenated().to_string()>
                {game_board(&tx_game, tx_cells)}
            </div>
            {game_status(&tx_game)}
        </main>
    }
}

fn game_board(
    tx_game: &Transmitter<api::GameState>,
    tx_cells: Transmitter<components::game::CellInteract>,
) -> ViewBuilder<HtmlElement> {
    use components::game::CellUpdate;
    let rx_game_board = Receiver::new();
    tx_game.wire_map(&rx_game_board, |game_state| CellUpdate::All {
        cells: game_state.board.clone(),
    });
    // Patch the initial board state into the game board slot
    let rx_patch_game = rx_game_board.branch_filter_map(move |update| match update {
        CellUpdate::All { cells } => Some(Patch::Replace {
            index: 0,
            value: components::game::board(cells.clone(), &tx_cells),
        }),
        _ => None,
    });
    builder! {
        <slot name="game-board" patch:children=rx_patch_game>
            <table>
                <tbody />
            </table>
        </slot>
    }
}

fn game_status(tx_game: &Transmitter<api::GameState>) -> ViewBuilder<HtmlElement> {
    let rx_game_status = Receiver::new();
    tx_game.wire_filter_map(&rx_game_status, |game_state| match game_state.status {
        api::GameStatus::WON => Some(Patch::Replace {
            index: 0,
            value: builder! { <h2>"You did the thing! 🥳"</h2> },
        }),
        api::GameStatus::LOST => Some(Patch::Replace {
            index: 0,
            value: builder! { <h2>"BOOM 💥"</h2> },
        }),
        api::GameStatus::OPEN => None,
    });
    builder! {
        <slot name="game-status" patch:children=rx_game_status>
            <span></span>
        </slot>
    }
}
