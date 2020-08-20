mod api;
mod components;
mod routes;
mod util;

use routes::home_route::HomeRoute;
use wasm_bindgen::prelude::*;
use yew::prelude::*;
use yew_router::prelude::*;
use yew_router::router::Render;

use crate::routes::Routes;

struct Root {
    render_routes: Render<Routes>,
}

impl Component for Root {
    type Message = ();
    type Properties = ();

    fn create(_props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        let render_routes = Router::render(|switch: Routes| match switch {
            Routes::Home => html! { <HomeRoute initial_game_ids=vec![] /> },
        });
        Self {
            render_routes,
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        // Should only return "true" if new properties are different to
        // previously received properties.
        // This component has no properties so we will always return "false".
        false
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        true
    }

    fn view(&self) -> Html {
        html! {
            <Router<Routes, ()> render=&self.render_routes />
        }
    }
}

#[wasm_bindgen(start)]
pub fn run_app() {
    App::<Root>::new().mount_to_body();
}
