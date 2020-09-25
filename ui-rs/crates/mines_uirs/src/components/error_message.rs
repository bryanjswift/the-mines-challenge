use yew::prelude::*;

#[derive(Clone, Default, Properties)]
pub struct Props {
    pub is_loading: bool,
    pub message: Option<String>,
}

pub struct ErrorMessage {
    props: Props,
}

impl Component for ErrorMessage {
    type Message = ();
    type Properties = Props;

    fn create(props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        Self { props }
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        self.props = props;
        true
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        true
    }

    fn view(&self) -> Html {
        match &self.props {
            Props {
                is_loading: false,
                message: Some(err),
            } => html! {
                <p class={"error"}>{err}</p>
            },
            _ => html! { <></> },
        }
    }
}
