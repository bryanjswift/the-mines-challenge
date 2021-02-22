use crate::{api, components, model};
use mogwai::prelude::*;

/// Create a game screen for the game referenced by the provided `api::GameId`. Set up the game
/// screen and display a game board. The board will display as empty until game information can be
/// retrieved from the API.
#[allow(unused_braces)]
pub fn game(game_id: api::GameId) -> ViewBuilder<HtmlElement> {
    // Create a transmitter to send button clicks into.
    let tx_game: Transmitter<api::GameState> = Transmitter::new();
    let tx_cells: Transmitter<model::CellInteract> = Transmitter::new();
    // Create the upstream `Transmitter` for `tx_game` (i.e. messages sent to `tx_api` will be
    // passed to `tx_game` if the response is success.
    let tx_api = tx_game.contra_filter_fold(
        None,
        |current: &mut Option<api::GameState>, r: &Result<api::GameState, api::FetchError>| {
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
        tx_api.send_async(api::patch_game(game_id, interaction.into()));
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
    tx_cells: Transmitter<model::CellInteract>,
) -> ViewBuilder<HtmlElement> {
    let rx_game_board = Receiver::new();
    tx_game.wire_map(&rx_game_board, |game_state| model::CellUpdate::All {
        cells: game_state.board.clone(),
    });
    // FIXME: stop replacing the whole table each time an update is received from the server
    // Patch the initial board state into the game board slot
    let rx_patch_game = rx_game_board.branch_filter_map(move |update| match update {
        model::CellUpdate::All { cells } => Some(Patch::Replace {
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

impl<T> From<T> for api::GameMoveInput
where
    T: AsRef<model::CellInteract>,
{
    fn from(interaction: T) -> Self {
        let interaction = interaction.as_ref();
        Self {
            column: interaction.column,
            row: interaction.row,
            move_type: match interaction.kind {
                model::CellInteractKind::Flag => api::GameMoveType::FLAG,
                model::CellInteractKind::RemoveFlag => api::GameMoveType::FLAG,
                model::CellInteractKind::Open => api::GameMoveType::OPEN,
            },
        }
    }
}

#[cfg(test)]
mod game_board {
    use super::*;

    /// Create a `Vec` of owned `String` values.
    macro_rules! vec_of_strings {
        ($($x:expr),*) => (vec![$($x.to_string()),*]);
    }

    #[test]
    fn starts_empty() {
        let tx_game = Transmitter::new();
        let tx_cells = Transmitter::new();
        let builder = game_board(&tx_game, tx_cells);
        let ssr = View::from(builder);
        assert_eq!(
            ssr.html_string(),
            String::from("<slot name=\"game-board\"><table><tbody></tbody></table></slot>")
        );
    }

    #[test]
    fn updates_board_with_cells() {
        use std::{cell::RefCell, rc::Rc};
        let tx_game = Transmitter::new();
        let tx_cells = Transmitter::new();
        let builder = game_board(&tx_game, tx_cells);
        // Set up the ability to look at the most recently received patch
        let patch_receiver = builder.patches.first().unwrap();
        let respond_count = Rc::new(RefCell::new(0));
        let remote_respond_count = respond_count.clone();
        // Set up the `Receiver` to check each `Patch` received
        patch_receiver.branch().respond(move |patch| {
            // Store the number of Patch values received
            let mut count = remote_respond_count.borrow_mut();
            *count += 1;
            // Check that each received patch is to replace primary view
            assert!(matches!(patch, Patch::Replace { index: 0, value: _ }));
        });
        // Send a game state
        tx_game.send(&api::GameState {
            id: uuid::Uuid::new_v4(),
            board: vec![vec_of_strings![" ", "1", "F", "M"]],
            status: api::GameStatus::LOST,
        });
        // Test the number of patch receivers
        assert_eq!(builder.patches.len(), 1);
        // Test the number of updates received matches the number sent
        assert_eq!(*respond_count.borrow(), 1);
    }
}

#[cfg(test)]
mod game_status {
    use super::*;

    #[test]
    fn starts_empty() {
        let tx = Transmitter::new();
        let builder = game_status(&tx);
        let ssr = View::from(builder);
        assert_eq!(
            ssr.html_string(),
            String::from("<slot name=\"game-status\"><span></span></slot>")
        );
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

#[cfg(test)]
mod cell_interact {
    use super::*;

    #[test]
    fn creates_input_from_owned() {
        let interaction = model::CellInteract {
            row: 3,
            column: 4,
            kind: model::CellInteractKind::Open,
        };
        let input = api::GameMoveInput::from(interaction);
        assert_eq!(interaction.column, input.column);
        assert_eq!(interaction.row, input.row);
        assert_eq!(api::GameMoveType::OPEN, input.move_type);
    }

    #[test]
    fn creates_input_from_reference() {
        let interaction = model::CellInteract {
            row: 3,
            column: 4,
            kind: model::CellInteractKind::Flag,
        };
        let input = api::GameMoveInput::from(&interaction);
        assert_eq!(interaction.column, input.column);
        assert_eq!(interaction.row, input.row);
        assert_eq!(api::GameMoveType::FLAG, input.move_type);
    }
}
