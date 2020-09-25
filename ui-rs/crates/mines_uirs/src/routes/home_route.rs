use anyhow::Error;
use yew::format::Json;
use yew::prelude::*;
use yew::services::fetch::FetchTask;

use crate::api;
use crate::api::{GameCreateResponse, GameId};
use crate::components::{ErrorMessage, GameList};
use crate::util::{RENDER, SKIP_RENDER};

pub struct HomeRoute {
    /// Error representing a non-200 status response from the server
    error: Option<Error>,
    /// List of Game identifiers to render
    game_ids: Vec<GameId>,
    /// Pathway to send messages to self
    link: ComponentLink<Self>,
    /// In flight HTTP request
    task: Option<FetchTask>,
}

pub enum HomeRouteMsg {
    /// Start a request to create a new game
    CreateGame,
    /// Received a successful response from creating a new game
    CreateGameSuccess(GameId),
    /// Receive an error response from the request to create a new game
    CreateGameError(Error),
    /// Start a request for games
    ListGames,
    /// Received a successful response containing game ids
    ListGamesSuccess(Vec<GameId>),
    /// Received an error response from the request for game ids
    ListGamesError(Error),
}

#[derive(Clone, Properties)]
pub struct Props {
    /// The initial list of identifiers for games
    pub initial_game_ids: Vec<GameId>,
}

/// Create `HomeRouteMsg` from the given `FetchResponse`. The `response` is broken into parts and
/// use to read the id of the created game or to respond with an error.
fn handle_create_response(response: api::FetchResponse<GameCreateResponse>) -> HomeRouteMsg {
    let (_, Json(data)) = response.into_parts();
    match data {
        Ok(response) => HomeRouteMsg::CreateGameSuccess(response.id),
        Err(err) => HomeRouteMsg::CreateGameError(err),
    }
}

/// Create `HomeRouteMsg` from the given `FetchResponse`. The `response` is broken into parts and
/// use to construct a list of game ids or to respond with an error.
fn handle_list_response(response: api::FetchResponse<Vec<GameId>>) -> HomeRouteMsg {
    let (_, Json(data)) = response.into_parts();
    match data {
        Ok(game_ids) => HomeRouteMsg::ListGamesSuccess(game_ids),
        Err(err) => HomeRouteMsg::ListGamesError(err),
    }
}

impl HomeRoute {
    fn create_game(_: yew::MouseEvent) -> HomeRouteMsg {
        HomeRouteMsg::CreateGame
    }
}

impl Component for HomeRoute {
    type Message = HomeRouteMsg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        link.send_message(HomeRouteMsg::ListGames);
        HomeRoute {
            error: None,
            game_ids: props.initial_game_ids,
            link,
            task: None,
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        SKIP_RENDER
    }

    fn update(&mut self, message: Self::Message) -> ShouldRender {
        match message {
            HomeRouteMsg::CreateGame => {
                if self.task.is_some() {
                    return SKIP_RENDER;
                }
                let handler = self.link.callback(handle_create_response);
                self.task = Some(api::create_new_game(handler));
                RENDER
            }
            HomeRouteMsg::CreateGameSuccess(game_id) => {
                self.error = None;
                self.game_ids.push(game_id);
                self.task = None;
                RENDER
            }
            HomeRouteMsg::CreateGameError(error) => {
                self.error = Some(error);
                self.task = None;
                RENDER
            }
            HomeRouteMsg::ListGames => {
                let handler = self.link.callback(handle_list_response);
                self.task = Some(api::fetch_game_ids(handler));
                RENDER
            }
            HomeRouteMsg::ListGamesSuccess(game_ids) => {
                self.error = None;
                self.game_ids = game_ids;
                self.task = None;
                RENDER
            }
            HomeRouteMsg::ListGamesError(error) => {
                self.error = Some(error);
                self.task = None;
                RENDER
            }
        }
    }

    fn view(&self) -> Html {
        let error_message = self
            .error
            .as_ref()
            .map(|_| String::from("Error loading games."));
        html! {
            <>
                <h1>{"Let's Play Minesweeper"}</h1>
                <ErrorMessage is_loading={self.task.is_some()} message={error_message} />
                <button disabled={self.task.is_some()} onclick=self.link.callback(Self::create_game)>
                    {"Start New Game"}
                </button>
                <GameList game_ids={self.game_ids.clone()} />
            </>
        }
    }
}
