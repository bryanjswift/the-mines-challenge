use crate::{api, Route};
use mogwai::prelude::*;

/// Defines how to build the view for the home screen.
#[allow(unused_braces)]
pub fn home() -> ViewBuilder<HtmlElement> {
    // Create a transmitter to send button clicks into.
    let tx_click = Transmitter::new();
    let rx_org = Receiver::new();
    let main_component = Gizmo::from(Main {
        difficulty: Difficulty::Medium,
    });
    builder! {
        <main class="container">
            <div class="overlay">
                "This site is only supported in portrait mode."
            </div>
            <div class="page-one">
                <div class="section-block">
                    {star_title(rx_org)}
                    {new_button_view(tx_click)}
                    {main_component.view_builder()}
                </div>
            </div>
        </main>
    }
}

/// Holds the state for showing a "Create New Game" button with the button generating a game with
/// variable size (i.e. difficulty).
struct Main {
    difficulty: Difficulty,
}

impl Component for Main {
    type ModelMsg = MainModel;
    type ViewMsg = MainView;
    type DomNode = HtmlElement;

    fn update(
        &mut self,
        msg: &Self::ModelMsg,
        tx: &Transmitter<Self::ViewMsg>,
        _sub: &Subscriber<Self::ModelMsg>,
    ) {
        let api_tx = tx.contra_map(|r: &Result<api::GameCreated, api::FetchError>| match r {
            Ok(response) => MainView::CreateGameSuccess(response.id),
            Err(err) => MainView::CreateGameError(*err),
        });
        use MainModel::*;
        match msg {
            Create => {
                tx.send(&MainView::Creating);
                api_tx.send_async(api::create_game(self.difficulty.into()));
            }
            SetDifficulty(difficulty) if *difficulty != self.difficulty => {
                self.difficulty = *difficulty;
                tx.send(&MainView::DifficultyChanged(*difficulty))
            }
            _ => ()
        }
    }

    #[allow(unused_braces)]
    fn view(
        &self,
        tx: &Transmitter<Self::ModelMsg>,
        rx: &Receiver<Self::ViewMsg>,
    ) -> ViewBuilder<Self::DomNode> {
        let rx_difficulty = rx.branch_fold(self.difficulty, |current: &mut Difficulty, msg| match msg {
            MainView::DifficultyChanged(difficulty) => *difficulty,
            _ => *current,
        });
        let rx_size: Receiver<(usize, usize)> = rx_difficulty.branch_map(|difficulty| difficulty.into());
        let (initial_rows, initial_cols): (usize, usize) = self.difficulty.into();
        let rows = (format!("{}", initial_rows), rx_size.branch_map(|(rows, _)| format!("{}", rows)));
        let cols = (format!("{}", initial_cols), rx_size.branch_map(|(_, cols)| format!("{}", cols)));
        builder! {
            <section>
                <h1>"Letʼs Play Minesweeper"</h1>
                <h2>"Select Difficulty"</h2>
                <nav>
                    <ol>
                        {self.li_difficulty(tx, &rx_difficulty, Difficulty::Small)}
                        {self.li_difficulty(tx, &rx_difficulty, Difficulty::Medium)}
                        {self.li_difficulty(tx, &rx_difficulty, Difficulty::Large)}
                    </ol>
                </nav>
                <form
                    method="POST"
                    action="/game"
                    on:submit=tx.contra_map(|e: &Event| {
                        e.prevent_default();
                        MainModel::Create
                    })
                >
                    <input type="hidden" name="rows" value=rows />
                    <input type="hidden" name="cols" value=cols />
                    <button
                        type="submit"
                        boolean:disabled={rx.branch_map(|msg| msg == &MainView::Creating)}
                    >
                        "Start New Game"
                    </button>
                </form>
            </section>
        }
    }
}

/// The "model" messages to describe the change to effect within the `Component`.
#[derive(Clone, Copy, Debug)]
enum MainModel {
    /// The `Create` message indicates a new game should be created with the currently set
    /// `Difficulty`.
    Create,
    /// The `SetDifficulty` message is sent to update the currently set `Difficulty`.
    SetDifficulty(Difficulty)
}

