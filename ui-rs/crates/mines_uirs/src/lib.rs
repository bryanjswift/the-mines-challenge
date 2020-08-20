mod components;
mod routes;
mod util;

use routes::home_route::HomeRoute;
use wasm_bindgen::prelude::*;
use yew::prelude::*;

struct Root {}

impl Component for Root {
    type Message = ();
    type Properties = ();
    fn create(_: Self::Properties, _link: ComponentLink<Self>) -> Self {
        Root {}
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        true
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        // Should only return "true" if new properties are different to
        // previously received properties.
        // This component has no properties so we will always return "false".
        false
    }

    fn view(&self) -> Html {
        html! {
            <HomeRoute initial_game_ids=vec![String::from("foo")] />
        }
    }
}

#[wasm_bindgen(start)]
pub fn run_app() {
    App::<Root>::new().mount_to_body();
}
