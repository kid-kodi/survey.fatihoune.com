import { getActualUser, getCurrentUser, getActiveImpersonation } from "@/lib/auth";
import { ImpersonationBanner } from "./impersonation-banner";

export async function ImpersonationBannerWrapper() {
  try {
    const actualUser = await getActualUser();
    const currentUser = await getCurrentUser();

    if (!actualUser || !currentUser) {
      return null;
    }

    // Check if admin is impersonating
    if (actualUser.isSysAdmin && actualUser.id !== currentUser.id) {
      return (
        <ImpersonationBanner
          isImpersonating={true}
          targetUserName={currentUser.name}
          isBeingImpersonated={false}
        />
      );
    }

    // Check if current user is being impersonated
    const activeImpersonation = await getActiveImpersonation();
    if (activeImpersonation && activeImpersonation.targetUserId === currentUser.id) {
      return (
        <ImpersonationBanner
          isImpersonating={false}
          isBeingImpersonated={true}
        />
      );
    }

    return null;
  } catch (error) {
    console.error("Error in ImpersonationBannerWrapper:", error);
    return null;
  }
}
