import { api } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    bureauId?: string;
  };
  token: string;
}

// Fonction pour nettoyer et valider les données
const sanitizeAuthData = (data: any) => {
  const sanitized = {
    email: String(data.email).trim().toLowerCase(),
    password: String(data.password).trim(),
    role: data.role ? String(data.role).trim() : undefined
  };
  
  // Validation email basique
  if (!sanitized.email || sanitized.email.length < 3) {
    throw new Error('L\'email est requis');
  }
  
  return sanitized;
};

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('🔐 Attempting login for:', data.email);
    
    try {
      const cleanData = sanitizeAuthData(data);
      console.log('🧹 Données nettoyées:', cleanData);
      
      const response = await api.post('/auth/login', cleanData, {
        headers: {
          'Content-Type': 'application/json',
        },
        transformRequest: [(data) => JSON.stringify(data)],
      });
      
      console.log('✅ Login successful:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      console.error('📊 Response data:', error.response?.data);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('📝 Attempting registration for:', data.email);
    
    try {
      const cleanData = sanitizeAuthData(data);
      console.log('🧹 Données nettoyées:', cleanData);
      
      const response = await api.post('/auth/register', cleanData, {
        headers: {
          'Content-Type': 'application/json',
        },
        transformRequest: [(data) => JSON.stringify(data)],
      });
      
      console.log('✅ Registration successful:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      console.error('📊 Response data:', error.response?.data);
      throw error;
    }
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data.user;
  },

  async getCurrentUser() {
    const response = await api.get('/users/profile');
    return response.data.data;
  }
};