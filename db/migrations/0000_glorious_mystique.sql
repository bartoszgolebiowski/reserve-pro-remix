CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_session_token_unique` ON `sessions` (`session_token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`role` text DEFAULT 'client' NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `employee_locations` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`location_id` text NOT NULL,
	`hourly_rate` real DEFAULT 0 NOT NULL,
	`created_at` text,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_type` text NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pricing_config` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`dead_hours_start` integer DEFAULT 8 NOT NULL,
	`dead_hours_end` integer DEFAULT 16 NOT NULL,
	`dead_hour_discount` real DEFAULT 0.2 NOT NULL,
	`base_rate_physiotherapy` real DEFAULT 150 NOT NULL,
	`base_rate_personal_training` real DEFAULT 120 NOT NULL,
	`base_rate_other` real DEFAULT 100 NOT NULL,
	`weekday_multiplier` real DEFAULT 1 NOT NULL,
	`weekend_multiplier` real DEFAULT 1.2 NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pricing_config_owner_id_unique` ON `pricing_config` (`owner_id`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`room_id` text NOT NULL,
	`client_name` text NOT NULL,
	`client_email` text NOT NULL,
	`client_phone` text NOT NULL,
	`service_type` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`base_price` real NOT NULL,
	`final_price` real NOT NULL,
	`is_dead_hour` integer DEFAULT false,
	`status` text DEFAULT 'confirmed',
	`notes` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location_id` text NOT NULL,
	`service_types` text DEFAULT '[]' NOT NULL,
	`capacity` integer DEFAULT 1 NOT NULL,
	`equipment` text DEFAULT '[]',
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
