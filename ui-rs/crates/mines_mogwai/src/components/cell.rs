use crate::model::{BoardValue, CellInteract, CellInteractKind, CellUpdate};
use mogwai::prelude::*;

pub struct BoardCell {
    column: usize,
    current_display: BoardValue,
    row: usize,
    tx_cells: Transmitter<CellInteract>,
}

impl BoardCell {
    pub fn gizmo(
        column: usize,
        row: usize,
        initial_value: BoardValue,
        tx: &Transmitter<CellInteract>,
        rx: &Receiver<CellUpdate>,
    ) -> Gizmo<Self> {
        Gizmo::from_parts(
            BoardCell {
                column,
                current_display: initial_value.into(),
                row,
                tx_cells: tx.clone(),
            },
            Transmitter::new(),
            rx.branch(),
        )
    }
}

impl Component for BoardCell {
    type ModelMsg = BoardCellInteract;
    type ViewMsg = CellUpdate;
    type DomNode = HtmlElement;

    fn update(
        &mut self,
        msg: &Self::ModelMsg,
        tx: &Transmitter<Self::ViewMsg>,
        _sub: &Subscriber<Self::ModelMsg>,
    ) {
        // The kind of `CellInteract` to send out depends on the current state
        // of the `BoardCell`
        let kind = match (self.current_display, msg) {
            (BoardValue::Flag, _) => CellInteractKind::RemoveFlag,
            (BoardValue::Closed, BoardCellInteract::Flag) => CellInteractKind::Flag,
            _ => CellInteractKind::Open,
        };
        let interaction = CellInteract {
            column: self.column,
            row: self.row,
            kind,
        };
        let board_value = match kind {
            CellInteractKind::RemoveFlag => BoardValue::Closed,
            CellInteractKind::Flag => BoardValue::Flag,
            CellInteractKind::Open => BoardValue::Pending,
        };
        // `current_display` will get out of sync with the displayed value if the cell moves to an
        // open state because messages from the `Receiver` don't have any way update the
        // `current_display` value.
        self.current_display = board_value;
        // Optimistically update the cell because certain actions don't depend
        // on the game state so the `BoardCell` "knows" the result
        tx.send(&CellUpdate::Single {
            column: self.column,
            row: self.row,
            value: board_value,
        });
        // Send the `CellInteract` out it (may) eventually result in receiving
        // a `ViewMessage`
        self.tx_cells.send(&interaction);
    }

    #[allow(unused_braces)]
    fn view(
        &self,
        tx: &Transmitter<Self::ModelMsg>,
        rx: &Receiver<Self::ViewMsg>,
    ) -> ViewBuilder<HtmlElement> {
        let col = self.column;
        let row = self.row;
        let rx_value: Receiver<BoardValue> = rx.branch_filter_map(move |update| match update {
            CellUpdate::All { cells } => cells.get(row).map(|r| r.get(col)).flatten().map(|s| *s),
            CellUpdate::Single {
                row: y,
                column: x,
                value,
            } if *x == col && *y == row => Some(*value),
            _ => None,
        });
        let rx_text = rx_value.branch_map(|update| update.to_string());
        builder! {
            <td
                on:click=tx.contra_map(|event: &Event| BoardCellInteract::from(event))
            >
                // Cells initialize to empty but may update if revealed or clicked
                {(self.current_display.to_string(), rx_text)}
            </td>
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub enum BoardCellInteract {
    Flag,
    Open,
}

impl From<&Event> for BoardCellInteract {
    fn from(event: &Event) -> Self {
        let event: Option<&web_sys::MouseEvent> = event.dyn_ref();
        if event.map(|e| e.alt_key() || e.ctrl_key()).unwrap_or(false) {
            BoardCellInteract::Flag
        } else {
            BoardCellInteract::Open
        }
    }
}
