"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import UserButton from "@/components/UserButton";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Load user data when session is available
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">{t("loading")}</p>
      </div>
    );
  }

  // If no session, redirect to login
  if (!session) {
    router.push("/login");
    return null;
  }

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      errors.name = `${t("name_required")}`;
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = `${t("current_password_required")}`;
    }

    if (!passwordData.newPassword) {
      errors.newPassword = `${t("new_password_required")}`;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = `${t("password_length")}`;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = `${t("passwords_not_match")}`;
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);
    setSuccess("");
    setProfileErrors({});

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setProfileErrors({
          general: data.error || `${t("failed_update_profile")}`,
        });
      } else {
        setSuccess(`${t("profile_updated")}`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setProfileErrors({
        general: `${t("unexpected_error")}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setSuccess("");
    setPasswordErrors({});

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordErrors({
          general: data.error || `${t("failed_update_password")}`,
        });
      } else {
        setSuccess(`${t("password_updated")}`);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setPasswordErrors({
        general: `${t("unexpected_error")}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      {/* <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
              >
                {t("dashboard")}
              </Button>
              <UserButton />
            </div>
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t("account_settings")}</h2>
          <p className="mt-2 text-gray-600">
            {t("manage_account")}
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-800 border border-green-200">
            {success}
          </div>
        )}

        {/* Profile Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("profile_information")}</CardTitle>
            <CardDescription>
              {t("update_profile")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileErrors.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  {profileErrors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className={profileErrors.name ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {profileErrors.name && (
                  <p className="text-sm text-red-600">{profileErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">
                  {t("email_cannot_change")}
                </p>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? `${t("saving")}` : `${t("save_changes")}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("change_password")}</CardTitle>
            <CardDescription>
              {t("update_password_security")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordErrors.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  {passwordErrors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("current_password")}</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={
                    passwordErrors.currentPassword ? "border-red-500" : ""
                  }
                  disabled={isLoading}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-600">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("new_password")}</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={passwordErrors.newPassword ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirm_password")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={
                    passwordErrors.confirmPassword ? "border-red-500" : ""
                  }
                  disabled={isLoading}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? `${t("updating")}` : `${t("update_password")}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
