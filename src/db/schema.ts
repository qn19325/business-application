import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const practice = pgTable("practice", {
    id: uuid().primaryKey(),
    name: text().notNull()
})

export const client = pgTable("client", {
    id: uuid().primaryKey(),
    practiceId: uuid().notNull().references(() => practice.id),
    firstName: text().notNull(),
    lastName: text().notNull(),
    niNumber: text().notNull(),
    email: text().notNull(),
    phoneNumber: text()
})

export const taxReturn = pgTable("tax_return", {
    id: uuid().primaryKey(),
    practiceId: uuid().notNull().references(() => practice.id),
    clientId: uuid().notNull().references(() => client.id),
    taxYear: integer().notNull(),
    regime: text().notNull(),
    status: text().notNull(),
})

export const mtdSubmission = pgTable("mtd_submission", {
    id: uuid().primaryKey(),
    taxReturnId: uuid().notNull().references(() =>  taxReturn.id),
    submissionType: text().notNull(),
    deadline: date().notNull(),
    status: text().notNull()
})

export const checklistItem = pgTable("checklist_item", {
    id: uuid().primaryKey(),
    taxReturnId: uuid().notNull().references(() => taxReturn.id),
    documentType: text().notNull(),
    label: text().notNull(),
    status: text().notNull()
})