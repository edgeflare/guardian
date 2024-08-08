CREATE OR REPLACE FUNCTION generate_ulid()
RETURNS UUID
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (lpad(to_hex(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint), 12, '0') || encode(gen_random_bytes(10), 'hex'))::uuid;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_updated_at_col()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
