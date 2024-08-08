CREATE DOMAIN domain_name AS VARCHAR(255)
CHECK (
    VALUE ~* '^(\*\.)?([a-z0-9]([-a-z0-9]*[a-z0-9])?\.)*[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z]{2,})$'
);

CREATE TABLE IF NOT EXISTS networks (
    id VARCHAR(12) GENERATED ALWAYS AS (RIGHT(uuid::TEXT, 12)) STORED UNIQUE CHECK (char_length(id) = 12),
    name TEXT NOT NULL,
    addr CIDR NOT NULL,
    addr6 CIDR DEFAULT 'fd00::/8' NULL,
    dns INET[] DEFAULT ARRAY['1.1.1.1', '8.8.8.8', '9.9.9.9']::INET[],
    domains domain_name[] NOT NULL DEFAULT ARRAY[]::domain_name[],
    info JSONB DEFAULT '{}'::JSONB,
    user_id TEXT NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    uuid UUID DEFAULT generate_ulid() NOT NULL
);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON networks TO authn;
-- TODO: RLS