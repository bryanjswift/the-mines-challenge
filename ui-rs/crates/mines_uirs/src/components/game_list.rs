use yew::prelude::*;

pub struct GameList {
    game_ids: Vec<String>,
}

#[derive(Clone, Properties)]
pub struct Props {
    pub game_ids: Vec<String>,
}

impl Component for GameList {
    type Message = ();
    type Properties = Props;

    fn create(props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        Self {
            game_ids: props.game_ids,
        }
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        self.game_ids = props.game_ids;
        true
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        true
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
        html! {
            <li>
                <a href={format!("/game/{}", &id)}>
                    {&id}
                </a>
            </li>
        }
    }
}
