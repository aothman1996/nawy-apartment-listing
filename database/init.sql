-- Database and user are already created by Docker environment variables
-- This file is for additional setup after database creation

-- Grant privileges (database and user already exist)
GRANT ALL PRIVILEGES ON DATABASE nawy_db TO nawy_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nawy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nawy_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nawy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nawy_user;

