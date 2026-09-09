CREATE TABLE `auth_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`date` text DEFAULT (date('now','+9 hours')) NOT NULL
);
