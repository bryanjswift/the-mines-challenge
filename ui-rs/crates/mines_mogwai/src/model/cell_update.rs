pub enum CellUpdate {
    All {
        cells: Vec<Vec<String>>,
    },
    #[allow(unused)]
    Single {
        row: usize,
        column: usize,
        value: String,
    },
}
