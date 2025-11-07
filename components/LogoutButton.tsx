"use client";

import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ComponentPropsWithRef, useState } from "react";

export const LogoutButton = (props: ComponentPropsWithRef<"button">) => {
   const t = useTranslations('NavUser');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      {...props}
      onClick={() => {
        authClient.signOut(
          {},
          {
            onRequest: () => {
              setIsLoading(true);
            },
            onSuccess: () => {
              setIsLoading(false);
              router.push("/");
              router.refresh();
            },
          },
        );
      }}
    >
      <LogOut className="size-4" />
      {isLoading ? "Loading..." : `${t('sign_out')}`}
    </button>
  );
};