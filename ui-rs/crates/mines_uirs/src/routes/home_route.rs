use yew::prelude::*;

use crate::components::GameList;

pub struct HomeRoute {
    game_ids: Vec<String>,
}

enum HomeMsg {
    CreateGame(u16, u16),
    CreateGameSuccess(String),
    CreateGameError(String),
}

#[derive(Clone, Properties)]
pub struct Props {
    pub initial_game_ids: Vec<String>,
}

impl Component for HomeRoute {
    type Message = ();
    type Properties = Props;

    fn create(props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        HomeRoute {
            game_ids: props.initial_game_ids,
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        false
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        true
    }

    fn view(&self) -> Html {
        html! {
            <>
                <h1>{"Let's Play Minesweeper"}</h1>
                // <Error {...state} />
                <button disabled={true}>
                    {"Start New Game"}
                </button>
                <GameList game_ids={self.game_ids.clone()} />
            </>
        }
    }
}
