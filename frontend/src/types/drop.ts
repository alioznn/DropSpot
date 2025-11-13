export interface Drop {
  id: number;
  name: string;
  description?: string | null;
  capacity: number;
  claim_window_start: string;
  claim_window_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaitlistResponse {
  entry: {
    id: number;
    user_id: number;
    drop_id: number;
    priority_score: number;
    joined_at: string;
    state: string;
    claim_code?: string | null;
    claimed_at?: string | null;
    created_at: string;
    updated_at: string;
  };
  created: boolean;
}

export interface WaitlistLeaveResponse {
  success: boolean;
  state: string;
}

export interface ClaimResponse {
  claim_code: string;
  claimed_at: string;
  position: number;
}

