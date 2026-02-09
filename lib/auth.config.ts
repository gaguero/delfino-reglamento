import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data

        // Check email domain restriction
        const isAllowedEmail =
          email.endsWith('@delfino.cr') ||
          email === 'gagueromesen@gmail.com'

        if (!isAllowedEmail) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await compare(password, user.passwordHash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnLogin = nextUrl.pathname === '/admin/login'

      // Allow access to login page for everyone
      if (isOnLogin) {
        // If already logged in, redirect to dashboard
        if (isLoggedIn) {
          return Response.redirect(new URL('/admin/dashboard', nextUrl))
        }
        // Allow unauthenticated users to see login page
        return true
      }

      // For other admin pages, require login
      if (isOnAdmin) {
        return isLoggedIn
      }

      // Allow all other pages
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  trustHost: true,
} satisfies NextAuthConfig
