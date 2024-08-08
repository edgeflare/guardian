CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
--  -- if using ZITADEL --
    -- instance_id TEXT,
    -- FOREIGN KEY (instance_id, id) REFERENCES auth.users3(instance_id, id)
);

--  -- if using ZITADEL --
-- CREATE OR REPLACE FUNCTION create_user_on_signup()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     -- Insert the new user id and instance_id into public.users
--     INSERT INTO public.users(id, instance_id) VALUES (NEW.id, NEW.instance_id);
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE OR REPLACE TRIGGER tr_create_user_on_signup
-- AFTER INSERT ON auth.users3
-- FOR EACH ROW
-- EXECUTE FUNCTION create_user_on_signup();

GRANT SELECT,INSERT,UPDATE,DELETE ON public.users TO authn;
-- TODO: RLS
