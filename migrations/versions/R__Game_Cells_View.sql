-- This needs to be multiple selects because of the `game_sequence_id` ORDER BY
-- clause
CREATE OR REPLACE VIEW game_cells AS (
    SELECT
        game_id,
        json_agg(game_data.cell) as cells
    FROM (
        SELECT
            game_cell.game_id,
            json_build_object(
                'is_mine', game_cell.is_mine,
                'id', game_cell.cell_id
            ) AS cell
         FROM game_cell
         ORDER BY game_cell.game_sequence_id
    ) as game_data
    GROUP BY game_id
);
