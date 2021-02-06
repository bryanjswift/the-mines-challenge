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
    use api::{FetchError, GameState};
    let tx_api = tx_game.contra_filter_fold(
        None,
        |current: &mut Option<GameState>, r: &Result<GameState, FetchError>| {
            if let Ok(next) = r {
                current.replace(next.clone());
            }
            current.clone()
        },
    );
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
    // Only send an update in to the `rx_game_status` if the status has changed
    tx_game.wire_filter_fold(
        &rx_game_status,
        api::GameStatus::OPEN,
        |status, game_state| {
            if *status == game_state.status {
                None
            } else {
                *status = game_state.status;
                Some(*status)
            }
        },
    );
    // Update the view whenever a new game status is received
    let rx_game_status_view = rx_game_status.branch_map(|status| match status {
        api::GameStatus::WON => Patch::Replace {
            index: 0,
            value: builder! { <h2>"You did the thing! 🥳"</h2> },
        },
        api::GameStatus::LOST => Patch::Replace {
            index: 0,
            value: builder! { <h2>"BOOM 💥"</h2> },
        },
        api::GameStatus::OPEN => Patch::Replace {
            index: 0,
            value: builder! { <span></span> },
        },
    });
    builder! {
        <slot name="game-status" patch:children=rx_game_status_view>
            <span></span>
        </slot>
    }
}

#[cfg(test)]
mod game_status_test {
    use super::*;

    #[test]
    fn starts_empty() {
        let tx = Transmitter::new();
        let ViewBuilder {
            attribs,
            children,
            element,
            patches,
            ..
        } = game_status(&tx);
        assert!(matches!(element, Some(tag) if tag == "slot".to_string()));
        assert_eq!(patches.len(), 1);
        assert_eq!(children.len(), 1);
        if let Some(ViewBuilder { element, .. }) = children.first() {
            assert_eq!(element.clone(), Some(String::from("span")));
        } else {
            assert!(false, "child was not <span>");
        }
        let name_attribute = attribs.iter().find(|cmd| match cmd {
            AttributeCmd::Attrib { name, .. } => name == "name",
            _ => false,
        });
        match name_attribute {
            Some(AttributeCmd::Attrib { effect, .. }) => match effect {
                Effect::OnceNow { now } => assert_eq!(now, "game-status"),
                _ => assert!(false, "name was not game-status"),
            },
            _ => assert!(false, "name did not exist"),
        };
    }

    #[test]
    fn stays_empty_on_open() {
        let tx = Transmitter::new();
        let builder = game_status(&tx);
        let ssr = View::from(builder);
        tx.send(&api::GameState {
            id: uuid::Uuid::new_v4(),
            board: Vec::new(),
            status: api::GameStatus::OPEN,
        });
        assert_eq!(
            ssr.html_string(),
            String::from("<slot name=\"game-status\"><span></span></slot>")
        );
    }

    #[test]
    fn booms_on_lost() {
        let tx = Transmitter::new();
        let builder = game_status(&tx);
        let ssr = View::from(builder);
        tx.send(&api::GameState {
            id: uuid::Uuid::new_v4(),
            board: Vec::new(),
            status: api::GameStatus::LOST,
        });
        assert_eq!(
            ssr.html_string(),
            String::from("<slot name=\"game-status\"><h2>BOOM 💥</h2></slot>")
        );
    }

    #[test]
    fn dings_on_won() {
        let tx = Transmitter::new();
        let builder = game_status(&tx);
        let ssr = View::from(builder);
        tx.send(&api::GameState {
            id: uuid::Uuid::new_v4(),
            board: Vec::new(),
            status: api::GameStatus::WON,
        });
        assert_eq!(
            ssr.html_string(),
            String::from("<slot name=\"game-status\"><h2>You did the thing! 🥳</h2></slot>")
        );
    }
}
