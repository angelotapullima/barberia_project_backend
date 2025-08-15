-- WARNING: This script will drop ALL tables in your database and re-create them.
-- Use with CAUTION, especially in production environments.

-- Drop tables in reverse order of dependency to avoid foreign key issues
DROP TABLE IF EXISTS draft_sale_items CASCADE;
DROP TABLE IF EXISTS draft_sales CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS products CASCADE; -- New table, but good to include for completeness
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Re-create the database schema with the new structure
-- You will need to execute this part manually using your psql client or a similar tool.
-- Example: psql -U <your_user> -d <your_database> -h <your_host> -p <your_port> -f src/schema_new.sql

-- Populate the database with test data for the new schema
-- Example: psql -U <your_user> -d <your_database> -h <your_host> -p <your_port> -f src/seed_new.sql

-- Note: The above psql commands are examples. You might need to adjust them based on your environment.
-- For Supabase, you might use their UI or a specific connection string with psql.
