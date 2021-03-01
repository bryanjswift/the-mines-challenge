use crate::{api, Route};
use mogwai::prelude::*;
use std::rc::Rc;

/// Create a `ViewBuilder` to represent a list of games.
pub fn game_list(dispatch: Transmitter<Route>) -> ViewBuilder<HtmlElement> {
    let component = GameList::new(dispatch, vec![]);
    Gizmo::from(component).view_builder()
}

struct GameList {
    dispatch: Transmitter<Route>,
    game_ids: Rc<Vec<api::GameId>>,
}

#[derive(Clone, Debug)]
enum GameListModel {
    Navigate { game_id: api::GameId },
    ReplaceList { game_ids: Rc<Vec<api::GameId>> },
}

#[derive(Clone, Debug)]
struct GameListView {
    game_ids: Rc<Vec<api::GameId>>,
}

impl GameList {
    fn new(dispatch: Transmitter<Route>, game_ids: Vec<api::GameId>) -> Self {
        Self {
            dispatch,
            game_ids: Rc::new(game_ids),
        }
    }

    fn game_ul(
        tx: &Transmitter<GameListModel>,
        game_ids: &Vec<api::GameId>,
    ) -> ViewBuilder<HtmlElement> {
        let mut game_ul = builder! { <ul /> };
        let game_links = game_ids
            .iter()
            .map(|game_id| GameList::game_li(&tx, game_id));
        for game_li in game_links {
            game_ul.with(game_li);
        }
        game_ul
    }

    #[allow(unused_braces)]
    fn game_li(tx: &Transmitter<GameListModel>, game_id: &api::GameId) -> ViewBuilder<HtmlElement> {
        let game_href = format!("/game/{}", game_id);
        let game_id = *game_id;
        let handler: Transmitter<Event> = tx.contra_map(move |e: &Event| {
            e.prevent_default();
            GameListModel::Navigate { game_id }
        });
        builder! {
            <li>
                <a href=game_href on:click=handler>{game_id.to_hyphenated().to_string()}</a>
            </li>
        }
    }
}

impl Component for GameList {
    type ModelMsg = GameListModel;
    type ViewMsg = GameListView;
    type DomNode = HtmlElement;

    fn bind(&self, in_sub: &Subscriber<Self::ModelMsg>, _out_sub: &Subscriber<Self::ViewMsg>) {
        in_sub.send_async(async {
            match crate::api::get_game_list().await {
                Ok(ids) => GameListModel::ReplaceList {
                    game_ids: Rc::new(ids),
                },
                Err(_) => GameListModel::ReplaceList {
                    game_ids: Rc::new(vec![]),
                },
            }
        });
    }

    fn update(
        &mut self,
        msg: &GameListModel,
        tx: &Transmitter<GameListView>,
        _sub: &Subscriber<GameListModel>,
    ) {
        match msg {
            GameListModel::ReplaceList { game_ids } => {
                self.game_ids = game_ids.clone();
                tx.send(&GameListView {
                    game_ids: self.game_ids.clone(),
                });
            }
            GameListModel::Navigate { game_id } => {
                self.dispatch.send(&Route::Game {
                    game_id: game_id.clone(),
                });
            }
        }
    }

    #[allow(unused_braces)]
    fn view(
        &self,
        tx: &Transmitter<GameListModel>,
        rx: &Receiver<GameListView>,
    ) -> ViewBuilder<HtmlElement> {
        let dispatch = tx.clone();
        let contents = GameList::game_ul(&dispatch, self.game_ids.as_ref());
        let rx_patch = rx.branch_map(move |msg| Patch::Replace {
            index: 0,
            value: GameList::game_ul(&dispatch, &msg.game_ids),
        });
        builder! {
            <main class="game-list">
                <slot patch:children=rx_patch>
                    {contents}
                </slot>
            </main>
        }
    }
}
