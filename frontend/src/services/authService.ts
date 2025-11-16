import { api } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: string;
  workspaceName?: string;     // Nouveau
  mainBureauName?: string;    // Nouveau
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    bureauId?: string;
    workspaceId?: string;
  };
  token: string;
}

// Nettoyage et validation
const sanitizeAuthData = (data: any) => {
  const sanitized = {
    email: String(data.email).trim().toLowerCase(),
    password: String(data.password).trim(),
    role: data.role ? String(data.role).trim() : undefined,
    workspaceName: data.workspaceName ? String(data.workspaceName).trim() : "Mon Espace",
    mainBureauName: data.mainBureauName ? String(data.mainBureauName).trim() : "Bureau Principal",
  };
  
  if (!sanitized.email || sanitized.email.length < 3) {
    throw new Error('L\'email est requis');
  }
  
  return sanitized;
};

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const cleanData = sanitizeAuthData(data);
    const response = await api.post('/auth/login', cleanData);
    return response.data.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const cleanData = sanitizeAuthData(data);
    const response = await api.post('/auth/register', cleanData);
    return response.data.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data.user;
  }
};
