import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { User } from "@prisma/client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled for MVP
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "survey",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session;

/**
 * Get the current authenticated user with isSysAdmin field
 * Returns null if not authenticated
 * If the user is impersonating another user, returns the impersonated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return null;
    }

    // Fetch full user from database to include isSysAdmin field
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return null;
    }

    // Check if this admin is currently impersonating another user
    if (user.isSysAdmin) {
      const activeImpersonation = await prisma.impersonationSession.findFirst({
        where: {
          adminId: user.id,
          endedAt: null, // Only active impersonations
        },
        orderBy: {
          startedAt: 'desc',
        },
        include: {
          targetUser: true,
        },
      });

      // If there's an active impersonation, return the target user instead
      if (activeImpersonation) {
        return activeImpersonation.targetUser;
      }
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 * Returns the authenticated user
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require sys_admin access - throws if not sys_admin
 * Returns the authenticated sys_admin user (actual user, not impersonated)
 */
export async function requireSysAdmin(): Promise<User> {
  const user = await getActualUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!user.isSysAdmin) {
    throw new Error('Forbidden: sys_admin access required');
  }

  return user;
}

/**
 * Require ownership of a resource - throws if user doesn't own resource
 * sys_admin users bypass this check
 * Returns the authenticated user
 */
export async function requireOwnership(resourceUserId: string): Promise<User> {
  const user = await requireAuth();

  // sys_admin bypass
  if (user.isSysAdmin) {
    return user;
  }

  if (user.id !== resourceUserId) {
    throw new Error('Forbidden');
  }

  return user;
}

/**
 * Get the actual authenticated user (bypassing impersonation)
 * Useful for admin operations that need to know who the real user is
 * Returns null if not authenticated
 */
export async function getActualUser(): Promise<User | null> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return null;
    }

    // Fetch full user from database - this is the actual logged-in user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    return user;
  } catch (error) {
    console.error('Error getting actual user:', error);
    return null;
  }
}

/**
 * Check if the current session is an impersonation
 * Returns the impersonation session if active, null otherwise
 */
export async function getActiveImpersonation() {
  try {
    const actualUser = await getActualUser();

    if (!actualUser || !actualUser.isSysAdmin) {
      return null;
    }

    const activeImpersonation = await prisma.impersonationSession.findFirst({
      where: {
        adminId: actualUser.id,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
      include: {
        admin: true,
        targetUser: true,
      },
    });

    return activeImpersonation;
  } catch (error) {
    console.error('Error checking active impersonation:', error);
    return null;
  }
}
