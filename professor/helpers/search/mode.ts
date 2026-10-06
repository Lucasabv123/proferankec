// Postgres `contains` is case-sensitive unless mode is "insensitive".
// SQLite (used locally, DATABASE_URL="file:...") is already case-insensitive and rejects the mode option.
const isSqlite = (process.env.DATABASE_URL ?? "").startsWith("file:");

export const searchMode = isSqlite ? {} : { mode: "insensitive" as const };
