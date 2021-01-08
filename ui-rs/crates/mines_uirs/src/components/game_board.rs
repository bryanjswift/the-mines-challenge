use yew::prelude::*;

pub struct GameCell {
    pub column: usize,
    pub row: usize,
    pub value: String,
}

pub fn game_board_cell(props: GameCell) -> Html {
    let GameCell { column, row, value } = props;
    html! {
        <td
            key=format!("{}::{}", column, row)
            valign="middle"
            align="center"
        >
            {value}
        </td>
    }
}
