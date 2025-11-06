"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: string;
  memberCount: number;
  surveyCount: number;
  createdAt: string;
  updatedAt: string;
};

type OrganizationContextType = {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isPersonalWorkspace: boolean;
  isLoading: boolean;
  error: string | null;
  setCurrentOrganization: (org: Organization | null) => void;
  switchToPersonalWorkspace: () => void;
  refreshOrganizations: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const STORAGE_KEY = "current-organization-id";
const PERSONAL_WORKSPACE_KEY = "personal";

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [isPersonalWorkspace, setIsPersonalWorkspace] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizations from API
  const fetchOrganizations = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch("/api/organizations");

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      const data = await response.json();
      setOrganizations(data.organizations);

      // Restore previous selection from localStorage
      const savedOrgId = localStorage.getItem(STORAGE_KEY);

      if (savedOrgId === PERSONAL_WORKSPACE_KEY) {
        // User was in personal workspace
        setIsPersonalWorkspace(true);
        setCurrentOrganizationState(null);
      } else if (savedOrgId) {
        // Try to find and restore the saved organization
        const savedOrg = data.organizations.find((org: Organization) => org.id === savedOrgId);
        if (savedOrg) {
          setCurrentOrganizationState(savedOrg);
          setIsPersonalWorkspace(false);
        } else {
          // Saved org no longer exists, default to personal workspace
          setIsPersonalWorkspace(true);
          setCurrentOrganizationState(null);
          localStorage.setItem(STORAGE_KEY, PERSONAL_WORKSPACE_KEY);
        }
      } else {
        // No saved preference, default to personal workspace
        setIsPersonalWorkspace(true);
        setCurrentOrganizationState(null);
        localStorage.setItem(STORAGE_KEY, PERSONAL_WORKSPACE_KEY);
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(err instanceof Error ? err.message : "Failed to load organizations");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Fetch organizations when session is available
  useEffect(() => {
    if (session?.user) {
      fetchOrganizations();
    }
  }, [session, fetchOrganizations]);

  // Set current organization and persist to localStorage
  const setCurrentOrganization = useCallback((org: Organization | null) => {
    setCurrentOrganizationState(org);
    setIsPersonalWorkspace(false);

    if (org) {
      localStorage.setItem(STORAGE_KEY, org.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Switch to personal workspace
  const switchToPersonalWorkspace = useCallback(() => {
    setCurrentOrganizationState(null);
    setIsPersonalWorkspace(true);
    localStorage.setItem(STORAGE_KEY, PERSONAL_WORKSPACE_KEY);
  }, []);

  // Refresh organizations (useful after creating new org)
  const refreshOrganizations = useCallback(async () => {
    await fetchOrganizations();
  }, [fetchOrganizations]);

  const value: OrganizationContextType = {
    organizations,
    currentOrganization,
    isPersonalWorkspace,
    isLoading,
    error,
    setCurrentOrganization,
    switchToPersonalWorkspace,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
