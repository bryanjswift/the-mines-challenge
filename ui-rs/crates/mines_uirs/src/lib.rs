mod api;
mod components;
mod routes;
mod util;

use wasm_bindgen::prelude::*;
use yew::prelude::*;
use yew_router::prelude::*;
use yew_router::router::Render;

use crate::routes::Routes;
use crate::util::{RENDER, SKIP_RENDER};

struct Root {
    render_routes: Render<Routes>,
}

impl Component for Root {
    type Message = ();
    type Properties = ();

    fn create(_props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        let render_routes = Router::render(Root::switch);
        Self { render_routes }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        // Should only return "true" if new properties are different to
        // previously received properties.
        // This component has no properties so we will always return "false".
        SKIP_RENDER
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        RENDER
    }

    fn view(&self) -> Html {
        html! {
            <Router<Routes, ()> render=&self.render_routes />
        }
    }
}

impl Root {
    fn switch(switch: Routes) -> Html {
        yew::services::ConsoleService::info(&format!("Route: {:?}", switch));
        match switch {
            Routes::Home => html! { <routes::HomeRoute initial_game_ids=vec![] /> },
            Routes::Game(game_id) => html! { <p>{"Foo"}</p> },
        }
    }
}

#[wasm_bindgen(start)]
pub fn run_app() {
    App::<Root>::new().mount_to_body();
}
