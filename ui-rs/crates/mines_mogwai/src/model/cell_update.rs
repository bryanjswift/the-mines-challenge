pub enum CellUpdate {
    All {
        cells: Vec<Vec<String>>,
    },
    Single {
        row: usize,
        column: usize,
        value: String,
    },
}
