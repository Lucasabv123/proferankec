import { PrismaAdapter } from '@next-auth/prisma-adapter'; 
import GoogleProvider from 'next-auth/providers/google';
import prisma from '../prisma/prisma';

const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXT_AUTH_SECRET,
}; 
export default authOptions; 