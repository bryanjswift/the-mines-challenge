pub mod home_route;

use yew_router::prelude::*;

#[derive(Switch, Debug, Clone)]
pub enum Routes {
    #[to = "/"]
    Home,
}
