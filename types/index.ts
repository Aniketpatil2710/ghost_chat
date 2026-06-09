// Ghost Chat — Type Definitions

export interface Device {
  id: string;
  secret_hash: string;
  created_at: string;
  public_key: string | null;
  last_seen: string | null;
  short_code: string;
}

export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  parent_message_id?: number | null;
}

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  created_at: string;
  nickname_for_one?: string | null;
  nickname_for_two?: string | null;
}

/**
 * Auth state managed by AuthProvider
 */
export interface AuthState {
  deviceId: string | null;
  isAuthenticated: boolean;
  shortCode: string | null;
}
