use crate::model::{CellInteract, CellUpdate};
use mogwai::prelude::*;

/// Create a `<td>` representing a single game cell. `coords` are expected to be `(column, row)` or
/// `(x, y)` in the grid. Interactions are transmitted to `tx` and new text to display is received
/// by `rx`.
#[allow(unused_braces)]
fn board_cell<'a>(
    coords: (usize, usize, String),
    tx: &Transmitter<CellInteract>,
    rx: &Receiver<CellUpdate>,
) -> ViewBuilder<HtmlElement> {
    use crate::components::cell::{BoardCell, BoardValue};
    let (col, row, initial_value) = coords;
    let tx_in = Transmitter::new();
    let rx_value: Receiver<BoardValue> = rx.branch_filter_map(move |update| match update {
        CellUpdate::All { cells } => cells
            .get(row)
            .map(|r| r.get(col))
            .flatten()
            .map(|s| s.into()),
        CellUpdate::Single {
            row: y,
            column: x,
            value,
        } if *x == col && *y == row => Some(value.into()),
        _ => None,
    });
    let c = Gizmo::from_parts(
        BoardCell::new((col, row), &initial_value, tx.clone()),
        tx_in,
        rx_value,
    );
    c.view_builder()
}

/// Create a `<tr>` representing a row of game cells. Interactions are transmitted to `tx` and new
/// text to display is received by `rx`.
fn board_row<'a>(
    row: usize,
    initial_cells: Vec<String>,
    tx: &Transmitter<CellInteract>,
    rx: &Receiver<CellUpdate>,
) -> ViewBuilder<HtmlElement> {
    let children = initial_cells
        .into_iter()
        .enumerate()
        .map(|(col, value)| board_cell((col, row, value), tx, rx));
    let mut tr = builder! { <tr /> };
    for child in children {
        tr.with(child);
    }
    tr
}

#[allow(unused_braces)]
pub fn board<'a>(
    cells: Vec<Vec<String>>,
    tx: &Transmitter<CellInteract>,
) -> ViewBuilder<HtmlElement> {
    use crate::model::CellInteractKind;
    let rx = Receiver::new();
    // The responses to `CellInteract` through individual `CellUpdate` represent optimisitic
    // updates. They reflect changes we can know on the client side without additional information
    // from the server.
    tx.wire_map(&rx, |interaction| CellUpdate::Single {
        column: interaction.column,
        row: interaction.row,
        value: match interaction.kind {
            CellInteractKind::Flag => "F".into(),
            CellInteractKind::RemoveFlag => " ".into(),
            CellInteractKind::Open => "*".into(),
        },
    });
    let children = cells
        .into_iter()
        .enumerate()
        .map(|(row, cells)| board_row(row, cells, tx, &rx));
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
