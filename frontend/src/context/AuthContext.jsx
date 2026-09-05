import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export const PRESET_USERS = [
  { 
    role: 'ADMIN', 
    name: 'National AI Director', 
    email: 'admin@arogyagrid.gov.in', 
    label: 'National Admin', 
    badge: 'National Portal',
    scope: 'All India PHC Formulary & Federated AI',
    description: 'Manage national medicine catalog, inter-state nodes, and system-wide audit logs'
  },
  { 
    role: 'DISTRICT_OFFICER', 
    name: 'Ranchi District Officer', 
    email: 'district.ranchi@arogyagrid.gov.in', 
    district_id: 'DIST-JH-01',
    label: 'District Health Officer', 
    badge: 'Ranchi District',
    scope: 'District Command Map & Logistics Escrow',
    description: 'Monitor PHC health status across Ranchi, approve inter-PHC drug transfers'
  },
  { 
    role: 'DOCTOR', 
    name: 'Dr. Priya Sharma (Medical Officer)', 
    email: 'doctor.ranchi@arogyagrid.gov.in', 
    district_id: 'DIST-JH-01', 
    phc_id: 'PHC-RAN-01', 
    label: 'Medical Officer / Doctor', 
    badge: 'Sadar PHC (Clinical)',
    scope: 'PHC Beds & Medical Staff Console',
    description: 'Admit/discharge ICU & Oxygen patients, log medical officer shift attendance'
  },
  { 
    role: 'PHC_STAFF', 
    name: 'Sadar PHC Frontline Staff', 
    email: 'phc.ranchi01@arogyagrid.gov.in', 
    district_id: 'DIST-JH-01', 
    phc_id: 'PHC-RAN-01', 
    label: 'PHC Staff / Worker', 
    badge: 'Sadar PHC Kiosk',
    scope: 'Daily Dispensing & Hindi Voice Intake',
    description: 'Frontline touch kiosk for patient dispensing, voice intake, and offline sync'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('arogya_user');
    const token = localStorage.getItem('arogya_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password = 'password123') {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('arogya_token', data.token);
      localStorage.setItem('arogya_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.warn('Backend login unavailable, falling back to matching local user:', err.message);
      const matched = PRESET_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        const localUser = {
          id: 'USR-LOCAL-' + matched.role,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          district_id: matched.district_id || 'DIST-JH-01',
          phc_id: matched.phc_id || 'PHC-RAN-01'
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('arogya_token', mockToken);
        localStorage.setItem('arogya_user', JSON.stringify(localUser));
        setUser(localUser);
        return localUser;
      }
      throw err;
    }
  }

  async function register(userData) {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      localStorage.setItem('arogya_token', data.token);
      localStorage.setItem('arogya_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.warn('Backend registration unavailable, creating resilient local session:', err.message);
      const fallbackUser = {
        id: 'USR-' + Date.now().toString(36).toUpperCase(),
        name: userData.name || 'Healthcare User',
        email: userData.email,
        role: userData.role || 'DOCTOR',
        district_id: userData.district_id || 'DIST-JH-01',
        phc_id: userData.role === 'ADMIN' ? null : (userData.phc_id || 'PHC-RAN-01')
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('arogya_token', mockToken);
      localStorage.setItem('arogya_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  }

  async function switchRole(role, phc_id) {
    const target = PRESET_USERS.find(u => u.role === role && (!phc_id || u.phc_id === phc_id)) || PRESET_USERS[0];
    return await login(target.email, 'password123');
  }

  function logout() {
    localStorage.removeItem('arogya_token');
    localStorage.removeItem('arogya_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
