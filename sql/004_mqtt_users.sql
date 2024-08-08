CREATE TABLE IF NOT EXISTS mqtt_users (
    id VARCHAR(12) GENERATED ALWAYS AS (RIGHT(uuid::TEXT, 12)) STORED UNIQUE CHECK (char_length(id) = 12),
    name TEXT NOT NULL,
    username VARCHAR(12) GENERATED ALWAYS AS (RIGHT(uuid::TEXT, 12)) STORED UNIQUE CHECK (char_length(id) = 12),
    password_hash VARCHAR(128),
    salt VARCHAR(35) DEFAULT NULL,
    is_superuser BOOLEAN DEFAULT FALSE NOT NULL CHECK (is_superuser = FALSE),
    info JSONB DEFAULT '{}'::JSONB,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    uuid UUID DEFAULT generate_ulid() NOT NULL
);

CREATE OR REPLACE FUNCTION set_default_password_and_salt()
RETURNS TRIGGER AS $$
DECLARE
    salt TEXT;
BEGIN
    IF NEW.password_hash IS NULL THEN
        salt := encode(gen_random_bytes(16), 'hex');  -- random 16-byte salt
        NEW.salt := salt;
        NEW.password_hash := encode(digest(RIGHT(generate_ulid()::TEXT, 12) || salt, 'sha512'), 'hex');
    ELSE
        salt := encode(gen_random_bytes(16), 'hex');  -- random 16-byte salt
        NEW.salt := salt;
        NEW.password_hash := encode(digest(NEW.password_hash || salt, 'sha512'), 'hex');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_mqtt_users
BEFORE INSERT ON mqtt_users
FOR EACH ROW
EXECUTE FUNCTION set_default_password_and_salt();

-- users/grants
ALTER ROLE emqx PASSWORD '';
GRANT SELECT ON mqtt_users TO emqx;
GRANT SELECT,INSERT,UPDATE,DELETE ON mqtt_users TO authn;

-- RLS