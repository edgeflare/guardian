CREATE TYPE wgpeer AS ENUM ('gateway', 'node', 'client');

CREATE TABLE IF NOT EXISTS peers (
    id VARCHAR(12) GENERATED ALWAYS AS (RIGHT(uuid::TEXT, 12)) STORED UNIQUE CHECK (char_length(id) = 12),
    name TEXT NOT NULL,
    addr INET NOT NULL,
    cidr CIDR NOT NULL,
    addr6 INET DEFAULT '::1',
    dns INET[] DEFAULT ARRAY['1.1.1.1', '8.8.8.8', '9.9.9.9']::INET[],
    network_id TEXT REFERENCES networks(id) ON DELETE CASCADE,
    allowed_ips CIDR[] NOT NULL DEFAULT ARRAY['0.0.0.0/0']::CIDR[],
    endpoint TEXT DEFAULT '',
    enabled BOOLEAN DEFAULT TRUE,
    type wgpeer DEFAULT 'client',
    pubkey TEXT DEFAULT '' NOT NULL,
    privkey TEXT DEFAULT '',
    presharedkey TEXT DEFAULT '',
    info JSONB DEFAULT '{}'::JSONB,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    listen_port INT DEFAULT 51820,
    mtu INT DEFAULT 1420,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    uuid UUID DEFAULT generate_ulid()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON peers TO authn;
-- TODO: RLS
