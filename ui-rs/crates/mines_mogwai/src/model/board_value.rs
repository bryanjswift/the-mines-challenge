/// Defines the possible values of a cell on the board.
#[derive(Clone, Copy, Debug)]
pub enum BoardValue {
    /// An unopened cell, waiting for interaction
    Closed,
    /// A cell which has been flagged as a possible mine
    Flag,
    /// A cell which has been opened and contains a mine
    Mine,
    /// An opened cell indicating how many of its neighbors are mines
    Open(usize),
    /// A cell whose interaction is pending
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

impl<'de> serde::de::Deserialize<'de> for BoardValue {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        Ok(BoardValue::from(s))
    }
}
