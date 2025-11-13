export interface DropFormValues {
  name: string;
  description?: string;
  capacity: number;
  claim_window_start: string;
  claim_window_end: string;
  is_active: boolean;
}

export interface AdminDropListResponse {
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

