export interface User {
  id: number;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  leadId?: number;
  leadName?: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
  teamId: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

export interface UIState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isModalOpen: boolean;
  modalType: 'create-team' | 'edit-team' | 'create-member' | 'edit-member' | null;
  modalData: unknown;
  openModal: (type: UIState['modalType'], data?: unknown) => void;
  closeModal: () => void;
}