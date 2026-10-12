import nodemailer from "nodemailer";
import prisma from "../prisma/prisma";
import { professorName } from "../links";
import { CleanSubmission } from "./submissions";

// Emails the admin when a student suggests a professor or course, through Amazon SES's SMTP
// endpoint. Turned off unless SUGGESTION_EMAIL_TO and the SES_SMTP_* variables are set.
// Never throws: a failed email must not fail the student's suggestion.

const SEND_TIMEOUT_MS = 8000;

function mailConfig() {
    const to = process.env.SUGGESTION_EMAIL_TO;
    const user = process.env.SES_SMTP_USER;
    const pass = process.env.SES_SMTP_PASSWORD;
    if (!to || !user || !pass) return null;
    return {
        to,
        from: process.env.SUGGESTION_EMAIL_FROM || to,
        host: process.env.SES_SMTP_HOST || "email-smtp.us-east-2.amazonaws.com",
        user,
        pass,
    };
}

async function describe(s: CleanSubmission) {
    const [school, professor, course] = await Promise.all([
        prisma.school.findUnique({ where: { id: s.schoolId } }),
        s.professorId ? prisma.professor.findUnique({ where: { id: s.professorId } }) : null,
        s.courseId ? prisma.course.findUnique({ where: { id: s.courseId } }) : null,
    ]);
    const professorLine = professor
        ? `${professor.displayName || professorName(professor)} (already listed)`
        : `${s.firstName} ${s.lastName} (new)`;
    const courseLine = course
        ? `${course.code ? `${course.code} · ` : ""}${course.name} (already listed)`
        : `${s.courseCode ? `${s.courseCode} · ` : ""}${s.courseName} (new)${s.department ? `, ${s.department}` : ""}`;
    return { school: school?.name ?? "", professorLine, courseLine };
}

export async function notifyNewSubmission(s: CleanSubmission, studentEmail: string | null | undefined) {
    const config = mailConfig();
    if (!config) return;
    try {
        const d = await describe(s);
        const site = (process.env.NEXTAUTH_URL || "").replace(/\/+$/, "");
        const text = [
            `A student suggested a professor or course on Profe Rank.`,
            ``,
            `School: ${d.school}`,
            `Professor: ${d.professorLine}`,
            `Course: ${d.courseLine}`,
            s.note ? `Note: ${s.note}` : null,
            studentEmail ? `From: ${studentEmail}` : null,
            ``,
            `Approve or reject it at ${site}/admin`,
        ].filter((line) => line !== null).join("\n");

        const transport = nodemailer.createTransport({
            host: config.host,
            port: 587,
            auth: { user: config.user, pass: config.pass },
            connectionTimeout: SEND_TIMEOUT_MS,
            greetingTimeout: SEND_TIMEOUT_MS,
            socketTimeout: SEND_TIMEOUT_MS,
        });
        await transport.sendMail({
            from: `Profe Rank <${config.from}>`,
            to: config.to,
            subject: `New suggestion: ${d.professorLine.replace(/ \(.*\)$/, "")} · ${d.school}`,
            text,
        });
    } catch (err) {
        console.error("suggestion email failed", err);
    }
}
