use yew::prelude::*;
use yew_router::agent::{RouteAgentDispatcher, RouteRequest};

use crate::routes::Routes;
use crate::util::{RENDER, SKIP_RENDER};

pub struct GameList {
    game_ids: Vec<String>,
    link: ComponentLink<Self>,
    dispatch: RouteAgentDispatcher,
}

#[derive(Clone, Properties)]
pub struct Props {
    pub game_ids: Vec<String>,
}

impl Component for GameList {
    type Message = GameListMsg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self {
            dispatch: RouteAgentDispatcher::new(),
            game_ids: props.game_ids,
            link,
        }
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        self.game_ids = props.game_ids;
        RENDER
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        self.dispatch
            .send(RouteRequest::ChangeRoute(Routes::Game(msg).into()));
        SKIP_RENDER
    }

    fn view(&self) -> Html {
        html! {
            <>
                <h2>{"Resume or View Existing Game"}</h2>
                <ol>
                    {for self.game_ids.iter().map(|id| self.view_game_link(id))}
                </ol>
            </>
        }
    }
}

impl GameList {
    fn view_game_link(&self, id: &str) -> Html {
        let msg = String::from(id);
        html! {
            <li>
                <a href={format!("/game/{}", &id)} onclick=self.link.callback(move |e: MouseEvent| {
                    e.prevent_default();
                    msg.clone()
                })>
                    {&id}
                </a>
            </li>
        }
    }
}

type GameListMsg = String;
