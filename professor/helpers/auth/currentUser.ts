import { getServerSession } from "next-auth";
import authOptions from "./options";
import prisma from "../prisma/prisma";

// the signed-in user's database row, or null when signed out
export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    return prisma.user.findUnique({ where: { email: session.user.email } });
}
