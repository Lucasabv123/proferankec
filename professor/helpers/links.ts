// Page links lead with the record id ("/professors/12-jane-doe") so names containing
// dashes, spaces or a missing prefix can't break the lookup; the slug is only for readability.

function slugify(...parts: (string | null | undefined)[]): string {
    return parts
        .filter(Boolean)
        .join(" ")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function professorPath(professor: { id: number; Prefix?: string | null; Firstname?: string; Lastname?: string }): string {
    const slug = slugify(professor.Prefix, professor.Firstname, professor.Lastname);
    return `/professors/${professor.id}${slug ? `-${slug}` : ""}`;
}

export function coursePath(course: { id: number; name?: string; School?: string }): string {
    const slug = slugify(course.name, course.School);
    return `/courses/${course.id}${slug ? `-${slug}` : ""}`;
}

export function schoolPath(school: string): string {
    return `/schools/${encodeURIComponent(school)}`;
}

// returns the id from "12" or "12-jane-doe", or null for the old name-based links
export function parseIdParam(param: string): number | null {
    const match = /^(\d+)(?:-|$)/.exec(decodeURIComponent(param));
    return match ? parseInt(match[1], 10) : null;
}
