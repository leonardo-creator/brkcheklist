import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import type { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
  }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not defined');
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_URL is not defined');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials not configured');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) {
          throw new Error('Email ou senha inválidos');
        }

        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Email ou senha inválidos');
        }

        // Atualiza lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Para OAuth (Google), verifica/cria usuário com role apropriado
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Novo usuário OAuth - define role baseado no email
            const isAdmin = user.email === ADMIN_EMAIL;
            await prisma.user.upsert({
              where: { email: user.email },
              update: { lastLoginAt: new Date() },
              create: {
                email: user.email,
                name: user.name,
                image: user.image,
                role: isAdmin ? 'ADMIN' : 'PENDING',
                approvedBy: isAdmin ? 'SYSTEM' : null,
                approvedAt: isAdmin ? new Date() : null,
                emailVerified: new Date(),
              },
            });
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      // Sempre busca role atualizado do banco
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;

            // Atualiza lastLoginAt apenas no primeiro login
            if (user || trigger === 'signIn') {
              await prisma.user.update({
                where: { email: token.email },
                data: { lastLoginAt: new Date() },
              });
            }
          }
        } catch (error) {
          console.error('Error updating token:', error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Se a URL já contém um destino específico, use-a
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Caso contrário, redireciona para dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt', // JWT necessário para Credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  debug: process.env.NODE_ENV === 'development',
});
