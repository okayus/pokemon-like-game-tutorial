CREATE TABLE `player_inventory` (
	`player_id` text NOT NULL,
	`item_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`acquired_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_money` (
	`player_id` text PRIMARY KEY NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position_x` integer DEFAULT 10 NOT NULL,
	`position_y` integer DEFAULT 7 NOT NULL,
	`direction` text DEFAULT 'down' NOT NULL,
	`sprite` text DEFAULT 'player.png' NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `item_master` (
	`item_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`effect_type` text NOT NULL,
	`effect_value` integer DEFAULT 0 NOT NULL,
	`buy_price` integer DEFAULT 0 NOT NULL,
	`sell_price` integer DEFAULT 0 NOT NULL,
	`usable` integer DEFAULT 1 NOT NULL,
	`max_stack` integer DEFAULT 99 NOT NULL,
	`description` text NOT NULL,
	`icon_url` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_item_category` ON `item_master` (`category`);--> statement-breakpoint
CREATE TABLE `owned_pokemon` (
	`pokemon_id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`species_id` integer NOT NULL,
	`nickname` text,
	`level` integer DEFAULT 1 NOT NULL,
	`current_hp` integer NOT NULL,
	`caught_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`species_id`) REFERENCES `pokemon_master`(`species_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_owned_pokemon_player` ON `owned_pokemon` (`player_id`);--> statement-breakpoint
CREATE TABLE `player_party` (
	`player_id` text NOT NULL,
	`position` integer NOT NULL,
	`pokemon_id` text NOT NULL,
	PRIMARY KEY(`player_id`, `position`),
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pokemon_id`) REFERENCES `owned_pokemon`(`pokemon_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pokemon_master` (
	`species_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`hp` integer NOT NULL,
	`attack` integer NOT NULL,
	`defense` integer NOT NULL,
	`sprite_url` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pokemon_species` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`hp` integer NOT NULL,
	`attack` integer NOT NULL,
	`defense` integer NOT NULL,
	`speed` integer NOT NULL,
	`type1` text NOT NULL,
	`type2` text,
	`sprite` text NOT NULL
);
