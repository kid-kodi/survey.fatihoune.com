/**
 * Visibility Access Control Utilities
 *
 * These functions determine whether a user can access a survey based on
 * its visibility settings and the user's organization membership.
 */

type Survey = {
  id: string;
  userId: string;
  organizationId?: string | null;
  visibility?: string | null;
};

/**
 * Check if a user can access a survey based on visibility rules
 *
 * Rules:
 * 1. Survey creator always has access
 * 2. Personal surveys (no organizationId) only accessible by creator
 * 3. Private organization surveys only accessible by creator
 * 4. Organization surveys with visibility='organization' accessible by all org members
 */
export function canAccessSurvey(
  survey: Survey,
  userId: string,
  userOrgMemberships: string[] = []
): boolean {
  // Rule 1: Creator always has access
  if (survey.userId === userId) {
    return true;
  }

  // Rule 2: Personal surveys only for creator
  if (!survey.organizationId) {
    return false;
  }

  // Rule 3: Private organization surveys only for creator
  if (survey.visibility === "private") {
    return false;
  }

  // Rule 4: Organization surveys accessible by members
  if (survey.visibility === "organization" && userOrgMemberships.includes(survey.organizationId)) {
    return true;
  }

  return false;
}

/**
 * Check if a user can edit a survey
 *
 * Rules:
 * 1. Only the survey creator can edit
 * (Future: Could add organization permissions like manage_all_surveys)
 */
export function canEditSurvey(
  survey: Survey,
  userId: string,
  userPermissions: string[] = []
): boolean {
  // Creator can always edit
  if (survey.userId === userId) {
    return true;
  }

  // Future: Check for manage_all_surveys permission
  // if (survey.organizationId && userPermissions.includes('manage_all_surveys')) {
  //   return true;
  // }

  return false;
}

/**
 * Check if a user can view analytics for a survey
 *
 * Rules:
 * 1. Creator can always view analytics
 * 2. Organization members with view_all_analytics can view
 * 3. Organization members can view if survey is organization-wide
 */
export function canViewAnalytics(
  survey: Survey,
  userId: string,
  userOrgMemberships: string[] = [],
  userPermissions: string[] = []
): boolean {
  // Creator can always view
  if (survey.userId === userId) {
    return true;
  }

  // Not in the organization
  if (!survey.organizationId || !userOrgMemberships.includes(survey.organizationId)) {
    return false;
  }

  // Has view_all_analytics permission
  if (userPermissions.includes('view_all_analytics')) {
    return true;
  }

  // Organization-wide surveys can be viewed by members
  if (survey.visibility === "organization") {
    return true;
  }

  return false;
}

/**
 * Check if a user can delete a survey
 *
 * Rules:
 * 1. Only the survey creator can delete
 * (Future: Could add organization permissions like manage_all_surveys)
 */
export function canDeleteSurvey(
  survey: Survey,
  userId: string,
  userPermissions: string[] = []
): boolean {
  // Only creator can delete
  if (survey.userId === userId) {
    return true;
  }

  // Future: Check for manage_all_surveys permission
  // if (survey.organizationId && userPermissions.includes('manage_all_surveys')) {
  //   return true;
  // }

  return false;
}
