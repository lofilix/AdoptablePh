CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS supabase/migrations/20240408_update_profiles.sql BEGIN INSERT INTO public.profiles (id) VALUES (new.id); RETURN new; END; supabase/migrations/20240408_update_profiles.sql LANGUAGE plpgsql SECURITY DEFINER; DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
