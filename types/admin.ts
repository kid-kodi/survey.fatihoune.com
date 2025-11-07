export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isSysAdmin: boolean;
  createdAt: Date | string;
}

export interface ImpersonationSessionData {
  id: string;
  adminId: string;
  targetUserId: string;
  reason: string | null;
  startedAt: Date | string;
  endedAt: Date | string | null;
  ipAddress: string | null;
  userAgent: string | null;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  targetUser: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StartImpersonationRequest {
  targetUserId: string;
  reason?: string;
}

export interface StartImpersonationResponse {
  success: boolean;
  sessionId: string;
  targetUser: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StopImpersonationResponse {
  success: boolean;
  duration: number; // seconds
}

export interface ImpersonationHistoryResponse {
  sessions: ImpersonationSessionData[];
  total: number;
  page: number;
  limit: number;
}
