mod api;
mod app;
mod components;
mod routes;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum Route {
    /// Screen showing a specific game
    Game { game_id: api::GameId },
    /// Screen showing the list of games
    GameList,
    /// Default landing screen
    Home,
    /// Screen to display when the requested path does not exist
    NotFound,
}

#[wasm_bindgen::prelude::wasm_bindgen(start)]
pub fn run_app() -> Result<(), wasm_bindgen::JsValue> {
    use crate::app::App;
    use mogwai::prelude::*;

    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    console_log::init_with_level(log::Level::Trace).expect("could not init console_log");

    if cfg!(debug_assertions) {
        ::log::trace!("Hello from debug @mines/uirs");
    } else {
        ::log::trace!("Hello from release @mines/uirs");
    }

    let path = utils::window().location().pathname().unwrap_throw();
    let initial_route: Route = path.into();
    // Create our app's view by hydrating a gizmo from an initial state
    let root: Gizmo<App> = App::gizmo(initial_route);

    // Hand the app's view ownership to the window so it never
    // goes out of scope
    let view = View::from(root.view_builder());
    view.run()
}

mod route_dispatch {
    use super::{routes, Route};
    use mogwai::prelude::*;

    /// Dispatch the given `Route`.
    pub fn push_state(route: Route) {
        let window = mogwai::utils::window();
        match window.history() {
            Ok(history) => {
                let state = JsValue::from("");
                let push_result =
                    history.push_state_with_url(&state, "", Some(&format!("{}", route)));
                if let Err(error) = push_result {
                    ::log::debug!("{:?}", error);
                }
            }
            Err(error) => ::log::debug!("{:?}", error),
        }
    }

    /// Create a `ViewBuilder` for the given `Route`. The `ViewBuilder` will be
    /// given access to the `Transmitter`.
    pub fn view_builder(tx: Transmitter<Route>, route: Route) -> ViewBuilder<HtmlElement> {
        match route {
            Route::Game { game_id } => routes::game(game_id),
            Route::GameList => {
                let component = routes::GameList::new(tx, vec![]);
                Gizmo::from(component).view_builder()
            }
            Route::Home => routes::home(tx),
            Route::NotFound => routes::not_found(),
        }
    }
}

impl std::fmt::Display for Route {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Route::Game { game_id } => f.write_fmt(format_args!("/game/{}", game_id)),
            Route::GameList => f.write_str("/game"),
            Route::Home => f.write_str("/"),
            Route::NotFound => f.write_str("/404"),
        }
    }
}

impl<T: AsRef<str>> From<T> for Route {
    fn from(path: T) -> Self {
        let s = path.as_ref();
        ::log::trace!("route from: {}", s);
        // remove the scheme, if it has one
        let paths: Vec<&str> = s.split("/").collect::<Vec<_>>();
        ::log::info!("route parts = {:?}", paths);

        match paths.as_slice() {
            [""] => Route::Home,
            ["", ""] => Route::Home,
            ["", "game"] => Route::GameList,
            ["", "game", game_id] => match uuid::Uuid::parse_str(game_id) {
                Ok(game_id) => Route::Game { game_id },
                Err(_) => Route::NotFound,
            },
            _ => Route::NotFound,
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
