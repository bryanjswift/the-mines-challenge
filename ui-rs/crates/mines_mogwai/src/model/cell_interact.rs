#[derive(Copy, Clone, Debug)]
pub struct CellInteract {
    pub row: usize,
    pub column: usize,
    pub kind: CellInteractKind,
}

/// Allow an owned `CellInteract` to be treated as a reference.
impl AsRef<CellInteract> for CellInteract {
    fn as_ref(&self) -> &Self {
        self
    }
}

#[derive(Clone, Copy, Debug)]
pub enum CellInteractKind {
    Flag,
    RemoveFlag,
    Open,
}

impl From<&web_sys::Event> for CellInteractKind {
    fn from(event: &web_sys::Event) -> Self {
        use wasm_bindgen::JsCast;
        let event: Option<&web_sys::MouseEvent> = event.dyn_ref();
        if event.map(|e| e.alt_key() || e.ctrl_key()).unwrap_or(false) {
            CellInteractKind::Flag
        } else {
            CellInteractKind::Open
        }
    }
}
