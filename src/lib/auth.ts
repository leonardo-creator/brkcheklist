import NextAuth, { type DefaultSession } from 'next-auth';
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

// Custom adapter to handle user creation with admin auto-approval
const customAdapter = {
  async createUser(user: any) {
    if (!user.email) {
      throw new Error('Email is required to create a user');
    }
    
    const isAdmin = user.email === ADMIN_EMAIL;
    
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name || null,
        image: user.image || null,
        emailVerified: user.emailVerified || null,
        role: isAdmin ? 'ADMIN' : 'PENDING',
        approvedBy: isAdmin ? 'SYSTEM' : null,
        approvedAt: isAdmin ? new Date() : null,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      image: newUser.image,
      emailVerified: newUser.emailVerified,
      role: newUser.role,
    };
  },

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      role: user.role,
    };
  },

  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      role: user.role,
    };
  },

  async updateUser(user: any) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      },
    });
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      image: updatedUser.image,
      emailVerified: updatedUser.emailVerified,
      role: updatedUser.role,
    };
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: customAdapter,
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
    async signIn({ user }) {
      if (!user.email) return false;

      // Para OAuth, permite o login e deixa o adapter criar o usuário
      // Para Credentials, o usuário já existe
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // Atualiza lastLoginAt no primeiro login
        if (user.email) {
          try {
            await prisma.user.update({
              where: { email: user.email },
              data: { lastLoginAt: new Date() },
            });
          } catch (error) {
            console.error('Error updating lastLoginAt:', error);
          }
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
