-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_table_info();

-- Function to get table definitions
CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE (
    table_name text,
    column_info text,
    constraints text,
    indexes text,
    foreign_keys text,
    policies text,
    triggers text
) AS $$
BEGIN
    RETURN QUERY
    WITH table_columns AS (
        SELECT 
            c.table_name::text as table_name,
            string_agg(
                c.column_name || ' ' || 
                c.data_type || 
                CASE 
                    WHEN c.character_maximum_length IS NOT NULL 
                    THEN '(' || c.character_maximum_length || ')'
                    ELSE ''
                END || 
                CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                CASE 
                    WHEN c.column_default IS NOT NULL 
                    THEN ' DEFAULT ' || c.column_default 
                    ELSE ''
                END,
                E'\n' ORDER BY c.ordinal_position
            ) as column_info
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name NOT LIKE 'pg_%'
          AND c.table_name NOT LIKE '_prisma_%'
        GROUP BY c.table_name
    ),
    constraint_columns AS (
        SELECT 
            tc.table_name::text as table_name,
            tc.constraint_name,
            tc.constraint_type,
            string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as column_names,
            ccu.table_name::text as foreign_table_name,
            string_agg(ccu.column_name, ', ' ORDER BY kcu.ordinal_position) as foreign_column_names
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name 
            AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name 
            AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name NOT LIKE 'pg_%'
          AND tc.table_name NOT LIKE '_prisma_%'
        GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type, ccu.table_name
    ),
    table_constraints AS (
        SELECT 
            cc.table_name::text as table_name,
            string_agg(
                'CONSTRAINT ' || cc.constraint_name || ' ' || 
                CASE 
                    WHEN cc.constraint_type = 'PRIMARY KEY' THEN 
                        'PRIMARY KEY (' || cc.column_names || ')'
                    WHEN cc.constraint_type = 'UNIQUE' THEN 
                        'UNIQUE (' || cc.column_names || ')'
                    WHEN cc.constraint_type = 'FOREIGN KEY' THEN 
                        'FOREIGN KEY (' || cc.column_names || ') ' ||
                        'REFERENCES ' || cc.foreign_table_name || 
                        '(' || cc.foreign_column_names || ')'
                    ELSE cc.constraint_type
                END,
                E'\n'
            ) as constraints
        FROM constraint_columns cc
        GROUP BY cc.table_name
    ),
    table_indexes AS (
        SELECT 
            i.tablename::text as table_name,
            string_agg(i.indexdef, E'\n') as indexes
        FROM pg_indexes i
        WHERE i.schemaname = 'public'
          AND i.tablename NOT LIKE 'pg_%'
          AND i.tablename NOT LIKE '_prisma_%'
        GROUP BY i.tablename
    ),
    table_policies AS (
        SELECT 
            p.tablename::text as table_name,
            string_agg(
                'POLICY ' || p.policyname || 
                ' FOR ' || 
                CASE 
                    WHEN p.cmd = 'r' THEN 'SELECT'
                    WHEN p.cmd = 'a' THEN 'INSERT'
                    WHEN p.cmd = 'w' THEN 'UPDATE'
                    WHEN p.cmd = 'd' THEN 'DELETE'
                    ELSE '*'
                END ||
                ' TO ' || array_to_string(p.roles, ', ') ||
                CASE WHEN p.qual IS NOT NULL 
                     THEN E'\n  USING (' || p.qual::text || ')'
                     ELSE ''
                END ||
                CASE WHEN p.with_check IS NOT NULL 
                     THEN E'\n  WITH CHECK (' || p.with_check::text || ')'
                     ELSE ''
                END,
                E'\n'
            ) as policies
        FROM pg_policies p
        WHERE p.schemaname = 'public'
        GROUP BY p.tablename
    ),
    table_triggers AS (
        SELECT 
            t.event_object_table::text as table_name,
            string_agg(
                'CREATE TRIGGER ' || t.trigger_name ||
                ' ' || t.action_timing || ' ' || t.event_manipulation ||
                ' ON ' || t.event_object_table ||
                ' FOR EACH ' || t.action_orientation ||
                ' EXECUTE FUNCTION ' || t.action_statement,
                E'\n'
            ) as triggers
        FROM information_schema.triggers t
        WHERE t.trigger_schema = 'public'
        GROUP BY t.event_object_table
    )
    SELECT 
        tc.table_name,
        tc.column_info,
        cs.constraints,
        ix.indexes,
        cs.constraints as foreign_keys,
        tp.policies,
        tr.triggers
    FROM table_columns tc
    LEFT JOIN table_constraints cs ON tc.table_name = cs.table_name
    LEFT JOIN table_indexes ix ON tc.table_name = ix.table_name
    LEFT JOIN table_policies tp ON tc.table_name = tp.table_name
    LEFT JOIN table_triggers tr ON tc.table_name = tr.table_name
    ORDER BY tc.table_name;
END;
$$ LANGUAGE plpgsql;

-- Execute the function and format the output
SELECT 
    '-- Table: ' || table_name || E'\n\n' ||
    'COLUMNS:\n' || column_info || E'\n\n' ||
    CASE WHEN constraints IS NOT NULL 
         THEN 'CONSTRAINTS:\n' || constraints || E'\n\n'
         ELSE ''
    END ||
    CASE WHEN indexes IS NOT NULL 
         THEN 'INDEXES:\n' || indexes || E'\n\n'
         ELSE ''
    END ||
    CASE WHEN foreign_keys IS NOT NULL 
         THEN 'FOREIGN KEYS:\n' || foreign_keys || E'\n\n'
         ELSE ''
    END ||
    CASE WHEN policies IS NOT NULL 
         THEN 'POLICIES:\n' || policies || E'\n\n'
         ELSE ''
    END ||
    CASE WHEN triggers IS NOT NULL 
         THEN 'TRIGGERS:\n' || triggers || E'\n\n'
         ELSE ''
    END ||
    '---------------------------------------\n'
FROM get_table_info();

-- Drop the function after use
DROP FUNCTION IF EXISTS get_table_info(); 