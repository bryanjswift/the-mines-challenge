mod game_route;
mod home_route;

use yew_router::prelude::*;

pub use game_route::GameRoute;
pub use home_route::HomeRoute;

#[derive(Switch, Debug, Clone)]
pub enum Routes {
    #[to = "/game/{id}"]
    Game(String),
    #[to = "/"]
    Home,
}
