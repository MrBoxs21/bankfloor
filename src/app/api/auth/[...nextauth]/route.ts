import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/lib/models/user"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectToDatabase()

          const user = await User.findOne({ email: credentials.email })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar?.url || null,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectToDatabase()

          const existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // Create new user from Google profile
            const newUser = new User({
              name: user.name,
              email: user.email,
              avatar: {
                url: user.image || "",
              },
              provider: "google",
              googleId: account.providerAccountId,
            })

            await newUser.save()
          }

          return true
        } catch (error) {
          console.error("Google sign in error:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          await connectToDatabase()
          const dbUser = await User.findOne({ email: user.email })

          if (dbUser) {
            token.id = dbUser._id.toString()
            token.role = dbUser.role
          }
        } catch (error) {
          console.error("JWT callback error:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
