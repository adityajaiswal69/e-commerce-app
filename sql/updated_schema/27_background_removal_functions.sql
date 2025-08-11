-- Background removal helper functions

-- Returns the active provider and its API key when configured and enabled
-- SECURITY DEFINER to bypass RLS for reading sensitive key server-side
CREATE OR REPLACE FUNCTION public.get_active_background_removal_credentials()
RETURNS TABLE(provider text, api_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_key text;
BEGIN
  SELECT active_provider INTO active_key
  FROM public.background_removal_active
  WHERE id = true;

  RETURN QUERY
  SELECT s.provider, s.api_key
  FROM public.background_removal_settings s
  WHERE s.provider = active_key
    AND s.is_enabled = true
    AND coalesce(length(s.api_key), 0) > 0
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_active_background_removal_credentials() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_background_removal_credentials() TO authenticated;

