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

impl std::str::FromStr for BoardValue {
    type Err = BoardValueConvertError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value {
            "" | " " => Ok(BoardValue::Closed),
            "M" => Ok(BoardValue::Mine),
            "F" => Ok(BoardValue::Flag),
            "*" => Ok(BoardValue::Pending),
            current => match usize::from_str(&current) {
                Ok(v) => Ok(BoardValue::Open(v)),
                _ => Err(BoardValueConvertError::ExpectedNeighborCount),
            },
        }
    }
}

impl<'de> serde::de::Deserialize<'de> for BoardValue {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        use std::str::FromStr;
        let s = String::deserialize(deserializer)?;
        BoardValue::from_str(&s).map_err(|e| match e {
            BoardValueConvertError::ExpectedNeighborCount => serde::de::Error::invalid_value(
                serde::de::Unexpected::Str(&s),
                &"a positive integer",
            ),
        })
    }
}

/// The types of errors the can happen when attempting to convert a `&str` into a `BoardValue`.
#[derive(Clone, Debug)]
pub enum BoardValueConvertError {
    /// Tried to parse as a count of neighbor mines but failed
    ExpectedNeighborCount,
}
