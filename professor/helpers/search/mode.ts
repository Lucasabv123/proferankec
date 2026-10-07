// SQLite (used locally, DATABASE_URL="file:...") lacks some Postgres functions, so search falls back to JavaScript there.
export const isSqlite = (process.env.DATABASE_URL ?? "").startsWith("file:");
