export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = "user" | "host" | "admin";
export type UserRole = "guest" | "host"; // New: Fiverr-style role
export type PropertyType = "apartment" | "house" | "villa" | "studio" | "room" | "loft" | "cabin" | "cottage" | "other";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "disputed";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type PlanType = "free" | "basic" | "premium" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "expired";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          postal_code: string | null;
          is_host: boolean;
          is_verified: boolean;
          verification_token: string | null;
          verification_token_expires_at: string | null;
          role: Role;
          stripe_customer_id: string | null;
          preferred_language: string;
          created_at: string;
          updated_at: string;
          // New: Dual role system
          active_role: UserRole | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          postal_code?: string | null;
          is_host?: boolean;
          is_verified?: boolean;
          verification_token?: string | null;
          verification_token_expires_at?: string | null;
          role?: Role;
          stripe_customer_id?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
          active_role?: UserRole | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          postal_code?: string | null;
          is_host?: boolean;
          is_verified?: boolean;
          verification_token?: string | null;
          verification_token_expires_at?: string | null;
          role?: Role;
          stripe_customer_id?: string | null;
          preferred_language?: string;
          created_at?: string;
          updated_at?: string;
          active_role?: UserRole | null;
        };
      };
      // New: User roles table (Fiverr-style dual roles)
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          created_at?: string;
        };
      };
      // New: Host profiles table
      host_profiles: {
        Row: {
          id: string;
          user_id: string;
          hosting_since: string;
          response_rate: number;
          response_time_minutes: number;
          is_identity_verified: boolean;
          is_phone_verified: boolean;
          payout_method: Json | null;
          total_earnings_cents: number;
          pending_earnings_cents: number;
          total_listings: number;
          total_bookings_hosted: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hosting_since?: string;
          response_rate?: number;
          response_time_minutes?: number;
          is_identity_verified?: boolean;
          is_phone_verified?: boolean;
          payout_method?: Json | null;
          total_earnings_cents?: number;
          pending_earnings_cents?: number;
          total_listings?: number;
          total_bookings_hosted?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          hosting_since?: string;
          response_rate?: number;
          response_time_minutes?: number;
          is_identity_verified?: boolean;
          is_phone_verified?: boolean;
          payout_method?: Json | null;
          total_earnings_cents?: number;
          pending_earnings_cents?: number;
          total_listings?: number;
          total_bookings_hosted?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description: string | null;
          slug: string | null;
          address: string;
          city: string;
          country: string;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          property_type: PropertyType;
          bedrooms: number | null;
          bathrooms: number | null;
          max_guests: number | null;
          price_per_night_cents: number;
          cleaning_fee_cents: number | null;
          service_fee_cents: number | null;
          is_published: boolean;
          is_archived: boolean;
          rating: number | null;
          review_count: number;
          image_urls: string[] | null;
          amenities: string[] | null;
          house_rules: string | null;
          cancellation_policy: string | null;
          instant_booking: boolean;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["properties"]["Row"], "id" | "created_at" | "updated_at" | "is_published" | "is_archived" | "review_count" | "verification_status"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
      };
      conversations: {
        Row: {
          id: string;
          property_id: string | null;
          subject: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversation_participants"]["Row"], "id" | "joined_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["conversation_participants"]["Row"]>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at" | "updated_at" | "is_read"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
      };
      bookings: {
        Row: {
          id: string;
          property_id: string;
          guest_id: string;
          host_id: string;
          check_in_date: string;
          check_out_date: string;
          nights: number;
          base_price_cents: number;
          cleaning_fee_cents: number | null;
          service_fee_cents: number | null;
          total_price_cents: number;
          status: BookingStatus;
          cancellation_reason: string | null;
          cancellation_date: string | null;
          special_requests: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at" | "updated_at" | "status"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount_cents: number;
          currency: string;
          status: PaymentStatus;
          payment_method: string | null;
          stripe_payment_intent_id: string | null;
          transaction_id: string | null;
          error_message: string | null;
          paid_at: string | null;
          refunded_at: string | null;
          refund_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at" | "currency" | "status"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          booking_id: string;
          guest_id: string;
          host_id: string;
          rating: number;
          comment: string | null;
          cleanliness_rating: number | null;
          accuracy_rating: number | null;
          communication_rating: number | null;
          location_rating: number | null;
          value_rating: number | null;
          is_published: boolean;
          response_to_review_id: string | null;
          response_text: string | null;
          response_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "updated_at" | "is_published"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["favorites"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Row"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: PlanType;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          cancel_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id" | "created_at" | "updated_at" | "plan_type" | "status"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
      availability_blocks: {
        Row: {
          id: string;
          property_id: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          is_blocked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["availability_blocks"]["Row"], "id" | "created_at" | "updated_at" | "is_blocked"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["availability_blocks"]["Row"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type AvailabilityBlock = Database["public"]["Tables"]["availability_blocks"]["Row"];
// New types
export type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];
export type HostProfile = Database["public"]["Tables"]["host_profiles"]["Row"];
