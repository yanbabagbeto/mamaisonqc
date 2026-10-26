CREATE TABLE `buyer_waitlist` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `buyer_waitlist_created_idx` ON `buyer_waitlist` (`created_at`);--> statement-breakpoint
CREATE INDEX `buyer_waitlist_email_idx` ON `buyer_waitlist` (`email`);--> statement-breakpoint
CREATE TABLE `notification_pref` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_pref_user_key_idx` ON `notification_pref` (`user_id`,`key`);--> statement-breakpoint
CREATE TABLE `saved_listing` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saved_listing_user_idx` ON `saved_listing` (`user_id`,`listing_id`);--> statement-breakpoint
CREATE INDEX `saved_listing_listing_idx` ON `saved_listing` (`listing_id`);--> statement-breakpoint
ALTER TABLE `property_unit` ADD `lat` real;--> statement-breakpoint
ALTER TABLE `property_unit` ADD `lon` real;