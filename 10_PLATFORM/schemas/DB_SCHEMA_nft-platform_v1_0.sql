-- ============================================================================
-- UnstableLabs NFT Platform - Database Schema
-- Version: 1.0
-- Module: DB_SCHEMA
-- Status: FOR_IMPORT - Execute this migration in Supabase
-- Last Updated: February 3, 2026
-- ============================================================================
-- 
-- IMPORT STATUS: YES - Execute this migration to enable NFT platform features
-- 
-- This migration creates tables for:
--   1. Admins (backend authentication)
--   2. Players (frontend users)
--   3. NFTs (NFT catalog and ownership)
--   4. Packages (game packages for sale)
--   5. Purchases (purchase transactions)
--   6. Deliveries (delivery queue)
--   7. Burns (token burn events)
--   8. Trades (P2P marketplace)
--   9. Notifications (player notifications)
--   10. Audit Logs (admin action logging)
--
-- DEPENDENCIES: None (standalone schema)
-- RELATED: ECO_IMPL_token-economy_v0.3.md
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ADMINS TABLE
-- ============================================================================
-- Internal admin accounts for backend access

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  totp_secret TEXT, -- Encrypted TOTP secret
  totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  backup_codes TEXT[], -- Hashed backup codes
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  last_login TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS idx_admins_wallet ON public.admins(wallet_address);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_admins_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admins_updated
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admins_timestamp();

-- ============================================================================
-- 2. PLAYERS TABLE
-- ============================================================================
-- Player accounts linked to Solana wallets

CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  total_purchases INTEGER NOT NULL DEFAULT 0,
  total_spent_sol DECIMAL(20, 9) NOT NULL DEFAULT 0,
  total_nfts_owned INTEGER NOT NULL DEFAULT 0,
  total_trades_completed INTEGER NOT NULL DEFAULT 0,
  first_purchase_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for player queries
