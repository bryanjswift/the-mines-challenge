mod game_list;
mod index;

use crate::api;
use mogwai::prelude::*;

pub use game_list::GameList;
pub use index::home;

#[allow(unused_braces)]
pub fn game(game_id: api::GameId) -> ViewBuilder<HtmlElement> {
    use crate::components::game::{self, CellInteract, CellUpdate};
    // Create a transmitter to send button clicks into.
    let tx_game: Transmitter<api::GameState> = Transmitter::new();
    let tx_cells: Transmitter<CellInteract> = Transmitter::new();
    let rx_cell_updates = Receiver::new();
    let rx_game_board = Receiver::new();
    let rx_game_status = Receiver::new();
    tx_cells.wire_map(&rx_cell_updates, |interaction| CellUpdate::Single {
        column: interaction.column,
        row: interaction.row,
        value: match interaction.flag {
            true => "F".into(),
            false => "*".into(),
        },
    });
    // Fetch the initial board state
    tx_game.wire_map(&rx_game_board, |game_state| CellUpdate::All {
        cells: game_state.board.clone(),
    });
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
    let tx_api =
        tx_game.contra_filter_map(|r: &Result<api::GameState, api::FetchError>| r.clone().ok());
    tx_api.send_async(api::get_game(game_id));
    // Set up to receive later board states
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
    // Patch the initial board state into the game board slot
    let rx_patch_game = rx_game_board.branch_filter_map(move |update| match update {
        CellUpdate::All { cells } => Some(Patch::Replace {
            index: 0,
            value: game::board(cells.clone(), &tx_cells, &rx_cell_updates),
        }),
        _ => None,
    });
    builder! {
        <main class="container">
            <div class="overlay">
                "This site is only supported in portrait mode."
            </div>
            <div class="game-board" data-game-id=&game_id.to_hyphenated().to_string()>
                <slot name="game-board" patch:children=rx_patch_game>
                    <table>
                        <tbody />
                    </table>
                </slot>
            </div>
            <slot name="game-status" patch:children=rx_game_status>
                <span></span>
            </slot>
        </main>
    }
}

pub fn not_found() -> ViewBuilder<HtmlElement> {
    builder! {
        <h1>"Not Found"</h1>
    }
}