/// The "view" events used to trigger changes to how the `Main` `Component` is rendered.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum MainView {
    /// The `Creating` event informs the view that a request to create a new game is in flight.
    Creating,
    /// The `CreateGameSuccess` event indicates the request to create a new game returned
    /// successfully, creating a game with the passed `api::GameId`.
    CreateGameSuccess(api::GameId),
    /// The `CreateGameError` event indicates the request to create a new game resulted in a
    /// failure. Details about the failure are indicated by the `api::model::FetchError`.
    CreateGameError(api::model::FetchError),
    /// The `DifficultyChanged` event is triggered with the currently selected `Difficulty` has
    /// been updated in the `Component`.
    DifficultyChanged(Difficulty),
}

/// Defines preset difficulty values for the games.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Difficulty {
    Small,
    Medium,
    Large,
}

/// Use the `Display` trait to describe how `Difficulty` should be turned into "human readable"
/// text.
impl std::fmt::Display for Difficulty {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let (rows, columns): (usize, usize) = self.into();
        f.write_fmt(format_args!("{:?} ({} x {})", self, rows, columns))
    }
}

/// Define the conversion from `Difficulty` to a tuple representing (rows, columns).
impl From<Difficulty> for (usize, usize) {
    fn from(difficulty: Difficulty) -> Self {
        match difficulty {
            Difficulty::Small => (5, 5),
            Difficulty::Medium => (10, 10),
            Difficulty::Large => (25, 25),
        }
    }
}

/// Define the conversion from `&Difficulty` to a tuple representing (rows, columns). Uses the
/// `Difficulty` to tuple conversion.
impl From<&Difficulty> for (usize, usize) {
    fn from(difficulty: &Difficulty) -> Self {
        let difficulty = *difficulty;
        difficulty.into()
    }
}

/// Define the conversion from `Difficulty` to `GameCreateInput` in terms of columns and rows.
impl From<Difficulty> for api::model::GameCreateInput {
    fn from(difficulty: Difficulty) -> Self {
        let (rows, columns) = difficulty.into();
        Self {
            columns,
            rows,
        }
    }
}

impl Main {
    /// Display an `<li>` which handles click events to set the difficulty related to the button to
    /// create games.
    #[allow(unused_braces)]
    fn li_difficulty(
        &self,
        tx: &Transmitter<MainModel>,
        rx: &Receiver<Difficulty>,
        difficulty: Difficulty
    ) -> ViewBuilder<HtmlElement> {
        let initial_class = if self.difficulty == difficulty {
            String::from("active")
        } else {
            String::from("")
        };
        let rx_class = rx.branch_map(move |current_difficulty| if *current_difficulty == difficulty {
            String::from("active")
        } else {
            String::from("")
        });
        let class_effect = (initial_class, rx_class);
        builder! {
            <li
                class=class_effect
                on:click=tx.contra_map(move |_| MainModel::SetDifficulty(difficulty))
            >
                {difficulty.to_string()}
            </li>
        }
    }
}

/// Defines a button that changes its text every time it is clicked.
/// Once built, the button will also transmit clicks into the given transmitter.
#[allow(unused_braces)]
fn new_button_view(tx_click: Transmitter<Event>) -> ViewBuilder<HtmlElement> {
    // Create a receiver for our button to get its text from.
    let rx_text = Receiver::<String>::new();

    // Create the button that gets its text from our receiver.
    //
    // The button text will start out as "Click me" and then change to whatever
    // comes in on the receiver.
    let button = builder! {
        // The button has a style and transmits its clicks
        <button style="cursor: pointer;" on:click=tx_click.clone()>
            // The text starts with "Click me" and receives updates
            {("Click me", rx_text.branch())}
        </button>
    };

    // Now that the routing is done, we can define how the signal changes from
    // transmitter to receiver over each occurance.
    // We do this by wiring the two together, along with some internal state in the
    // form of a fold function.
    tx_click.wire_fold(
        &rx_text,
        true, // our initial folding state
        |is_red, _| {
            let out = if *is_red {
                "Turn me blue".into()
            } else {
                "Turn me red".into()
            };

            *is_red = !*is_red;
            out
        },
    );

    button
}

fn stars() -> ViewBuilder<HtmlElement> {
    builder! {
        <div className="three-stars">
            <span>"★"</span>
            <span>"★"</span>
            <span>"★"</span>
        </div>
    }
}

#[allow(unused_braces)]
fn star_title(rx_org: Receiver<String>) -> ViewBuilder<HtmlElement> {
    let org_name = rx_org.branch_map(|org| format!("from {}?", org));
    builder! {
        <div class="title-component uppercase">
            {stars()}
            <div class="title-component__description">
                <span class="strike-preamble">"Did contributions come"</span>
                <span class="strike-out">{("from you?", org_name)}</span>
            </div>
        </div>
    }
}
