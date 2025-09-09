/**
 * Schema bazy danych dla systemu rezerwacji
 */
import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";
import { users } from "./auth";

// Locations table
export const locations = sqliteTable("locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").$default(() => new Date().toISOString()),
  updatedAt: text("updated_at").$default(() => new Date().toISOString()),
});

// Rooms table
export const rooms = sqliteTable("rooms", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  locationId: text("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  serviceTypes: text("service_types").notNull().default("[]"), // JSON array as string
  capacity: integer("capacity").notNull().default(1),
  equipment: text("equipment").default("[]"), // JSON array as string
  createdAt: text("created_at").$default(() => new Date().toISOString()),
  updatedAt: text("updated_at").$default(() => new Date().toISOString()),
});

// Employees table
export const employees = sqliteTable("employees", {
  id: text("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  employeeType: text("employee_type", {
    enum: ["physiotherapist", "personal_trainer"],
  }).notNull(),
  createdAt: text("created_at").$default(() => new Date().toISOString()),
  updatedAt: text("updated_at").$default(() => new Date().toISOString()),
});

// Employee locations junction table
export const employeeLocations = sqliteTable("employee_locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  locationId: text("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  hourlyRate: real("hourly_rate").notNull().default(0),
  createdAt: text("created_at").$default(() => new Date().toISOString()),
});

// Reservations table
export const reservations = sqliteTable("reservations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  serviceType: text("service_type", {
    enum: ["physiotherapy", "personal_training", "other"],
  }).notNull(),
  startTime: text("start_time").notNull(), // ISO string
  endTime: text("end_time").notNull(), // ISO string
  basePrice: real("base_price").notNull(),
  finalPrice: real("final_price").notNull(),
  isDeadHour: integer("is_dead_hour", { mode: "boolean" }).default(false),
  status: text("status", {
    enum: ["confirmed", "cancelled", "completed"],
  }).default("confirmed"),
  notes: text("notes"),
  createdAt: text("created_at").$default(() => new Date().toISOString()),
  updatedAt: text("updated_at").$default(() => new Date().toISOString()),
});

// Pricing configuration table
export const pricingConfig = sqliteTable("pricing_config", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  deadHoursStart: integer("dead_hours_start").notNull().default(8),
  deadHoursEnd: integer("dead_hours_end").notNull().default(16),
  deadHourDiscount: real("dead_hour_discount").notNull().default(0.2),
  baseRatePhysiotherapy: real("base_rate_physiotherapy").notNull().default(150),
  baseRatePersonalTraining: real("base_rate_personal_training")
    .notNull()
    .default(120),
  baseRateOther: real("base_rate_other").notNull().default(100),
  weekdayMultiplier: real("weekday_multiplier").notNull().default(1.0),
  weekendMultiplier: real("weekend_multiplier").notNull().default(1.2),
  createdAt: text("created_at").$default(() => new Date().toISOString()),
  updatedAt: text("updated_at").$default(() => new Date().toISOString()),
});

// Relations
export const profilesRelations = relations(users, ({ one, many }) => ({
  user: one(users, {
    fields: [users.id],
    references: [users.id],
  }),
  ownedLocations: many(locations),
  employee: one(employees),
  pricingConfig: one(pricingConfig),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  owner: one(users, {
    fields: [locations.ownerId],
    references: [users.id],
  }),
  rooms: many(rooms),
  employeeLocations: many(employeeLocations),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  location: one(locations, {
    fields: [rooms.locationId],
    references: [locations.id],
  }),
  reservations: many(reservations),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  profile: one(users, {
    fields: [employees.id],
    references: [users.id],
  }),
  employeeLocations: many(employeeLocations),
  reservations: many(reservations),
}));

export const employeeLocationsRelations = relations(
  employeeLocations,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeLocations.employeeId],
      references: [employees.id],
    }),
    location: one(locations, {
      fields: [employeeLocations.locationId],
      references: [locations.id],
    }),
  })
);

export const reservationsRelations = relations(reservations, ({ one }) => ({
  employee: one(employees, {
    fields: [reservations.employeeId],
    references: [employees.id],
  }),
  room: one(rooms, {
    fields: [reservations.roomId],
    references: [rooms.id],
  }),
}));

export const pricingConfigRelations = relations(pricingConfig, ({ one }) => ({
  owner: one(users, {
    fields: [pricingConfig.ownerId],
    references: [users.id],
  }),
}));