CREATE INDEX IF NOT EXISTS idx_players_wallet ON public.players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_players_activity ON public.players(last_activity_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_players_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER players_updated
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION update_players_timestamp();

-- ============================================================================
-- 3. NFTS TABLE
-- ============================================================================
-- NFT catalog with metadata and ownership

CREATE TYPE nft_status AS ENUM ('draft', 'ready', 'minted', 'delivered');

CREATE TABLE IF NOT EXISTS public.nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- On-chain data
  mint_address TEXT UNIQUE, -- Solana NFT mint address
  mint_transaction TEXT, -- Mint transaction signature
  minted_at TIMESTAMPTZ,
  
  -- Ownership
  owner_id UUID REFERENCES public.players(id),
  owner_wallet TEXT,
  
  -- Status workflow
  status nft_status NOT NULL DEFAULT 'draft',
  
  -- Image storage
  image_url TEXT,
  thumbnail_url TEXT,
  metadata_uri TEXT, -- On-chain metadata URI
  
  -- Game metadata (JSONB for flexibility)
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
    Expected metadata structure:
    {
      "_capture": "Solana Block #12345678",
      "_color": "Gamma",
      "_I/O": "CW",
      "tier": 5,
      "bit": "64-bit",
      "custom_spec": {}
    }
  */
  
  -- Derived fields for filtering
  tier INTEGER GENERATED ALWAYS AS ((metadata->>'tier')::integer) STORED,
  color TEXT GENERATED ALWAYS AS (metadata->>'_color') STORED,
  era TEXT GENERATED ALWAYS AS (metadata->>'bit') STORED,
  rotation TEXT GENERATED ALWAYS AS (metadata->>'_I/O') STORED,
  
  -- Rarity score (calculated from traits)
  rarity_score DECIMAL(10, 4) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for NFT queries
CREATE INDEX IF NOT EXISTS idx_nfts_status ON public.nfts(status);
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON public.nfts(owner_id);
CREATE INDEX IF NOT EXISTS idx_nfts_owner_wallet ON public.nfts(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_nfts_tier ON public.nfts(tier);
CREATE INDEX IF NOT EXISTS idx_nfts_color ON public.nfts(color);
CREATE INDEX IF NOT EXISTS idx_nfts_mint ON public.nfts(mint_address);
CREATE INDEX IF NOT EXISTS idx_nfts_metadata ON public.nfts USING gin(metadata);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_nfts_search ON public.nfts 
  USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_nfts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nfts_updated
  BEFORE UPDATE ON public.nfts
  FOR EACH ROW
  EXECUTE FUNCTION update_nfts_timestamp();

-- ============================================================================
-- 4. NFT OWNERSHIP HISTORY
-- ============================================================================
-- Track all ownership changes

CREATE TABLE IF NOT EXISTS public.nft_ownership_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID NOT NULL REFERENCES public.nfts(id) ON DELETE CASCADE,
  from_wallet TEXT, -- NULL for initial mint
  to_wallet TEXT NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('mint', 'delivery', 'transfer', 'trade')),
  transaction_signature TEXT,
  price_sol DECIMAL(20, 9), -- Price if sold
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ownership history queries
CREATE INDEX IF NOT EXISTS idx_ownership_nft ON public.nft_ownership_history(nft_id);
CREATE INDEX IF NOT EXISTS idx_ownership_to ON public.nft_ownership_history(to_wallet);
CREATE INDEX IF NOT EXISTS idx_ownership_time ON public.nft_ownership_history(created_at DESC);

-- ============================================================================
-- 5. PACKAGES TABLE
-- ============================================================================
-- Game packages for sale

CREATE TYPE package_status AS ENUM ('active', 'inactive', 'archived');

CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'standard',
  
  -- Pricing
  price_sol DECIMAL(20, 9) NOT NULL CHECK (price_sol > 0),
  
  -- Contents
  unsc_amount NUMERIC(78, 0) NOT NULL DEFAULT 0, -- BigInt for token amount
  nft_ids UUID[] NOT NULL DEFAULT '{}', -- Array of NFT IDs included
  
  -- Inventory
  total_supply INTEGER, -- NULL = unlimited
  sold_count INTEGER NOT NULL DEFAULT 0,
  reserved_count INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status package_status NOT NULL DEFAULT 'inactive',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Sale timing
  sale_starts_at TIMESTAMPTZ,
  sale_ends_at TIMESTAMPTZ,
  
  -- Statistics
  total_revenue_sol DECIMAL(20, 9) NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for package queries
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_featured ON public.packages(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_packages_category ON public.packages(category);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_packages_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER packages_updated
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION update_packages_timestamp();

-- ============================================================================
-- 6. PURCHASES TABLE
-- ============================================================================
-- Purchase transactions

CREATE TYPE purchase_status AS ENUM ('pending', 'confirmed', 'delivering', 'completed', 'failed', 'refunded');

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Buyer info
  player_id UUID REFERENCES public.players(id),
  buyer_wallet TEXT NOT NULL,
  
  -- Package info (denormalized for history)
  package_id UUID REFERENCES public.packages(id),
  package_name TEXT NOT NULL,
  package_price_sol DECIMAL(20, 9) NOT NULL,
  unsc_amount NUMERIC(78, 0) NOT NULL DEFAULT 0,
  nft_ids UUID[] NOT NULL DEFAULT '{}',
  
  -- Payment
  payment_transaction TEXT, -- SOL transfer transaction
  payment_confirmed_at TIMESTAMPTZ,
  
  -- Status
  status purchase_status NOT NULL DEFAULT 'pending',
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for purchase queries
CREATE INDEX IF NOT EXISTS idx_purchases_player ON public.purchases(player_id);
CREATE INDEX IF NOT EXISTS idx_purchases_wallet ON public.purchases(buyer_wallet);
CREATE INDEX IF NOT EXISTS idx_purchases_package ON public.purchases(package_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_time ON public.purchases(created_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_purchases_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchases_updated
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_purchases_timestamp();

-- ============================================================================
-- 7. DELIVERIES TABLE
-- ============================================================================
-- Delivery queue for purchased items

CREATE TYPE delivery_status AS ENUM ('pending', 'processing', 'delivered', 'failed');

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  
  -- Item being delivered
  nft_id UUID REFERENCES public.nfts(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('nft', 'token')),
  token_amount NUMERIC(78, 0), -- For token deliveries
  
  -- Recipient
  recipient_wallet TEXT NOT NULL,
  
  -- Status
  status delivery_status NOT NULL DEFAULT 'pending',
  
  -- Transaction tracking
  transfer_transaction TEXT,
  delivered_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for delivery queries
CREATE INDEX IF NOT EXISTS idx_deliveries_purchase ON public.deliveries(purchase_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_pending ON public.deliveries(status) WHERE status = 'pending';

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_deliveries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deliveries_updated
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_deliveries_timestamp();

-- ============================================================================
-- 8. BURN EVENTS TABLE
-- ============================================================================
-- Token burn event log (deflationary mechanism)

CREATE TYPE burn_status AS ENUM ('pending_confirmation', 'confirmed', 'executed', 'failed');

CREATE TABLE IF NOT EXISTS public.burn_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Trigger info
  purchase_id UUID REFERENCES public.purchases(id),
  triggered_by TEXT NOT NULL, -- 'delivery_complete', 'manual', etc.
  
  -- Burn details
  amount NUMERIC(78, 0) NOT NULL CHECK (amount > 0),
  token_address TEXT NOT NULL DEFAULT '7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT',
  
  -- Status and confirmation
  status burn_status NOT NULL DEFAULT 'pending_confirmation',
  initiated_by UUID REFERENCES public.admins(id),
  confirmed_by UUID REFERENCES public.admins(id),
  initiated_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  
  -- On-chain data
  burn_transaction TEXT,
  executed_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for burn queries
CREATE INDEX IF NOT EXISTS idx_burns_status ON public.burn_events(status);
CREATE INDEX IF NOT EXISTS idx_burns_purchase ON public.burn_events(purchase_id);
CREATE INDEX IF NOT EXISTS idx_burns_time ON public.burn_events(created_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_burns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER burns_updated
  BEFORE UPDATE ON public.burn_events
  FOR EACH ROW
  EXECUTE FUNCTION update_burns_timestamp();

-- ============================================================================
-- 9. TRADES TABLE
-- ============================================================================
-- P2P NFT marketplace listings

CREATE TYPE trade_status AS ENUM ('active', 'sold', 'cancelled', 'expired');

CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- NFT being sold
  nft_id UUID NOT NULL REFERENCES public.nfts(id),
  
  -- Seller
  seller_id UUID REFERENCES public.players(id),
  seller_wallet TEXT NOT NULL,
  
  -- Listing details
  price_sol DECIMAL(20, 9) NOT NULL CHECK (price_sol > 0),
  description TEXT,
  
  -- Status
  status trade_status NOT NULL DEFAULT 'active',
  
  -- Duration
  listed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Sale completion
  buyer_id UUID REFERENCES public.players(id),
  buyer_wallet TEXT,
  sold_at TIMESTAMPTZ,
  trade_transaction TEXT,
  
  -- Fees
  platform_fee_sol DECIMAL(20, 9) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for trade queries
CREATE INDEX IF NOT EXISTS idx_trades_nft ON public.trades(nft_id);
CREATE INDEX IF NOT EXISTS idx_trades_seller ON public.trades(seller_wallet);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_active ON public.trades(status, price_sol) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_trades_expires ON public.trades(expires_at) WHERE status = 'active';

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_trades_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trades_updated
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION update_trades_timestamp();

-- ============================================================================
-- 10. NOTIFICATIONS TABLE
-- ============================================================================
-- Player notifications

CREATE TYPE notification_type AS ENUM (
  'delivery_complete',
  'trade_sold',
  'trade_offer',
  'purchase_confirmed',
  'price_drop',
  'new_nft_available',
  'system'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  
  -- Notification content
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb, -- Additional context
  
  -- Status
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Reference to related entity
  entity_type TEXT,
  entity_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_player ON public.notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(player_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_time ON public.notifications(created_at DESC);

-- ============================================================================
-- 11. AUDIT LOGS TABLE
-- ============================================================================
-- Comprehensive admin action logging

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Admin who performed action
  admin_id UUID REFERENCES public.admins(id),
  admin_wallet TEXT,
  admin_email TEXT,
  
  -- Action details
  action TEXT NOT NULL, -- e.g., 'CREATE_NFT', 'UPDATE_PACKAGE', 'EXECUTE_BURN'
  entity_type TEXT NOT NULL, -- e.g., 'nft', 'package', 'delivery', 'burn'
  entity_id UUID,
  
  -- Change details
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
    Expected structure:
    {
      "before": { ... previous state ... },
      "after": { ... new state ... },
      "metadata": { ... additional context ... }
    }
  */
  
  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON public.audit_logs(created_at DESC);

-- ============================================================================
-- 12. ADMIN SESSIONS TABLE
-- ============================================================================
-- Active admin sessions

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  
  -- Session details
  token_hash TEXT NOT NULL UNIQUE, -- Hashed JWT
  ip_address TEXT,
  user_agent TEXT,
  
  -- Validity
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for session queries
CREATE INDEX IF NOT EXISTS idx_sessions_admin ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.admin_sessions(admin_id, revoked, expires_at) 
  WHERE revoked = FALSE;

-- ============================================================================
-- 13. BURN STATISTICS VIEW
-- ============================================================================
-- Aggregated burn statistics

CREATE OR REPLACE VIEW public.burn_statistics AS
SELECT
  COUNT(*) FILTER (WHERE status = 'executed') AS total_burns,
  COALESCE(SUM(amount) FILTER (WHERE status = 'executed'), 0) AS total_burned,
  COALESCE(SUM(amount) FILTER (WHERE status = 'executed' AND executed_at > NOW() - INTERVAL '30 days'), 0) AS burned_30d,
  COALESCE(SUM(amount) FILTER (WHERE status = 'executed' AND executed_at > NOW() - INTERVAL '7 days'), 0) AS burned_7d,
  COALESCE(SUM(amount) FILTER (WHERE status = 'executed' AND executed_at > NOW() - INTERVAL '1 day'), 0) AS burned_24h,
  COUNT(*) FILTER (WHERE status = 'pending_confirmation') AS pending_burns
FROM public.burn_events;

-- ============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.burn_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Admins: Full access with service role
CREATE POLICY "Admins full access (service role)" ON public.admins
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Players: Public read, self update
CREATE POLICY "Players public read" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Players self update" ON public.players
  FOR UPDATE USING (wallet_address = auth.jwt() ->> 'wallet_address');

-- NFTs: Public read, owner update
CREATE POLICY "NFTs public read" ON public.nfts
  FOR SELECT USING (true);

CREATE POLICY "NFTs admin write" ON public.nfts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Packages: Public read active
CREATE POLICY "Packages public read active" ON public.packages
  FOR SELECT USING (status = 'active');

CREATE POLICY "Packages admin write" ON public.packages
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Purchases: Own purchases only
CREATE POLICY "Purchases own only" ON public.purchases
  FOR SELECT USING (buyer_wallet = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Purchases admin access" ON public.purchases
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Trades: Public read active, owner write
CREATE POLICY "Trades public read active" ON public.trades
  FOR SELECT USING (status = 'active');

CREATE POLICY "Trades seller write" ON public.trades
  FOR ALL USING (seller_wallet = auth.jwt() ->> 'wallet_address');

-- Notifications: Own only
CREATE POLICY "Notifications own only" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.players 
      WHERE id = notifications.player_id 
      AND wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- Audit logs: Admin read only
CREATE POLICY "Audit logs admin read" ON public.audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Burn events: Public read, admin write
CREATE POLICY "Burns public read" ON public.burn_events
  FOR SELECT USING (true);

CREATE POLICY "Burns admin write" ON public.burn_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 15. HELPER FUNCTIONS
-- ============================================================================

-- Get player by wallet address
CREATE OR REPLACE FUNCTION public.get_player_by_wallet(p_wallet TEXT)
RETURNS public.players AS $$
  SELECT * FROM public.players WHERE wallet_address = p_wallet LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Create or get player
CREATE OR REPLACE FUNCTION public.upsert_player(p_wallet TEXT)
RETURNS public.players AS $$
DECLARE
  v_player public.players;
BEGIN
  INSERT INTO public.players (wallet_address)
  VALUES (p_wallet)
  ON CONFLICT (wallet_address) DO UPDATE
  SET last_activity_at = NOW()
  RETURNING * INTO v_player;
  
  RETURN v_player;
END;
$$ LANGUAGE plpgsql;

-- Get available inventory for package
CREATE OR REPLACE FUNCTION public.get_package_inventory(p_package_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_package public.packages;
BEGIN
  SELECT * INTO v_package FROM public.packages WHERE id = p_package_id;
  
  IF v_package.total_supply IS NULL THEN
    RETURN 999999; -- Unlimited
  END IF;
  
  RETURN v_package.total_supply - v_package.sold_count - v_package.reserved_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate burn amount for purchase
CREATE OR REPLACE FUNCTION public.calculate_burn_amount(p_purchase_id UUID)
RETURNS NUMERIC(78, 0) AS $$
  SELECT unsc_amount FROM public.purchases WHERE id = p_purchase_id;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 16. TRIGGERS FOR STATISTICS
-- ============================================================================

-- Update player stats on purchase completion
CREATE OR REPLACE FUNCTION update_player_purchase_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.players
    SET 
      total_purchases = total_purchases + 1,
      total_spent_sol = total_spent_sol + NEW.package_price_sol,
      first_purchase_at = COALESCE(first_purchase_at, NOW()),
      last_activity_at = NOW()
    WHERE id = NEW.player_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_purchase_complete
  AFTER UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_player_purchase_stats();

-- Update package sales on purchase completion
CREATE OR REPLACE FUNCTION update_package_sales()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.packages
    SET 
      sold_count = sold_count + 1,
      total_revenue_sol = total_revenue_sol + NEW.package_price_sol
    WHERE id = NEW.package_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_purchase_complete_package
  AFTER UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_package_sales();

-- Update player NFT count on delivery
CREATE OR REPLACE FUNCTION update_player_nft_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.item_type = 'nft' THEN
    -- Get player_id from purchase
    UPDATE public.players
    SET total_nfts_owned = total_nfts_owned + 1
    WHERE id = (SELECT player_id FROM public.purchases WHERE id = NEW.purchase_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_delivery_complete
  AFTER UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_player_nft_count();

-- ============================================================================
-- 17. ENABLE REALTIME
-- ============================================================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.nfts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

COMMENT ON TABLE public.admins IS 'Backend admin accounts for NFT platform';
COMMENT ON TABLE public.players IS 'Player accounts linked to Solana wallets';
COMMENT ON TABLE public.nfts IS 'NFT catalog with metadata and ownership';
COMMENT ON TABLE public.packages IS 'Game packages available for purchase';
COMMENT ON TABLE public.purchases IS 'Purchase transactions';
COMMENT ON TABLE public.deliveries IS 'Delivery queue for purchased items';
COMMENT ON TABLE public.burn_events IS 'Token burn event log (deflationary mechanism)';
COMMENT ON TABLE public.trades IS 'P2P NFT marketplace listings';
COMMENT ON TABLE public.notifications IS 'Player notifications';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive admin action logging';
