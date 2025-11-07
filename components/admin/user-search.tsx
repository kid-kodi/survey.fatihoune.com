"use client";

import { useState, useEffect } from "react";
import { Search, Shield, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserSearchResult } from "@/types/admin";
import { ImpersonationModal } from "./impersonation-modal";

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when debounced query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/admin/users?search=${encodeURIComponent(debouncedQuery)}`
        );

        if (!response.ok) {
          throw new Error("Failed to search users");
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const handleImpersonate = (user: UserSearchResult) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by email, name, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-2">
          {!searchQuery.trim() && (
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Start typing to search for users
              </p>
            </div>
          )}

          {searchQuery.trim() && !isLoading && users.length === 0 && (
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No users found matching "{searchQuery}"
              </p>
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        {user.isSysAdmin && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleImpersonate(user)}
                    disabled={user.isSysAdmin}
                    variant={user.isSysAdmin ? "ghost" : "default"}
                    size="sm"
                  >
                    {user.isSysAdmin ? "Cannot Impersonate Admin" : "Impersonate User"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Impersonation Modal */}
      {selectedUser && (
        <ImpersonationModal
          user={selectedUser}
          open={showModal}
          onOpenChange={setShowModal}
        />
      )}
    </>
  );
}
