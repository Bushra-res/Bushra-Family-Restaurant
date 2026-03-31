import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from "@/lib/db";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {},
            async authorize(credentials) {
                const { email, password } = credentials;

                try {
                    if (!process.env.MONGODB_URI) {
                        console.error("❌ AUTH ERROR: MONGODB_URI is missing from environment variables.");
                        return null;
                    }

                    const user = await db.findOne('users', { email: email.toLowerCase() });

                    if (!user) {
                        console.warn(`⚠️ AUTH WARNING: Login failed. User with email ${email} NOT FOUND in database.`);
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        console.warn(`⚠️ AUTH WARNING: Login failed. Incorrect password for user: ${email}`);
                        return null;
                    }

                    console.log(`✅ AUTH SUCCESS: User logged in: ${email}`);
                    return user;
                } catch (error) {
                    console.error("❌ AUTH CRITICAL ERROR: ", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user._id;
                token.role = user.role;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
