-- General helpers / baseline
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up game
CREATE TABLE game (
    game_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    column_count int NOT NULL,
    row_count int NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_timestamp_game
BEFORE UPDATE ON game
FOR EACH ROW
EXECUTE PROCEDURE trigger_update_timestamp();

-- Set up game_cell
CREATE TABLE game_cell (
    cell_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id uuid REFERENCES game (game_id),
    game_sequence_id int NOT NULL,
    is_mine boolean NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT rank_per_game UNIQUE (game_id, game_sequence_id)
);

CREATE TRIGGER update_timestamp_game_cell
BEFORE UPDATE ON game_cell
FOR EACH ROW
EXECUTE PROCEDURE trigger_update_timestamp();

-- Set up game_move
CREATE DOMAIN game_move_type AS varchar(32) CHECK (
    VALUE IN ('OPEN', 'FLAG', 'REMOVE_FLAG')
);

CREATE TABLE game_move (
    move_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cell_id uuid REFERENCES game_cell (cell_id),
    game_id uuid REFERENCES game (game_id),
    move_type game_move_type NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_timestamp_game_move
BEFORE UPDATE ON game_move
FOR EACH ROW
EXECUTE PROCEDURE trigger_update_timestamp();
