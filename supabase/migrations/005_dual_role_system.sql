-- Function to add host role to user
CREATE OR REPLACE FUNCTION public.become_host()
RETURNS VOID AS $$
BEGIN
  -- Add host role if not already present
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'host')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create host profile if not exists
  INSERT INTO public.host_profiles (user_id)
  VALUES (auth.uid())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Switch to host role and update is_host for backward compatibility
  UPDATE public.profiles 
  SET active_role = 'host',
      is_host = true,
      updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;