import { Prisma } from "@prisma/client";
import prisma from "../prisma/prisma";
import { isSqlite } from "./mode";

// Accent- and case-insensitive text search, so "perez" finds "Pérez" and "calculo" finds "Cálculo".
// On Postgres the folding runs in SQL with the built-in translate(), which needs no extension
// (unaccent would have to be installed on RDS first). SQLite has no translate(), so locally the
// rows are folded in JavaScript instead.

const ACCENTED = "ÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑÇáàâäãéèêëíìîïóòôöõúùûüñç";
const PLAIN = "AAAAAEEEEIIIIOOOOOUUUUNCaaaaaeeeeiiiiooooouuuunc";

// lowercase without accents: "Idrovo Pérez" -> "idrovo perez"
export function foldText(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function searchWords(query: string): string[] {
    return foldText(query).trim().split(/\s+/).filter(Boolean);
}

// the searchable columns of each table; identifiers come only from this list, never from input
const searchable = {
    Professor: { model: "professor", columns: ["Firstname", "Lastname", "Prefix", "displayName"], order: ["Lastname", "Firstname"] },
    Course: { model: "course", columns: ["name", "code"], order: ["code", "name"] },
    School: { model: "school", columns: ["name", "key"], order: ["name"] },
} as const;

export type SearchTable = keyof typeof searchable;

function fold(column: string): Prisma.Sql {
    return Prisma.sql`lower(translate(${Prisma.raw(`"${column}"`)}, ${ACCENTED}, ${PLAIN}))`;
}

function escapeLike(word: string): string {
    return word.replace(/[\\%_]/g, "\\$&");
}

// Ids of the rows where every word appears in at least one searchable column, so
// "jane doe" and "doe jane" both match. Returns null when the query has no words (no filter).
export async function findMatchingIds(
    table: SearchTable,
    query: string,
    options: { schoolId?: number; limit?: number } = {},
): Promise<number[] | null> {
    const words = searchWords(query);
    if (words.length === 0) return null;
    const { model, columns, order } = searchable[table];

    if (isSqlite) {
        const rows: Record<string, any>[] = await (prisma as any)[model].findMany({
            where: options.schoolId === undefined ? {} : { schoolId: options.schoolId },
            select: Object.fromEntries([["id", true], ...columns.map((c) => [c, true])]),
            orderBy: order.map((c) => ({ [c]: "asc" })),
        });
        const ids = rows
            .filter((row) => {
                const values = columns.map((c) => foldText(row[c] ?? ""));
                return words.every((word) => values.some((value) => value.includes(word)));
            })
            .map((row) => row.id as number);
        return options.limit === undefined ? ids : ids.slice(0, options.limit);
    }

    const conditions = words.map((word) => {
        const pattern = `%${escapeLike(word)}%`;
        return Prisma.sql`(${Prisma.join(columns.map((c) => Prisma.sql`${fold(c)} LIKE ${pattern}`), " OR ")})`;
    });
    if (options.schoolId !== undefined) conditions.push(Prisma.sql`"schoolId" = ${options.schoolId}`);

    const rows = await prisma.$queryRaw<{ id: number }[]>`
        SELECT "id" FROM ${Prisma.raw(`"${table}"`)}
        WHERE ${Prisma.join(conditions, " AND ")}
        ORDER BY ${Prisma.raw(order.map((c) => `"${c}"`).join(", "))}
        ${options.limit === undefined ? Prisma.empty : Prisma.sql`LIMIT ${options.limit}`}`;
    return rows.map((row) => row.id);
}

// a Prisma `where` fragment for the matching rows, or {} when the query is blank
export async function matchingIdsFilter(table: SearchTable, query: string, schoolId?: number) {
    const ids = await findMatchingIds(table, query, { schoolId });
    return ids === null ? {} : { id: { in: ids } };
}
