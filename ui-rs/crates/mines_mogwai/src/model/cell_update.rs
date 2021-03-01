#[derive(Clone)]
pub enum CellUpdate {
    All {
        cells: Vec<Vec<crate::model::BoardValue>>,
    },
    #[allow(unused)]
    Single {
        row: usize,
        column: usize,
        value: crate::model::BoardValue,
    },
}
