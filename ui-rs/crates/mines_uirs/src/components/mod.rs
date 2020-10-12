mod error_message;
mod game_list;

use yew::prelude::*;

pub use error_message::ErrorMessage;
pub use game_list::GameList;

pub fn game_status_view(status: crate::api::GameStatus) -> Html {
    use crate::api::GameStatus::*;
    match status {
        Lost => html! { <h2>{"BOOM 💥"}</h2> },
        Won => html! { <h2>{"You did the thing! 🥳"}</h2> },
        Open => html! { <></> },
    }
}
