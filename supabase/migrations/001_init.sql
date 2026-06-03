-- supabase/migrations/001_init.sql
-- Locale Rent - Database initialization migration
-- Enables extensions, creates all core tables, functions, triggers, indexes, and RLS policies

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  is_host BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMP WITH TIME ZONE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'host', 'admin')),
  stripe_customer_id TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'studio', 'room', 'loft', 'cabin', 'cottage', 'other')),
  bedrooms INTEGER,
  bathrooms NUMERIC(3, 1),
  max_guests INTEGER,
  price_per_night_cents BIGINT NOT NULL,
  cleaning_fee_cents BIGINT,
  service_fee_cents BIGINT,
  is_published BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  rating NUMERIC(2, 1),
  review_count INTEGER DEFAULT 0,
  image_urls TEXT[],
  amenities TEXT[],
  house_rules TEXT,
  cancellation_policy TEXT,
  instant_booking BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INTEGER NOT NULL,
  base_price_cents BIGINT NOT NULL,
  cleaning_fee_cents BIGINT,
  service_fee_cents BIGINT,
  total_price_cents BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'disputed')),
  cancellation_reason TEXT,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'bank_transfer', 'wallet')),
  stripe_payment_intent_id TEXT,
  transaction_id TEXT,
  error_message TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  is_published BOOLEAN DEFAULT TRUE,
  response_to_review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  response_text TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  cancel_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability blocks table (for hosts to block dates)
CREATE TABLE IF NOT EXISTS public.availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  is_blocked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to check for booking overlaps
CREATE OR REPLACE FUNCTION public.check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE property_id = NEW.property_id
      AND id != NEW.id
      AND status != 'cancelled'
      AND daterange(check_in_date, check_out_date, '[]') && daterange(NEW.check_in_date, NEW.check_out_date, '[]')
  ) THEN
    RAISE EXCEPTION 'Booking dates overlap with existing booking';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking overlap check
CREATE TRIGGER booking_overlap_check
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_booking_overlap();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_blocks_updated_at BEFORE UPDATE ON public.availability_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Properties indexes
CREATE INDEX idx_properties_host_id ON public.properties(host_id);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_is_published ON public.properties(is_published);
CREATE INDEX idx_properties_slug ON public.properties(slug);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
-- Location index using earthdistance
CREATE INDEX idx_properties_location ON public.properties USING GIST (ll_to_earth(latitude, longitude));

-- Conversations indexes
CREATE INDEX idx_conversations_property_id ON public.conversations(property_id);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at);

-- Conversation participants indexes
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

-- Bookings indexes
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX idx_bookings_host_id ON public.bookings(host_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_check_in_date ON public.bookings(check_in_date);
CREATE INDEX idx_bookings_check_out_date ON public.bookings(check_out_date);
CREATE INDEX idx_bookings_dates ON public.bookings(property_id, check_in_date, check_out_date);

-- Payments indexes
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON public.payments(created_at);

-- Reviews indexes
CREATE INDEX idx_reviews_property_id ON public.reviews(property_id);
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX idx_reviews_guest_id ON public.reviews(guest_id);
CREATE INDEX idx_reviews_host_id ON public.reviews(host_id);
CREATE INDEX idx_reviews_is_published ON public.reviews(is_published);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at);

-- Favorites indexes
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_property_id ON public.favorites(property_id);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_type ON public.subscriptions(plan_type);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Availability blocks indexes
CREATE INDEX idx_availability_blocks_property_id ON public.availability_blocks(property_id);
CREATE INDEX idx_availability_blocks_dates ON public.availability_blocks(start_date, end_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - PROFILES
-- ============================================================================

CREATE POLICY "Public profiles are viewable by anyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - PROPERTIES
-- ============================================================================

CREATE POLICY "Published properties are viewable by anyone" ON public.properties
  FOR SELECT USING (is_published = true OR auth.uid()::uuid = host_id);

CREATE POLICY "Hosts can update their own properties" ON public.properties
  FOR UPDATE USING (auth.uid()::uuid = host_id);

CREATE POLICY "Hosts can insert properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid()::uuid = host_id);

CREATE POLICY "Hosts can delete their own properties" ON public.properties
  FOR DELETE USING (auth.uid()::uuid = host_id);

-- ============================================================================
-- RLS POLICIES - CONVERSATIONS
-- ============================================================================

CREATE POLICY "Conversation participants can view conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- RLS POLICIES - CONVERSATION PARTICIPANTS
-- ============================================================================

CREATE POLICY "Participants can view their conversations" ON public.conversation_participants
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can join conversations" ON public.conversation_participants
  FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

-- ============================================================================
-- RLS POLICIES - MESSAGES
-- ============================================================================

CREATE POLICY "Conversation participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()::uuid
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid()::uuid);

-- ============================================================================
-- RLS POLICIES - BOOKINGS
-- ============================================================================

CREATE POLICY "Guests and hosts can view their bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid()::uuid = guest_id
    OR auth.uid()::uuid = host_id
  );

CREATE POLICY "Guests can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid()::uuid = guest_id);

CREATE POLICY "Guests and hosts can update bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid()::uuid = guest_id
    OR auth.uid()::uuid = host_id
  );

-- ============================================================================
-- RLS POLICIES - PAYMENTS
-- ============================================================================

CREATE POLICY "Users can view payments for their bookings" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id
        AND (bookings.guest_id = auth.uid()::uuid OR bookings.host_id = auth.uid()::uuid)
    )
  );

CREATE POLICY "System can create payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their booking payments" ON public.payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id
        AND (bookings.guest_id = auth.uid()::uuid OR bookings.host_id = auth.uid()::uuid)
    )
  );

-- ============================================================================
-- RLS POLICIES - REVIEWS
-- ============================================================================

CREATE POLICY "Published reviews are viewable by anyone" ON public.reviews
  FOR SELECT USING (is_published = true OR auth.uid()::uuid = guest_id OR auth.uid()::uuid = host_id);

CREATE POLICY "Guests can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid()::uuid = guest_id);

CREATE POLICY "Guests can update their reviews" ON public.reviews
  FOR UPDATE USING (auth.uid()::uuid = guest_id);

CREATE POLICY "Hosts can update review responses" ON public.reviews
  FOR UPDATE USING (auth.uid()::uuid = host_id AND response_to_review_id IS NOT NULL);

-- ============================================================================
-- RLS POLICIES - FAVORITES
-- ============================================================================

CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can add favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can remove their favorites" ON public.favorites
  FOR DELETE USING (auth.uid()::uuid = user_id);

-- ============================================================================
-- RLS POLICIES - SUBSCRIPTIONS
-- ============================================================================

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- ============================================================================
-- RLS POLICIES - AVAILABILITY BLOCKS
-- ============================================================================

CREATE POLICY "Anyone can view availability blocks" ON public.availability_blocks
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage their property availability" ON public.availability_blocks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = availability_blocks.property_id
        AND properties.host_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Hosts can update their availability blocks" ON public.availability_blocks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = availability_blocks.property_id
        AND properties.host_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Hosts can delete their availability blocks" ON public.availability_blocks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = availability_blocks.property_id
        AND properties.host_id = auth.uid()::uuid
    )
  );