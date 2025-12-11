// src/api/authAPI.js - VERSION MOCK COMPLÈTE
export const authAPI = {
  // ⭐ TOUT EN MOCK POUR LES TESTS
  
  login: async (credentials) => {
    console.log('🔐 Mock login avec:', credentials.email);
    
    // Simuler délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retourner données mock
    return {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Étudiant ENSA',
        email: credentials.email,
        role: 'student'
      }
    };
  },
  
  register: async (userData) => {
  console.log('📝 Register avec:', userData);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    token: 'mock-jwt-register-' + Date.now(),
    refreshToken: 'mock-refresh-register-' + Date.now(),
    user: {
      id: 2,
      name: userData.name,
      email: userData.email,
      level: userData.level,  // ⭐ IMPORTANT: inclure level
      role: 'student'
    }
  };
},
  
  verifyToken: async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('🔐 Mock verifyToken');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: 1,
      name: 'Étudiant ENSA',
      email: 'etudiant@ensa.com',
      role: 'student'
    };
  },
  
  logout: async () => {
    console.log('🚪 Mock logout');
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  },
  
  refreshToken: async (refreshToken) => {
    console.log('🔄 Mock refreshToken appelé');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockResponse = {
      token: 'new-mock-access-token-' + Date.now(),
      refreshToken: 'new-mock-refresh-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Étudiant ENSA',
        email: 'etudiant@ensa.com',
        role: 'student'
      }
    };
    
    console.log('✅ Nouveaux tokens mock générés');
    return mockResponse;
  }
};