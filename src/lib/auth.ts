import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import * as bcrypt from 'bcryptjs'
import prisma from './prisma'
import logger from './logger'
import { loginSchema } from './validators'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/dashboard',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const { email, password } = loginSchema.parse(credentials)

          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user || !user.password) {
            logger.warn({ email }, 'Login failed: user not found or no password set')
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            logger.warn({ email }, 'Login failed: invalid password')
            return null
          }

          logger.info({ userId: user.id, email }, 'User logged in successfully')

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          logger.error({ error }, 'Error during authentication')
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image

        // Fetch role and credits
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, credits: true },
        })

        if (dbUser) {
          token.role = dbUser.role
          token.credits = dbUser.credits
        }
      }

      // Update credits on every request
      if (trigger === 'update' || !token.credits) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { credits: true, role: true },
        })

        if (dbUser) {
          token.credits = dbUser.credits
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.credits = token.credits as number
      }
      return session
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        logger.info({ userId: user.id, email: user.email }, 'New user signed up')
        // Send welcome email handled in the signup API route
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
