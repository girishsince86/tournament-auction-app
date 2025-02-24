-- Function to get CREATE TABLE statements
CREATE OR REPLACE FUNCTION get_table_ddl(p_table_name varchar)
RETURNS text AS
$$
DECLARE
    v_table_ddl   text;
    column_record record;
    table_rec record;
BEGIN
    -- Get the table record
    SELECT * INTO table_rec
    FROM information_schema.tables t
    WHERE t.table_name = p_table_name
    AND t.table_schema = 'public';
    
    IF table_rec IS NULL THEN
        RETURN NULL;
    END IF;

    v_table_ddl = 'CREATE TABLE ' || p_table_name || ' (';
    
    -- Get all columns
    FOR column_record IN 
        SELECT 
            column_name, 
            data_type,
            coalesce(character_maximum_length::text,'') as max_length,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_name = p_table_name
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        IF column_record.max_length > '' THEN
            v_table_ddl = v_table_ddl || chr(10) || '    ' || column_record.column_name || ' ' || 
                column_record.data_type || '(' || column_record.max_length || ')';
        ELSE
            v_table_ddl = v_table_ddl || chr(10) || '    ' || column_record.column_name || ' ' || 
                column_record.data_type;
        END IF;

        -- Add nullable
        IF column_record.is_nullable = 'NO' THEN
            v_table_ddl = v_table_ddl || ' NOT NULL';
        END IF;

        -- Add default
        IF column_record.column_default IS NOT NULL THEN
            v_table_ddl = v_table_ddl || ' DEFAULT ' || column_record.column_default;
        END IF;

        v_table_ddl = v_table_ddl || ',';
    END LOOP;

    v_table_ddl = substring(v_table_ddl, 1, length(v_table_ddl) - 1);
    v_table_ddl = v_table_ddl || chr(10) || ');';

    RETURN v_table_ddl;
END;
$$ LANGUAGE plpgsql;

-- Get CREATE statements for all relevant tables
SELECT get_table_ddl('auction_rounds');
SELECT get_table_ddl('auction_display_config');
SELECT get_table_ddl('players');
SELECT get_table_ddl('teams');
SELECT get_table_ddl('player_categories');
SELECT get_table_ddl('team_position_requirements');
SELECT get_table_ddl('team_skill_requirements');
SELECT get_table_ddl('player_achievements');
SELECT get_table_ddl('player_statistics'); 