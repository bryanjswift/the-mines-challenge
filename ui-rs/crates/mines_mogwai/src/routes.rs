mod game;
mod game_list;
mod index;

use mogwai::prelude::*;

pub use game::game;
pub use game_list::game_list;
pub use index::home;

pub fn not_found() -> ViewBuilder<HtmlElement> {
    builder! {
        <h1>"Not Found"</h1>
    }
}
