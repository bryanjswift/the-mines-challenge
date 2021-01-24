use dotenv_codegen::dotenv;

const API_BASE_URL: &str = dotenv!("API_BASE_URL");

pub mod model {
    use serde::{Deserialize, Serialize};

    pub type GameId = uuid::Uuid;

    #[derive(Clone, Debug, Serialize)]
    pub struct GameMoveInput {
        #[serde(skip)]
        pub game_id: GameId,
        pub column: usize,
        pub row: usize,
        #[serde(rename = "type")]
        pub move_type: GameMoveType,
    }

    #[derive(Clone, Debug, Serialize)]
    pub struct GameCreateInput {
        pub columns: usize,
        pub rows: usize,
    }

    #[derive(Clone, Copy, Debug, Serialize)]
    pub enum GameMoveType {
        FLAG,
        OPEN,
    }

    #[derive(Clone, Copy, Debug, Deserialize)]
    pub enum GameStatus {
        OPEN,
        WON,
        LOST,
    }

    #[derive(Clone, Copy, Debug, PartialEq, Eq)]
    pub enum FetchError {
        FetchError,
        ParseError,
        RequestCreateError,
        RequestHeaderSetError,
        SerializeBodyError,
    }

    /// A struct to hold some data from the Game API.
    ///
    /// Note how we don't have to define every member -- serde will ignore extra
    /// data when deserializing
    #[derive(Clone, Debug, Deserialize)]
    pub struct GameState {
        pub id: GameId,
        pub board: Vec<Vec<String>>,
        pub status: GameStatus,
    }

    /// A struct to hold data from the Game API after game creation.
    #[derive(Clone, Copy, Debug, Deserialize)]
    pub struct GameCreated {
        pub id: GameId,
    }
}

pub use model::*;
pub async fn get_game(game_id: model::GameId) -> Result<GameState, FetchError> {
    let url = format!("{}/game/{}", API_BASE_URL, game_id);
    get(url).await
}

pub async fn get_game_list() -> Result<Vec<model::GameId>, FetchError> {
    let url = format!("{}/game", API_BASE_URL);
    get(url).await
}

pub async fn patch_game(input: GameMoveInput) -> Result<GameState, FetchError> {
    let url = format!("{}/game/{}", API_BASE_URL, input.game_id);
    fetch(url, Some("PATCH"), Some(&input)).await
}

pub async fn create_game(input: GameCreateInput) -> Result<GameCreated, FetchError> {
    let url = format!("{}/game", API_BASE_URL);
    fetch(url, Some("POST"), Some(&input)).await
}

async fn get<T>(url: String) -> Result<T, FetchError>
where
    T: for<'a> serde::de::Deserialize<'a>,
{
    fetch::<(), T>(url, Some("GET"), None).await
}

async fn fetch<B, T>(url: String, method: Option<&str>, body: Option<&B>) -> Result<T, FetchError>
where
    B: serde::ser::Serialize,
    T: for<'a> serde::de::Deserialize<'a>,
{
    use wasm_bindgen::{JsCast, JsValue};
    use wasm_bindgen_futures::JsFuture;
    use web_sys::{Request, RequestInit, RequestMode, Response};

    let mut opts = RequestInit::new();
    opts.method(method.unwrap_or("GET"));
    opts.mode(RequestMode::Cors);
    if let Some(body) = body {
        let json_body = serde_json::to_string(body).map_err(|_| FetchError::SerializeBodyError)?;
        opts.body(Some(&JsValue::from(json_body)));
    }
    // Create a new Fetch `Request` from the `RequestInit` options
    let request =
        Request::new_with_str_and_init(&url, &opts).map_err(|_| FetchError::RequestCreateError)?;
    // Set the headers on the Fetch `Request`
    request
        .headers()
        .set("Accept", "application/json")
        .map_err(|_| FetchError::RequestHeaderSetError)?;
    request
        .headers()
        .set("Content-Type", "application/json")
        .map_err(|_| FetchError::RequestHeaderSetError)?;
    let resp_value = JsFuture::from(mogwai::utils::window().fetch_with_request(&request))
        .await
        .map_err(|_| FetchError::FetchError)?;
    // `resp_value` is a `Response` object.
    let resp: Response = resp_value.dyn_into().unwrap();
    // Convert this other `Promise` into a rust `Future`.
    let json = JsFuture::from(resp.json().map_err(|_| FetchError::FetchError)?)
        .await
        .map_err(|_| FetchError::FetchError)?;
    // Use serde to parse the JSON into a struct.
    json.into_serde().map_err(|_| FetchError::ParseError)
}
