-- Migration: 005_dual_role_system.sql
-- Locale Rent - Add Fiverr-style dual role system
-- Allows users to have multiple roles (guest + host) and switch between them

-- ============================================================================
-- 1. CREATE ROLES ENUM AND USER_ROLES TABLE
-- ============================================================================

-- Create role enum
CREATE TYPE public.user_role AS ENUM ('guest', 'host');

-- Create user_roles table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================================================
-- 2. ADD ACTIVE_ROLE TO PROFILES
-- ============================================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_role public.user_role DEFAULT 'guest';

-- ============================================================================
-- 3. CREATE HOST_PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.host_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Host-specific fields
  hosting_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_rate FLOAT DEFAULT 100.0,
  response_time_minutes INTEGER DEFAULT 60,
  is_identity_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  payout_method JSONB, -- Store payout details as JSON
  total_earnings_cents BIGINT DEFAULT 0,
  pending_earnings_cents BIGINT DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  total_bookings_hosted INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. MIGRATE EXISTING DATA
-- ============================================================================

-- Migrate existing users to user_roles table
-- Users with role='host' or is_host=true get both 'guest' and 'host' roles
-- Users with role='user' get 'guest' role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN role = 'host' OR is_host = TRUE THEN 'host'::public.user_role
    ELSE 'guest'::public.user_role
  END
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add 'guest' role to all users (everyone is a guest by default)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'guest'::public.user_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Set active_role based on existing role
UPDATE public.profiles 
SET active_role = CASE 
  WHEN role = 'host' OR is_host = TRUE THEN 'host'::public.user_role
  ELSE 'guest'::public.user_role
END
WHERE active_role IS NULL;

-- Create host_profiles for existing hosts
INSERT INTO public.host_profiles (user_id)
SELECT id 
FROM public.profiles 
WHERE role = 'host' OR is_host = TRUE
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 5. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_host_profiles_user_id ON public.host_profiles(user_id);

-- ============================================================================
-- 6. ENABLE RLS
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS POLICIES FOR USER_ROLES
-- ============================================================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own roles (for upgrading to host)
CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own roles (for downgrading from host)
CREATE POLICY "Users can delete own roles" ON public.user_roles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 8. RLS POLICIES FOR HOST_PROFILES
-- ============================================================================

-- Users can view their own host profile
CREATE POLICY "Users can view own host profile" ON public.host_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own host profile
CREATE POLICY "Users can update own host profile" ON public.host_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own host profile (when becoming a host)
CREATE POLICY "Users can insert own host profile" ON public.host_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Host profiles are publicly viewable (for guests to see host info)
CREATE POLICY "Host profiles are publicly viewable" ON public.host_profiles
  FOR SELECT USING (true);

-- ============================================================================
-- 9. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.user_has_role(check_user_id UUID, check_role public.user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to switch active role
CREATE OR REPLACE FUNCTION public.switch_active_role(new_role public.user_role)
RETURNS VOID AS $$
BEGIN
  -- Check if user has the role they're trying to switch to
  IF NOT public.user_has_role(auth.uid(), new_role) THEN
    RAISE EXCEPTION 'User does not have role: %', new_role;
  END IF;
  
  -- Update active role
  UPDATE public.profiles 
  SET active_role = new_role, updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  
  -- Switch to host role
  UPDATE public.profiles 
  SET active_role = 'host', updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. UPDATE EXISTING POLICIES (if needed)
-- ============================================================================

-- No changes to existing policies needed at this time
-- The existing policies use auth.uid() which still works

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_roles IS 'Stores user roles - allows multiple roles per user (Fiverr-style)';
COMMENT ON TABLE public.host_profiles IS 'Host-specific profile data separate from guest profile';
COMMENT ON COLUMN public.profiles.active_role IS 'Currently active role - determines which dashboard to show';
COMMENT ON FUNCTION public.user_has_role IS 'Check if a user has a specific role';
COMMENT ON FUNCTION public.switch_active_role IS 'Switch the active role for the current user';
COMMENT ON FUNCTION public.become_host IS 'Add host role and create host profile for current user';
