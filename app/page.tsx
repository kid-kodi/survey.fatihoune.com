import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Create Professional Surveys in Minutes
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Build, distribute, and analyze surveys with our modern, easy-to-use platform.
            Get started in less than 10 minutes without any technical expertise.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Create Your First Survey</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
