CREATE TABLE `audit_event` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`payload_json` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_event` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_event` (`created_at`);--> statement-breakpoint
CREATE TABLE `claim` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`property_unit_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`evidence` text,
	`created_at` text NOT NULL,
	`decided_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `claim_user_unit_idx` ON `claim` (`user_id`,`property_unit_id`);--> statement-breakpoint
CREATE INDEX `claim_status_idx` ON `claim` (`status`);--> statement-breakpoint
CREATE INDEX `claim_user_idx` ON `claim` (`user_id`);--> statement-breakpoint
CREATE TABLE `consent_event` (
	`id` text PRIMARY KEY NOT NULL,
	`session_key` text NOT NULL,
	`choice` text NOT NULL,
	`policy_version` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `consent_created_idx` ON `consent_event` (`created_at`);--> statement-breakpoint
CREATE TABLE `dataset` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`publisher` text NOT NULL,
	`license` text NOT NULL,
	`license_url` text,
	`source_url` text NOT NULL,
	`fetched_at` text NOT NULL,
	`reference_date` text,
	`row_count` integer DEFAULT 0 NOT NULL,
	`checksum` text,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `market_stat` (
	`id` text PRIMARY KEY NOT NULL,
	`period` text NOT NULL,
	`region_code` text NOT NULL,
	`municipality_code` text,
	`kind` text NOT NULL,
	`price_band` text,
	`count` integer DEFAULT 0 NOT NULL,
	`dataset_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `market_stat_region_period_idx` ON `market_stat` (`region_code`,`period`,`kind`);--> statement-breakpoint
CREATE INDEX `market_stat_muni_idx` ON `market_stat` (`municipality_code`,`period`,`kind`);--> statement-breakpoint
CREATE TABLE `newsletter_subscriber` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`consent_at` text NOT NULL,
	`source` text NOT NULL,
	`unsubscribe_token` text NOT NULL,
	`unsubscribed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_email_idx` ON `newsletter_subscriber` (`email`);--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`to_email` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `outbox_status_idx` ON `outbox` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `page_view` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`referrer` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `page_view_created_idx` ON `page_view` (`created_at`);--> statement-breakpoint
CREATE INDEX `page_view_path_idx` ON `page_view` (`path`);--> statement-breakpoint
CREATE TABLE `premarket_interest` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'nouveau' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `interest_listing_idx` ON `premarket_interest` (`listing_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `premarket_listing` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`property_unit_id` text NOT NULL,
	`asking_price_cents` integer NOT NULL,
	`horizon` text NOT NULL,
	`description` text NOT NULL,
	`visibility` text DEFAULT 'acheteurs_verifies' NOT NULL,
	`status` text DEFAULT 'actif' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `premarket_user_idx` ON `premarket_listing` (`user_id`);--> statement-breakpoint
CREATE INDEX `premarket_status_idx` ON `premarket_listing` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `property_unit` (
	`id` text PRIMARY KEY NOT NULL,
	`municipality_code` text NOT NULL,
	`matricule` text NOT NULL,
	`umv` text,
	`cubf` text,
	`cubf_label` text,
	`property_type` text DEFAULT 'autre' NOT NULL,
	`addr_no` text,
	`addr_street` text,
	`addr_street_norm` text,
	`addr_suite` text,
	`land_area_m2` real,
	`frontage_m` real,
	`year_built` integer,
	`floors` real,
	`value_land_cents` integer DEFAULT 0 NOT NULL,
	`value_building_cents` integer DEFAULT 0 NOT NULL,
	`value_total_cents` integer DEFAULT 0 NOT NULL,
	`value_prior_cents` integer,
	`market_ref_date` text,
	`roll_year` integer NOT NULL,
	`source_url` text NOT NULL,
	`dataset_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `property_unit_matricule_idx` ON `property_unit` (`municipality_code`,`matricule`);--> statement-breakpoint
CREATE INDEX `property_unit_comps_idx` ON `property_unit` (`municipality_code`,`umv`,`cubf`);--> statement-breakpoint
CREATE INDEX `property_unit_street_idx` ON `property_unit` (`addr_street_norm`,`addr_no`);--> statement-breakpoint
CREATE INDEX `property_unit_umv_idx` ON `property_unit` (`umv`);--> statement-breakpoint
CREATE TABLE `session` (
	`id_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	`user_agent` text
);
--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_exp_idx` ON `session` (`expires_at`);--> statement-breakpoint
CREATE TABLE `territory` (
	`code_geo` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`level` text NOT NULL,
	`parent_code` text,
	`slug` text NOT NULL,
	`population` integer
);
--> statement-breakpoint
CREATE INDEX `territory_level_name_idx` ON `territory` (`level`,`name`);--> statement-breakpoint
CREATE INDEX `territory_parent_idx` ON `territory` (`parent_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `territory_slug_idx` ON `territory` (`slug`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'owner' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `valuation_snapshot` (
	`id` text PRIMARY KEY NOT NULL,
	`property_unit_id` text NOT NULL,
	`estimate_cents` integer NOT NULL,
	`low_cents` integer NOT NULL,
	`high_cents` integer NOT NULL,
	`confidence` text NOT NULL,
	`comparables_count` integer NOT NULL,
	`model_version` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `valuation_unit_idx` ON `valuation_snapshot` (`property_unit_id`,`created_at`);