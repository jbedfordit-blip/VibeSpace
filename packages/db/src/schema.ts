import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  real,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

export const creators = pgTable('creators', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  tier: varchar('tier', { length: 50 }).notNull().default('free'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const spaces = pgTable('spaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  creator_id: uuid('creator_id')
    .notNull()
    .references(() => creators.id),
  title: varchar('title', { length: 200 }).notNull(),
  scene_config_json: jsonb('scene_config_json').notNull(),
  published: boolean('published').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').default(''),
  price: real('price').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  source_url: text('source_url'),
  destination_url: text('destination_url').notNull(),
  redirect_url: text('redirect_url'),
  image_url: text('image_url'),
  raw_image_path: text('raw_image_path'),
  sprite_url: text('sprite_url'),
  shadow_url: text('shadow_url'),
  affiliate_status: varchar('affiliate_status', { length: 20 })
    .notNull()
    .default('unmatched'),
  commission_rate: real('commission_rate'),
  creator_id: uuid('creator_id')
    .notNull()
    .references(() => creators.id),
  space_id: uuid('space_id').references(() => spaces.id),
  slot_id: varchar('slot_id', { length: 100 }),
  pipeline_status: varchar('pipeline_status', { length: 20 })
    .notNull()
    .default('pending'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const clicks = pgTable('clicks', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id')
    .notNull()
    .references(() => products.id),
  space_id: uuid('space_id')
    .notNull()
    .references(() => spaces.id),
  creator_id: uuid('creator_id')
    .notNull()
    .references(() => creators.id),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  user_agent: text('user_agent').default(''),
  referrer: text('referrer').default(''),
});

export const pipeline_jobs = pgTable('pipeline_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id')
    .notNull()
    .references(() => products.id),
  stage: varchar('stage', { length: 30 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('queued'),
  error_message: text('error_message'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const furniture = pgTable('furniture', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  sprite_url: text('sprite_url').notNull(),
  shadow_url: text('shadow_url'),
  slot_schema_json: jsonb('slot_schema_json'),
});

export const affiliate_domains = pgTable('affiliate_domains', {
  domain: varchar('domain', { length: 255 }).primaryKey(),
  network: varchar('network', { length: 50 }).notNull(),
  program_id: varchar('program_id', { length: 100 }),
  commission_rate: real('commission_rate'),
});
