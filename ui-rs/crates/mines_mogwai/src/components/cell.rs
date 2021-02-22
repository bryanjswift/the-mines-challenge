use crate::model::{CellInteract, CellInteractKind};
use mogwai::prelude::*;

pub struct BoardCell {
    column: usize,
    current_display: BoardValue,
    row: usize,
    tx_cells: Transmitter<CellInteract>,
}

impl BoardCell {
    pub fn new<T>(
        coords: (usize, usize),
        initial_value: T,
        tx_cells: Transmitter<CellInteract>,
    ) -> Self
    where
        T: AsRef<str>,
    {
        let (column, row) = coords;
        let current_display: BoardValue = initial_value.into();
        BoardCell {
            column,
            current_display,
            row,
            tx_cells,
        }
    }
}

impl Component for BoardCell {
    type ModelMsg = BoardCellInteract;
    type ViewMsg = BoardValue;
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
            (BoardValue::Flag, BoardCellInteract::Flag) => CellInteractKind::RemoveFlag,
            (BoardValue::Closed, BoardCellInteract::Flag) => CellInteractKind::Flag,
            _ => CellInteractKind::Open,
        };
        let interaction = CellInteract {
            column: self.column,
            row: self.row,
            kind,
        };
        // Optimistically update the cell because certain actions don't depend
        // on the game state so the `BoardCell` "knows" the result
        tx.send(match kind {
            CellInteractKind::RemoveFlag => &BoardValue::Closed,
            CellInteractKind::Flag => &BoardValue::Flag,
            CellInteractKind::Open => &BoardValue::Pending,
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
        let rx_text = rx.branch_map(|update| update.to_string());
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
pub enum BoardValue {
    Closed,
    Flag,
    Mine,
    Open(usize),
    Pending,
}

impl std::fmt::Display for BoardValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BoardValue::Closed => f.write_str(" "),
            BoardValue::Flag => f.write_str("F"),
            BoardValue::Mine => f.write_str("M"),
            BoardValue::Open(count) => f.write_fmt(format_args!("{}", count)),
            BoardValue::Pending => f.write_str("*"),
        }
    }
}

impl<T> From<T> for BoardValue
where
    T: AsRef<str>,
{
    fn from(value: T) -> Self {
        let current = value.as_ref();
        if current == "" || current == " " {
            BoardValue::Closed
        } else if current == "M" {
            BoardValue::Mine
        } else if current == "F" {
            BoardValue::Flag
        } else if current == "*" {
            BoardValue::Pending
        } else {
            use std::str::FromStr;
            match usize::from_str(&current) {
                Ok(v) => BoardValue::Open(v),
                _ => BoardValue::Closed,
            }
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
