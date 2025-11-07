import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Unsubscribe - Survey Platform',
  description: 'Manage your email preferences',
};

interface UnsubscribePageProps {
  searchParams: Promise<{
    token?: string;
    success?: string;
  }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token;
  const success = params.success === 'true';

  // If already unsubscribed successfully
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Successfully Unsubscribed
          </h1>
          <p className="text-gray-600 mb-6">
            You have been unsubscribed from marketing emails. You will still receive
            important transactional emails related to your account and subscriptions.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Validate token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h1>
          <p className="text-gray-600 mb-6">
            This unsubscribe link is invalid or expired. Please use the link from your
            email or contact support.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Find user by unsubscribe token
  const user = await prisma.user.findUnique({
    where: { unsubscribeToken: token },
    select: {
      id: true,
      email: true,
      name: true,
      emailPreferences: true,
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Token</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find an account associated with this unsubscribe link.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Capture user ID for server action
  const userId = user.id;

  // Handle unsubscribe action
  async function handleUnsubscribe() {
    'use server';

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailPreferences: {
          marketing: false,
          transactional: true,
        },
      },
    });

    redirect(`/unsubscribe?success=true`);
  }

  const currentPreferences = user.emailPreferences as { marketing?: boolean; transactional?: boolean } || {
    marketing: true,
    transactional: true,
  };

  const isAlreadyUnsubscribed = !currentPreferences.marketing;

  if (isAlreadyUnsubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Already Unsubscribed
          </h1>
          <p className="text-gray-600 mb-6">
            You're already unsubscribed from marketing emails. You will only receive
            important transactional emails.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unsubscribe from Emails
          </h1>
          <p className="text-sm text-gray-600">
            Account: <strong>{user.email}</strong>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>What happens when you unsubscribe:</strong>
          </p>
          <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>You'll stop receiving marketing and promotional emails</li>
            <li>You'll still get important transactional emails (receipts, notifications)</li>
            <li>You can resubscribe anytime in your account settings</li>
          </ul>
        </div>

        <form action={handleUnsubscribe}>
          <div className="space-y-3">
            <Button type="submit" variant="destructive" className="w-full">
              Confirm Unsubscribe
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Keep Subscribed</Link>
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Changed your mind?{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact support
          </Link>{' '}
          if you need help managing your email preferences.
        </p>
      </div>
    </div>
  );
}
