import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  githubAccessToken: text("github_access_token"), // Encrypted GitHub token
  githubUsername: varchar("github_username"),
  githubId: varchar("github_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  repositoryUrl: varchar("repository_url").notNull(),
  githubRepoId: varchar("github_repo_id"),
  githubOwner: varchar("github_owner"),
  githubRepo: varchar("github_repo"),
  branch: varchar("branch").default("main"),
  framework: varchar("framework"), // Next.js, React, Vue, etc.
  buildCommand: varchar("build_command").default("npm run build"),
  outputDirectory: varchar("output_directory").default("dist"),
  userId: varchar("user_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  customDomain: varchar("custom_domain"),
  sslEnabled: boolean("ssl_enabled").default(false),
  autoDeployEnabled: boolean("auto_deploy_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Deployments table
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  commitHash: varchar("commit_hash").notNull(),
  commitMessage: text("commit_message"),
  branch: varchar("branch").notNull(),
  status: varchar("status").notNull(), // queued, building, success, failed, cancelled
  buildLogs: text("build_logs"),
  deployUrl: varchar("deploy_url"),
  previewUrl: varchar("preview_url"),
  buildTime: integer("build_time"), // in seconds
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Functions table for serverless functions
export const functions = pgTable("functions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  name: varchar("name").notNull(),
  path: varchar("path").notNull(), // e.g., /api/contact
  runtime: varchar("runtime").default("nodejs18.x"),
  handler: varchar("handler").notNull(),
  isActive: boolean("is_active").default(true),
  avgResponseTime: integer("avg_response_time"), // in ms
  invocations: integer("invocations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  date: timestamp("date").notNull(),
  pageViews: integer("page_views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  bandwidth: integer("bandwidth").default(0), // in bytes
  avgLoadTime: integer("avg_load_time").default(0), // in ms
  createdAt: timestamp("created_at").defaultNow(),
});

// Environment Variables table
export const environmentVariables = pgTable("environment_variables", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  key: varchar("key").notNull(),
  value: text("value").notNull(), // encrypted
  isSecret: boolean("is_secret").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team Secrets table
export const teamSecrets = pgTable("team_secrets", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(), // encrypted
  description: text("description"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().optional(),
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
});

export const insertFunctionSchema = createInsertSchema(functions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSecretSchema = createInsertSchema(teamSecrets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Team collaboration and domain management types (for advanced features)
export interface TeamMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  joinedAt: string;
}

export interface Domain {
  id: number;
  domain: string;
  status: 'pending' | 'active' | 'failed';
  sslStatus: 'pending' | 'active' | 'failed';
  createdAt: string;
  verifiedAt?: string;
}
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect & {
  status?: 'success' | 'building' | 'failed' | 'queued';
};
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;
export type InsertFunction = z.infer<typeof insertFunctionSchema>;
export type Function = typeof functions.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type EnvironmentVariable = typeof environmentVariables.$inferSelect;
export type InsertEnvironmentVariable = typeof environmentVariables.$inferInsert;
export type TeamSecret = typeof teamSecrets.$inferSelect;
export type InsertTeamSecret = z.infer<typeof insertTeamSecretSchema>;
