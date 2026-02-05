DO $$ BEGIN
 CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin', 'viewer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."burn_status" AS ENUM('pending_confirmation', 'confirmed', 'executed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'processing', 'delivered', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."mint_pool_assembly_status" AS ENUM('pending', 'processing', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."mint_pool_round_status" AS ENUM('pending', 'active', 'computing', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."mint_pool_stake_status" AS ENUM('active', 'withdrawn');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."nft_status" AS ENUM('draft', 'ready', 'minted', 'delivered', 'hidden');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_type" AS ENUM('delivery_complete', 'trade_sold', 'trade_offer', 'purchase_confirmed', 'price_drop', 'new_nft_available', 'system');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."package_status" AS ENUM('active', 'inactive', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'confirmed', 'delivering', 'completed', 'failed', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."slice_earned_via" AS ENUM('hash', 'click', 'stake_bonus');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."trade_status" AS ENUM('active', 'sold', 'cancelled', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text,
	"email" text,
	"password_hash" text,
	"totp_secret" text,
	"totp_enabled" boolean DEFAULT false NOT NULL,
	"backup_codes" text[],
	"role" text DEFAULT 'viewer' NOT NULL,
	"last_login" timestamp with time zone,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"admin_wallet" text,
	"admin_email" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "burn_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid,
	"triggered_by" text NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"token_address" text DEFAULT '7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT' NOT NULL,
	"status" "burn_status" DEFAULT 'pending_confirmation' NOT NULL,
	"initiated_by" uuid,
	"confirmed_by" uuid,
	"initiated_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"burn_transaction" text,
	"executed_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"nft_id" uuid,
	"item_type" text NOT NULL,
	"token_amount" numeric(78, 0),
	"recipient_wallet" text NOT NULL,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"transfer_transaction" text,
	"delivered_at" timestamp with time zone,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mint_pool_assemblies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"nft_id" uuid NOT NULL,
	"slice_ids" uuid[] NOT NULL,
	"status" "mint_pool_assembly_status" DEFAULT 'pending' NOT NULL,
	"transfer_transaction" text,
	"completed_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mint_pool_hash_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"nonce" text NOT NULL,
	"hash" text NOT NULL,
	"leading_zeros" integer NOT NULL,
	"is_valid" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mint_pool_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"hashes_submitted" integer DEFAULT 0 NOT NULL,
	"valid_hashes_submitted" integer DEFAULT 0 NOT NULL,
	"click_mine_count" integer DEFAULT 0 NOT NULL,
	"staked_unsc" numeric(78, 0) DEFAULT '0' NOT NULL,
	"hash_rate_multiplier" numeric(10, 4) DEFAULT '1.0' NOT NULL,
	"effective_shares" numeric(20, 4) DEFAULT '0' NOT NULL,
	"slices_earned" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mint_pool_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_number" integer NOT NULL,
	"status" "mint_pool_round_status" DEFAULT 'pending' NOT NULL,
	"difficulty" integer DEFAULT 4 NOT NULL,
	"duration_seconds" integer DEFAULT 60 NOT NULL,
	"total_hashes_submitted" integer DEFAULT 0 NOT NULL,
	"total_participants" integer DEFAULT 0 NOT NULL,
	"total_slices_awarded" integer DEFAULT 0 NOT NULL,
	"nft_pool_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mint_pool_rounds_round_number_unique" UNIQUE("round_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mint_pool_slices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"round_id" uuid NOT NULL,
	"nft_id" uuid NOT NULL,
	"slice_index" integer NOT NULL,
	"total_slices_required" integer DEFAULT 10 NOT NULL,
	"earned_via" "slice_earned_via" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mint_pool_stakes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"multiplier" numeric(10, 4) DEFAULT '1.0' NOT NULL,
	"status" "mint_pool_stake_status" DEFAULT 'active' NOT NULL,
	"stake_transaction" text,
	"withdraw_transaction" text,
	"staked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_ownership_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nft_id" uuid NOT NULL,
	"from_wallet" text,
	"to_wallet" text NOT NULL,
	"transfer_type" text NOT NULL,
	"transaction_signature" text,
	"price_sol" numeric(20, 9),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nfts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"mint_address" text,
	"mint_transaction" text,
	"minted_at" timestamp with time zone,
	"owner_id" uuid,
	"owner_wallet" text,
	"status" "nft_status" DEFAULT 'draft' NOT NULL,
	"image_url" text,
	"thumbnail_url" text,
	"metadata_uri" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rarity_score" numeric(10, 4) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nfts_mint_address_unique" UNIQUE("mint_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"entity_type" text,
	"entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'standard',
	"price_sol" numeric(20, 9) NOT NULL,
	"unsc_amount" numeric(78, 0) DEFAULT '0' NOT NULL,
	"nft_ids" uuid[] DEFAULT  NOT NULL,
	"total_supply" integer,
	"sold_count" integer DEFAULT 0 NOT NULL,
	"reserved_count" integer DEFAULT 0 NOT NULL,
	"status" "package_status" DEFAULT 'inactive' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sale_starts_at" timestamp with time zone,
	"sale_ends_at" timestamp with time zone,
	"total_revenue_sol" numeric(20, 9) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"display_name" text,
	"email" text,
	"avatar_url" text,
	"total_purchases" integer DEFAULT 0 NOT NULL,
	"total_spent_sol" numeric(20, 9) DEFAULT '0' NOT NULL,
	"total_nfts_owned" integer DEFAULT 0 NOT NULL,
	"total_trades_completed" integer DEFAULT 0 NOT NULL,
	"first_purchase_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid,
	"buyer_wallet" text NOT NULL,
	"package_id" uuid,
	"package_name" text NOT NULL,
	"package_price_sol" numeric(20, 9) NOT NULL,
	"unsc_amount" numeric(78, 0) DEFAULT '0' NOT NULL,
	"nft_ids" uuid[] DEFAULT  NOT NULL,
	"payment_transaction" text,
	"payment_confirmed_at" timestamp with time zone,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nft_id" uuid NOT NULL,
	"seller_id" uuid,
	"seller_wallet" text NOT NULL,
	"price_sol" numeric(20, 9) NOT NULL,
	"description" text,
	"status" "trade_status" DEFAULT 'active' NOT NULL,
	"listed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"buyer_id" uuid,
	"buyer_wallet" text,
	"sold_at" timestamp with time zone,
	"trade_transaction" text,
	"platform_fee_sol" numeric(20, 9) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "burn_events" ADD CONSTRAINT "burn_events_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "burn_events" ADD CONSTRAINT "burn_events_initiated_by_admins_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "burn_events" ADD CONSTRAINT "burn_events_confirmed_by_admins_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_assemblies" ADD CONSTRAINT "mint_pool_assemblies_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_assemblies" ADD CONSTRAINT "mint_pool_assemblies_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_hash_submissions" ADD CONSTRAINT "mint_pool_hash_submissions_round_id_mint_pool_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."mint_pool_rounds"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_hash_submissions" ADD CONSTRAINT "mint_pool_hash_submissions_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_participants" ADD CONSTRAINT "mint_pool_participants_round_id_mint_pool_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."mint_pool_rounds"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_participants" ADD CONSTRAINT "mint_pool_participants_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_slices" ADD CONSTRAINT "mint_pool_slices_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_slices" ADD CONSTRAINT "mint_pool_slices_round_id_mint_pool_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."mint_pool_rounds"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_slices" ADD CONSTRAINT "mint_pool_slices_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mint_pool_stakes" ADD CONSTRAINT "mint_pool_stakes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nft_ownership_history" ADD CONSTRAINT "nft_ownership_history_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_owner_id_players_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_seller_id_players_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trades" ADD CONSTRAINT "trades_buyer_id_players_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_admin" ON "admin_sessions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_token" ON "admin_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admins_wallet" ON "admins" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admins_email" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_admin" ON "audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_time" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_burns_status" ON "burn_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_burns_purchase" ON "burn_events" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_burns_time" ON "burn_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deliveries_purchase" ON "deliveries" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_deliveries_status" ON "deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_assemblies_player" ON "mint_pool_assemblies" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_assemblies_nft" ON "mint_pool_assemblies" USING btree ("nft_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_assemblies_status" ON "mint_pool_assemblies" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_hashes_round" ON "mint_pool_hash_submissions" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_hashes_player" ON "mint_pool_hash_submissions" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_participants_round" ON "mint_pool_participants" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_participants_player" ON "mint_pool_participants" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_rounds_status" ON "mint_pool_rounds" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_rounds_number" ON "mint_pool_rounds" USING btree ("round_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_slices_player" ON "mint_pool_slices" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_slices_nft" ON "mint_pool_slices" USING btree ("nft_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_slices_round" ON "mint_pool_slices" USING btree ("round_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_stakes_player" ON "mint_pool_stakes" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pool_stakes_status" ON "mint_pool_stakes" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ownership_nft" ON "nft_ownership_history" USING btree ("nft_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ownership_to" ON "nft_ownership_history" USING btree ("to_wallet");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ownership_time" ON "nft_ownership_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nfts_status" ON "nfts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nfts_owner" ON "nfts" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nfts_owner_wallet" ON "nfts" USING btree ("owner_wallet");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_nfts_mint" ON "nfts" USING btree ("mint_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_player" ON "notifications" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_time" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_packages_status" ON "packages" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_packages_category" ON "packages" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_players_wallet" ON "players" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_players_activity" ON "players" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_player" ON "purchases" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_wallet" ON "purchases" USING btree ("buyer_wallet");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_package" ON "purchases" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_status" ON "purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchases_time" ON "purchases" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_trades_nft" ON "trades" USING btree ("nft_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_trades_seller" ON "trades" USING btree ("seller_wallet");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_trades_status" ON "trades" USING btree ("status");