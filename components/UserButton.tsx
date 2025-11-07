"use client";

import { authClient } from "@/lib/auth-client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

import { useMedia } from "react-use";
import { User } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";


export default function UserButton() {
  const session = authClient.useSession();

  const user = session.data?.user;

  const isMobile = useMedia("(max-width: 768px)");
  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={"border-orange-500 bg-orange-50 dark:bg-orange-950"}
            >
              {isMobile ? (
                user?.image ? (
                  <img
                    src={user.image}
                    alt="Avatar"
                    className="size-4 rounded-full object-cover"
                  />
                ) : (
                  <User className="size-4" />
                )
              ) : (
                <div className="flex items-center gap-2">
                  {user?.image && (
                    <img
                      src={user.image}
                      alt="Avatar"
                      className="size-4 rounded-full object-cover"
                    />
                  )}
                  {user.name || user.email}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="size-4" />
                Account
              </Link>
            </DropdownMenuItem>
            
            
            
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="w-full">
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div>Login</div>
      )}
    </>
  )
}
