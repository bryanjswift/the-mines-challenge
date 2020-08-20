use anyhow::Error;
use dotenv_codegen::dotenv;
use yew::callback::Callback;
use yew::format::{Json, Nothing};
use yew::services::fetch::{FetchService, FetchTask, Request, Response};

const API_BASE_URL: &str = dotenv!("API_BASE_URL");

pub type GameId = String;
pub type GameListResponse = Vec<GameId>;

pub type FetchResponse<T> = Response<Json<Result<T, Error>>>;
type FetchCallback<T> = Callback<FetchResponse<T>>;

pub fn fetch_game_ids(callback: FetchCallback<GameListResponse>) -> FetchTask {
    let req = Request::get(format!("{}/game", API_BASE_URL))
        .body(Nothing)
        .unwrap();
    FetchService::fetch(req, callback).unwrap()
}
