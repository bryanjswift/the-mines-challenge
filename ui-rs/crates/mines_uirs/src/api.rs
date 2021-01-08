use anyhow::Error;
use dotenv_codegen::dotenv;
use serde::{Deserialize, Serialize};
use serde_json::json;
use yew::callback::Callback;
use yew::format::{Json, Nothing};
use yew::services::fetch::{FetchService, FetchTask, Request, Response};

const API_BASE_URL: &str = dotenv!("API_BASE_URL");

pub type GameBoard = Vec<Vec<String>>;
pub type GameId = String;

#[derive(Serialize, Deserialize)]
pub struct GameCreateResponse {
    pub id: GameId,
}

#[derive(Serialize, Deserialize)]
pub struct GameDetailResponse {
    pub board: GameBoard,
    pub id: GameId,
    pub status: GameStatus,
}

#[derive(Copy, Clone, Serialize, Deserialize)]
pub enum GameStatus {
    #[serde(rename = "OPEN")]
    Open,
    #[serde(rename = "WON")]
    Won,
    #[serde(rename = "LOST")]
    Lost,
}

impl Default for GameStatus {
    fn default() -> Self {
        GameStatus::Open
    }
}

pub type GameListResponse = Vec<GameId>;

pub type FetchResponse<T> = Response<Json<Result<T, Error>>>;
type FetchCallback<T> = Callback<FetchResponse<T>>;

pub fn create_new_game(callback: FetchCallback<GameCreateResponse>) -> FetchTask {
    let body = json!({ "columns": 5, "rows": 5 });
    let req = Request::post(format!("{}/game", API_BASE_URL))
        .header("Content-Type", "application/json")
        .body(Json(&body))
        .unwrap();
    FetchService::fetch(req, callback).unwrap()
}

pub fn fetch_game_ids(callback: FetchCallback<GameListResponse>) -> FetchTask {
    let req = Request::get(format!("{}/game", API_BASE_URL))
        .body(Nothing)
        .unwrap();
    FetchService::fetch(req, callback).unwrap()
}

pub fn fetch_game_details(
    game_id: String,
    callback: FetchCallback<GameDetailResponse>,
) -> FetchTask {
    let req = Request::get(format!("{}/game/{}", API_BASE_URL, game_id))
        .body(Nothing)
        .unwrap();
    FetchService::fetch(req, callback).unwrap()
}
