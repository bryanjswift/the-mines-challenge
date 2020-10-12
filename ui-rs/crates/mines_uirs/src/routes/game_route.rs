use anyhow::Error;
use yew::format::Json;
use yew::prelude::*;
use yew::services::fetch::FetchTask;
use yew_router::agent::{RouteAgentDispatcher, RouteRequest};

use crate::api;
use crate::components::{game_status_view, ErrorMessage};
use crate::util::{RENDER, SKIP_RENDER};

pub struct GameRoute {
    board: api::GameBoard,
    /// Send navigation updates
    dispatch: RouteAgentDispatcher,
    /// Error representing a non-200 status response from the server
    error: Option<Error>,
    /// The identifier for the game being viewed
    game_id: api::GameId,
    /// Pathway to send messages to self
    link: ComponentLink<Self>,
    /// Status of the current game
    status: api::GameStatus,
    /// In flight HTTP request
    task: Option<FetchTask>,
}

impl Component for GameRoute {
    type Message = GameRouteMsg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        link.send_message(GameRouteMsg::GetGame(props.game_id.clone()));
        GameRoute {
            board: Vec::new(),
            dispatch: RouteAgentDispatcher::new(),
            error: None,
            game_id: props.game_id,
            link,
            status: api::GameStatus::default(),
            task: None,
        }
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        if self.game_id != props.game_id {
            self.game_id = props.game_id;
            RENDER
        } else {
            SKIP_RENDER
        }
    }

    fn update(&mut self, message: Self::Message) -> ShouldRender {
        use GameRouteMsg::*;
        match message {
            BackToList => {
                self.dispatch.send(RouteRequest::ChangeRoute(
                    crate::routes::Routes::Home.into(),
                ));
                SKIP_RENDER
            }
            GetGame(game_id) => {
                if self.task.is_some() {
                    return SKIP_RENDER;
                }
                let handler = self.link.callback(handle_fetch_response);
                self.task = Some(api::fetch_game_details(game_id, handler));
                RENDER
            }
            GetGameSuccess(details) => {
                if self.game_id == details.id {
                    self.board = details.board;
                    self.status = details.status;
                }
                self.error = None;
                self.task = None;
                RENDER
            }
            GetGameError(error) => {
                self.error = Some(error);
                self.task = None;
                RENDER
            }
        }
    }

    fn view(&self) -> Html {
        let error_message = self.error.as_ref().map(|e| format!("{:?}", e));
        html! {
            <>
                <h1>{format!("Game: {}", self.game_id)}</h1>
                <p>
                    <a href="/" onclick=self.link.callback(GameRoute::handle_back)>
                        {"Back to List"}
                    </a>
                </p>
                <ErrorMessage is_loading={self.task.is_some()} message={error_message} />
                <table>
                    {format!("{:?}", self.board)}
                </table>
                {game_status_view(self.status)}
            </>
        }
    }
}

impl GameRoute {
    fn handle_back(e: MouseEvent) -> GameRouteMsg {
        e.prevent_default();
        GameRouteMsg::BackToList
    }
}

pub enum GameRouteMsg {
    BackToList,
    /// Start a request to retrieve a game
    GetGame(api::GameId),
    /// Received a successful response from fetching a game
    GetGameSuccess(api::GameDetailResponse),
    /// Receive an error response from the request to fetch a game
    GetGameError(Error),
}

#[derive(Clone, Properties)]
pub struct Props {
    /// The initial list of identifiers for games
    pub game_id: api::GameId,
}

/// Create `GameRouteMsg` from the given `FetchResponse`. The `response` is broken into parts and
/// use to read the id of the created game or to respond with an error.
fn handle_fetch_response(response: api::FetchResponse<api::GameDetailResponse>) -> GameRouteMsg {
    let (_, Json(data)) = response.into_parts();
    match data {
        Ok(response) => GameRouteMsg::GetGameSuccess(response),
        Err(err) => GameRouteMsg::GetGameError(err),
    }
}
