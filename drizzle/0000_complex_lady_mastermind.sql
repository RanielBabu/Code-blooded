CREATE TYPE "public"."experiment_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."onset_source" AS ENUM('raf-timestamp', 'performance-now', 'date-now');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('active', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."stimulus_type" AS ENUM('text', 'color', 'image', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."trial_rejection" AS ENUM('premature', 'timeout', 'outlier');--> statement-breakpoint
CREATE TABLE "experiment_versions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"experiment_id" text NOT NULL,
	"version" integer NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" "experiment_status" DEFAULT 'draft' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"trial_count" integer DEFAULT 10 NOT NULL,
	"nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"edges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"author" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" text PRIMARY KEY NOT NULL,
	"author" text,
	"current_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"session_id" text,
	"status" "participant_status" DEFAULT 'active' NOT NULL,
	"completed_experiments" integer DEFAULT 0 NOT NULL,
	"total_trials" integer DEFAULT 0 NOT NULL,
	"avg_reaction_time_ms" integer DEFAULT 0 NOT NULL,
	"accuracy_percent" real DEFAULT 0 NOT NULL,
	"consistency_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "trials" (
	"id" text PRIMARY KEY NOT NULL,
	"participant_id" text NOT NULL,
	"experiment_id" text NOT NULL,
	"trial_number" integer NOT NULL,
	"stimulus_type" "stimulus_type" NOT NULL,
	"stimulus" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"response" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"correct" boolean NOT NULL,
	"reaction_time_ms" integer NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"responded_at" timestamp with time zone NOT NULL,
	"valid" boolean,
	"rejection" "trial_rejection",
	"rejection_detail" text,
	"omission" boolean,
	"onset_source" "onset_source"
);
--> statement-breakpoint
ALTER TABLE "experiment_versions" ADD CONSTRAINT "experiment_versions_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trials" ADD CONSTRAINT "trials_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trials" ADD CONSTRAINT "trials_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "experiment_versions_experiment_version_uk" ON "experiment_versions" USING btree ("experiment_id","version");--> statement-breakpoint
CREATE INDEX "experiment_versions_experiment_id_idx" ON "experiment_versions" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "participants_last_active_at_idx" ON "participants" USING btree ("last_active_at");--> statement-breakpoint
CREATE INDEX "trials_experiment_id_idx" ON "trials" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "trials_participant_id_idx" ON "trials" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "trials_experiment_valid_idx" ON "trials" USING btree ("experiment_id","valid");--> statement-breakpoint
CREATE INDEX "trials_stimulus_type_idx" ON "trials" USING btree ("stimulus_type");