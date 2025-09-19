/*
  # Initial Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `password` (text, hashed)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    
    - `listings`
      - `id` (integer, primary key, auto-increment)
      - `owner_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text, optional)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `country` (text)
      - `zip_code` (text)
      - `price_per_day` (decimal)
      - `price_per_hour` (decimal)
      - `vehicle_types` (json array)
      - `is_long_term` (boolean, default false)
      - `is_short_term` (boolean, default true)
      - `is_available` (boolean, default true)
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (integer, primary key, auto-increment)
      - `guest_id` (uuid, foreign key to users)
      - `listing_id` (integer, foreign key to listings)
      - `start_date` (date)
      - `end_date` (date)
      - `total_price` (decimal)
      - `status` (enum: pending, confirmed, declined, completed)
      - `created_at` (timestamp)
    
    - `messages`
      - `id` (integer, primary key, auto-increment)
      - `booking_id` (integer, foreign key to bookings)
      - `sender_id` (uuid, foreign key to users)
      - `receiver_id` (uuid, foreign key to users)
      - `content` (text)
      - `sent_at` (timestamp)
    
    - `invoices`
      - `id` (integer, primary key, auto-increment)
      - `booking_id` (integer, foreign key to bookings, unique)
      - `user_id` (uuid, foreign key to users)
      - `amount` (decimal)
      - `issue_date` (date)
      - `due_date` (date, optional)
      - `vat_details` (json, optional)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to listings
    - Add policies for booking participants to access booking data

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for search functionality
*/

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'declined', 'completed');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    vehicle_types JSON NOT NULL,
    is_long_term BOOLEAN DEFAULT false,
    is_short_term BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    guest_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    vat_details JSON
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Anyone can read available listings"
    ON listings
    FOR SELECT
    TO public
    USING (is_available = true);

CREATE POLICY "Users can read own listings"
    ON listings
    FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Users can create listings"
    ON listings
    FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own listings"
    ON listings
    FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own listings"
    ON listings
    FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid());

-- Bookings policies
CREATE POLICY "Users can read own bookings"
    ON bookings
    FOR SELECT
    TO authenticated
    USING (guest_id = auth.uid());

CREATE POLICY "Listing owners can read bookings for their listings"
    ON bookings
    FOR SELECT
    TO authenticated
    USING (
        listing_id IN (
            SELECT id FROM listings WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bookings"
    ON bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Listing owners can update booking status"
    ON bookings
    FOR UPDATE
    TO authenticated
    USING (
        listing_id IN (
            SELECT id FROM listings WHERE owner_id = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Booking participants can read messages"
    ON messages
    FOR SELECT
    TO authenticated
    USING (
        sender_id = auth.uid() OR 
        receiver_id = auth.uid()
    );

CREATE POLICY "Booking participants can send messages"
    ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (sender_id = auth.uid());

-- Invoices policies
CREATE POLICY "Users can read own invoices"
    ON invoices
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_available ON listings(is_available);
CREATE INDEX IF NOT EXISTS idx_listings_price_per_day ON listings(price_per_day);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);

CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);

-- Create composite indexes for search functionality
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings(city, is_available, price_per_day);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(city, state, country);