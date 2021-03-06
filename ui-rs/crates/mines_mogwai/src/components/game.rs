use crate::model::{CellInteract, CellUpdate};
use mogwai::prelude::*;

/// Create a `<tr>` representing a row of game cells. Interactions are transmitted to `tx` and new
/// text to display is received by `rx`.
fn board_row<'a>(
    row: usize,
    initial_cells: Vec<crate::model::BoardValue>,
    tx: &Transmitter<CellInteract>,
    rx: &Receiver<CellUpdate>,
) -> ViewBuilder<HtmlElement> {
    use crate::components::cell::BoardCell;
    let children = initial_cells
        .into_iter()
        .enumerate()
        .map(|(col, value)| BoardCell::gizmo(col, row, value, tx, rx).view_builder());
    let mut tr = builder! { <tr /> };
    for child in children {
        tr.with(child);
    }
    tr
}

#[allow(unused_braces)]
pub fn board<'a>(
    cells: Vec<Vec<crate::model::BoardValue>>,
    tx: &Transmitter<CellInteract>,
    rx: &Receiver<CellUpdate>,
) -> ViewBuilder<HtmlElement> {
    let children = cells
        .into_iter()
        .enumerate()
        .map(|(row, cells)| board_row(row, cells, tx, rx));
    let mut tbody: ViewBuilder<HtmlElement> = builder! { <tbody /> };
    for child in children {
        tbody.with(child);
    }
    builder! {
        <table>
            {tbody}
        </table>
    }
}
