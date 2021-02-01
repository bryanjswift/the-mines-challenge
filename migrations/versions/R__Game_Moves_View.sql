CREATE OR REPLACE VIEW game_moves AS (
    SELECT
        game_id,
        json_agg(
            json_build_object(
                'cell_id', cell_id,
                'move_type', move_type
            )
        ) AS moves
    FROM game_move
    GROUP BY game_id
);
