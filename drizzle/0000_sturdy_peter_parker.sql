CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`title` text NOT NULL,
	`author` text,
	`total_pages` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `books_deleted_at_idx` ON `books` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`name` text NOT NULL,
	`level` text NOT NULL,
	`color` integer DEFAULT 0 NOT NULL,
	`emoji` text DEFAULT '📚' NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `groups_deleted_at_idx` ON `groups` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `point_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`student_id` text NOT NULL,
	`rule_id` text,
	`title` text NOT NULL,
	`points` integer NOT NULL,
	`date` text NOT NULL,
	`note` text,
	`source` text DEFAULT 'manual' NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_id`) REFERENCES `point_rules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `point_events_student_date_idx` ON `point_events` (`student_id`,`date`);--> statement-breakpoint
CREATE INDEX `point_events_date_idx` ON `point_events` (`date`);--> statement-breakpoint
CREATE INDEX `point_events_student_id_idx` ON `point_events` (`student_id`);--> statement-breakpoint
CREATE INDEX `point_events_deleted_at_idx` ON `point_events` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `point_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`name` text NOT NULL,
	`points` integer NOT NULL,
	`category` text NOT NULL,
	`icon` text DEFAULT '⭐' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `point_rules_deleted_at_idx` ON `point_rules` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `reading_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`student_id` text NOT NULL,
	`book_id` text NOT NULL,
	`date` text NOT NULL,
	`from_page` integer NOT NULL,
	`to_page` integer NOT NULL,
	`pages_read` integer NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reading_logs_student_date_idx` ON `reading_logs` (`student_id`,`date`);--> statement-breakpoint
CREATE INDEX `reading_logs_student_id_idx` ON `reading_logs` (`student_id`);--> statement-breakpoint
CREATE INDEX `reading_logs_deleted_at_idx` ON `reading_logs` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`name` text NOT NULL,
	`description` text,
	`icon` text DEFAULT '🏆' NOT NULL,
	`scope` text NOT NULL,
	`kind` text NOT NULL,
	`target_points` integer,
	`rank_top` integer,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rewards_deleted_at_idx` ON `rewards` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_books` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`student_id` text NOT NULL,
	`book_id` text NOT NULL,
	`current_page` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'reading' NOT NULL,
	`started_on` text,
	`finished_on` text,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `student_books_student_id_idx` ON `student_books` (`student_id`);--> statement-breakpoint
CREATE INDEX `student_books_book_id_idx` ON `student_books` (`book_id`);--> statement-breakpoint
CREATE INDEX `student_books_deleted_at_idx` ON `student_books` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`group_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`avatar` text,
	`grade` text,
	`note` text,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `students_group_id_idx` ON `students` (`group_id`);--> statement-breakpoint
CREATE INDEX `students_deleted_at_idx` ON `students` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `terms` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`deleted_at` text,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `terms_deleted_at_idx` ON `terms` (`deleted_at`);--> statement-breakpoint
-- Kısmi benzersiz indeksler (Drizzle API desteklemediği için elle eklendi)
-- student_books: (student_id, book_id) benzersiz, yalnızca deleted_at NULL iken
CREATE UNIQUE INDEX `student_books_student_book_active_uidx`
  ON `student_books` (`student_id`, `book_id`)
  WHERE `deleted_at` IS NULL;
--> statement-breakpoint
-- point_events: (student_id, date) benzersiz, yalnızca source='reading' ve deleted_at NULL iken
CREATE UNIQUE INDEX `point_events_reading_student_date_uidx`
  ON `point_events` (`student_id`, `date`)
  WHERE `source` = 'reading' AND `deleted_at` IS NULL;