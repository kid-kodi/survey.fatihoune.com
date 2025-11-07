"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ImpersonationBannerProps {
  isImpersonating: boolean;
  targetUserName?: string;
  isBeingImpersonated?: boolean;
}

export function ImpersonationBanner({
  isImpersonating,
  targetUserName,
  isBeingImpersonated,
}: ImpersonationBannerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStopImpersonation = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/stop-impersonation", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to stop impersonation");
      }

      // Redirect to admin dashboard and refresh
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Error stopping impersonation:", error);
      alert("Failed to stop impersonation. Please try again.");
      setIsLoading(false);
    }
  };

  // Banner for impersonated user (they see this)
  if (isBeingImpersonated) {
    return (
      <Alert className="rounded-none border-x-0 border-t-0 border-b-2 border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800 font-medium">
          An administrator is currently viewing your account for support purposes.
        </AlertDescription>
      </Alert>
    );
  }

  // Banner for admin who is impersonating
  if (isImpersonating && targetUserName) {
    return (
      <Alert className="rounded-none border-x-0 border-t-0 border-b-2 border-orange-500 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between text-orange-800 font-medium">
          <span>Viewing as <strong>{targetUserName}</strong></span>
          <Button
            onClick={handleStopImpersonation}
            disabled={isLoading}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Stop Impersonation
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
