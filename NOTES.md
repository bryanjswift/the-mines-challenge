# Plan

Given an initial `Game` state and an ordered list of moves the `Game` state can
be computed. Each "move" is essentially a timestamped event containing a
clicked `Cell#id`.

## Cell

`Cell` knows enough about its neighbors to represent itself. It knows:

- if it has been flagged
- if it is a mine
- if it has been opened
- about its neighbors

Because of the information a `Cell` knows it can represent itself to the API.

- if open and not mine, show `#mineCount`
- if open and mine, show `M`
- if flagged, show `F`
- if not open, show ` `

## Game

Because `Cell` knows enough about itself the `Game` representation is
significantly simplified. The `Game` mostly needs to print the `Cell` instances
formatted with the appropriate number of rows and columns.

The `Game` needs to know about the "moves" which have been made. In this case
the "move" is represented by a list of opened `Cell#id`.

## API

### `POST /game`

**Request:**

    {
      "rows": number,
      "columns": number,
    }

**Response:**

`201 Created`

    { "id": UUID }

### `GET /game/<uuid>`

**Response:**

    {
      "status": "OPEN" | "WON" | "LOST",
      "board": [
        [
          { id: "cell00", state: " " },
          { id: "cell01", state: " " },
        ],
        [
          { id: "cell10", state: " " },
          { id: "cell11", state: " " }
        ]
      ]
    }

### `PATCH /game/<uuid>/open/<cell-id>`

**Response:**

    {
      "status": "OPEN" | "WON" | "LOST",
      "board": [
        [
          { id: "cell00", state: " " },
          { id: "cell01", state: " " },
        ],
        [
          { id: "cell10", state: "3" },
          { id: "cell11", state: " " }
        ]
      ]
    }
