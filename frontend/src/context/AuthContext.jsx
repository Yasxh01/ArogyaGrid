import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export const ALL_DISTRICTS = [
  { id: 'DIST-JH-01', name: 'Ranchi', state: 'Jharkhand' },
  { id: 'DIST-JH-02', name: 'Dhanbad', state: 'Jharkhand' },
  { id: 'DIST-BR-01', name: 'Patna', state: 'Bihar' },
  { id: 'DIST-BR-02', name: 'Gaya', state: 'Bihar' },
  { id: 'DIST-OD-01', name: 'Khordha', state: 'Odisha' },
  { id: 'DIST-MH-01', name: 'Pune', state: 'Maharashtra' },
  { id: 'DIST-KA-01', name: 'Bengaluru Urban', state: 'Karnataka' }
];

export const ALL_FACILITIES = [
  // --- Ranchi (Jharkhand) ---
  { id: 'DH-RAN-01', name: 'Ranchi District Civil Hospital', district_id: 'DIST-JH-01', facility_type: 'DISTRICT_HOSPITAL' },
  { id: 'PHC-RAN-01', name: 'Ranchi Sadar PHC', district_id: 'DIST-JH-01', facility_type: 'PHC' },
  { id: 'PHC-RAN-02', name: 'Kanke Rural CHC', district_id: 'DIST-JH-01', facility_type: 'CHC' },
  { id: 'PHC-RAN-03', name: 'Namkum PHC', district_id: 'DIST-JH-01', facility_type: 'PHC' },
  { id: 'HWC-RAN-01', name: 'Bundu Ayushman Arogya Mandir', district_id: 'DIST-JH-01', facility_type: 'SUB_CENTRE_HWC' },

  // --- Dhanbad (Jharkhand) ---
  { id: 'DH-DHN-01', name: 'Dhanbad District Hospital', district_id: 'DIST-JH-02', facility_type: 'DISTRICT_HOSPITAL' },
  { id: 'PHC-DHN-01', name: 'Jharia Coalfield CHC', district_id: 'DIST-JH-02', facility_type: 'CHC' },
  { id: 'PHC-DHN-02', name: 'Baghmara Rural CHC', district_id: 'DIST-JH-02', facility_type: 'CHC' },
  { id: 'PHC-DHN-03', name: 'Govindpur Primary Health Centre', district_id: 'DIST-JH-02', facility_type: 'PHC' },
  { id: 'HWC-DHN-01', name: 'Nirsa Ayushman Arogya Mandir', district_id: 'DIST-JH-02', facility_type: 'SUB_CENTRE_HWC' },

  // --- Patna (Bihar) ---
  { id: 'DH-PAT-01', name: 'Nalanda Medical College & Hospital', district_id: 'DIST-BR-01', facility_type: 'DISTRICT_HOSPITAL' },
  { id: 'PHC-PAT-01', name: 'Patna City Sub-Divisional Hospital', district_id: 'DIST-BR-01', facility_type: 'CHC' },
  { id: 'PHC-PAT-02', name: 'Danapur Sub-Divisional Hospital', district_id: 'DIST-BR-01', facility_type: 'CHC' },
  { id: 'PHC-PAT-03', name: 'Phulwari Sharif Primary Health Centre', district_id: 'DIST-BR-01', facility_type: 'PHC' },
  { id: 'HWC-PAT-01', name: 'Bakhtiyarpur Ayushman Arogya Mandir', district_id: 'DIST-BR-01', facility_type: 'SUB_CENTRE_HWC' },

  // --- Gaya (Bihar) ---
  { id: 'DH-GAY-01', name: 'Jay Prakash Narayan District Hospital', district_id: 'DIST-BR-02', facility_type: 'DISTRICT_HOSPITAL' },
  { id: 'PHC-GAY-01', name: 'Bodh Gaya PHC', district_id: 'DIST-BR-02', facility_type: 'PHC' },
  { id: 'PHC-GAY-02', name: 'Sherghati Sub-Divisional Hospital', district_id: 'DIST-BR-02', facility_type: 'CHC' },
  { id: 'PHC-GAY-03', name: 'Tekari Community Health Centre', district_id: 'DIST-BR-02', facility_type: 'CHC' },
  { id: 'HWC-GAY-01', name: 'Manpur Ayushman Arogya Mandir', district_id: 'DIST-BR-02', facility_type: 'SUB_CENTRE_HWC' },

  // --- Khordha (Odisha) ---
  { id: 'DH-KHO-01', name: 'Capital Hospital & District Civil Hospital', district_id: 'DIST-OD-01', facility_type: 'DISTRICT_HOSPITAL' },
  { id: 'PHC-KHO-01', name: 'Bhubaneswar Urban CHC', district_id: 'DIST-OD-01', facility_type: 'CHC' },
  { id: 'PHC-KHO-02', name: 'Jatni Community Health Centre', district_id: 'DIST-OD-01', facility_type: 'CHC' },
  { id: 'PHC-KHO-03', name: 'Balianta Primary Health Centre', district_id: 'DIST-OD-01', facility_type: 'PHC' },
  { id: 'HWC-KHO-01', name: 'Khordha Sadar Ayushman Arogya Mandir', district_id: 'DIST-OD-01', facility_type: 'SUB_CENTRE_HWC' },

  // --- Pune (Maharashtra) ---
  { id: 'DH-PUN-01', name: 'Aundh District Civil Hospital', district_id: 'DIST-MH-01', facility_type: 'DISTRICT_HOSPITAL' },
  { id: 'PHC-PUN-01', name: 'Haveli Rural CHC', district_id: 'DIST-MH-01', facility_type: 'CHC' },
  { id: 'PHC-PUN-02', name: 'Baramati Sub-District Hospital', district_id: 'DIST-MH-01', facility_type: 'CHC' },
  { id: 'PHC-PUN-03', name: 'Shirur Primary Health Centre', district_id: 'DIST-MH-01', facility_type: 'PHC' },
  { id: 'HWC-PUN-01', name: 'Daund Ayushman Arogya Mandir', district_id: 'DIST-MH-01', facility_type: 'SUB_CENTRE_HWC' },

  // --- Bengaluru Urban (Karnataka) ---
  { id: 'DH-BLR-01', name: 'KC General District Hospital', district_id: 'DIST-KA-01', facility_type: 'DISTRICT_HOSPITAL' },
  { id: 'PHC-BLR-01', name: 'Anekal Community Health Centre', district_id: 'DIST-KA-01', facility_type: 'CHC' },
  { id: 'PHC-BLR-02', name: 'Yelahanka General Hospital', district_id: 'DIST-KA-01', facility_type: 'CHC' },
  { id: 'PHC-BLR-03', name: 'K.R. Puram Primary Health Centre', district_id: 'DIST-KA-01', facility_type: 'PHC' },
  { id: 'HWC-BLR-01', name: 'Nelamangala Ayushman Arogya Mandir', district_id: 'DIST-KA-01', facility_type: 'SUB_CENTRE_HWC' }
];

export const PRESET_USERS = [
  { 
    role: 'ADMIN', 
    name: 'National AI Director', 
    email: 'admin@arogyagrid.gov.in', 
    label: 'National Admin', 
    badge: 'National Portal',
    scope: 'All India PHC Formulary & National Grid',
    description: 'Manage national medicine catalog, inter-district resource distribution, and system-wide audits'
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
      console.warn('Backend login unavailable, checking local registered and preset users:', err.message);
      
      // Check cached registered users first
      const registered = JSON.parse(localStorage.getItem('arogya_registered_users') || '[]');
      const registeredMatch = registered.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (registeredMatch) {
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('arogya_token', mockToken);
        localStorage.setItem('arogya_user', JSON.stringify(registeredMatch));
        setUser(registeredMatch);
        return registeredMatch;
      }

      // Check presets
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

      // If user typed a custom email, synthesize a resilient session for them
      if (email && email.includes('@')) {
        const role = email.includes('admin') ? 'ADMIN' : email.includes('officer') || email.includes('district') ? 'DISTRICT_OFFICER' : email.includes('doctor') ? 'DOCTOR' : 'PHC_STAFF';
        const dynamicUser = {
          id: 'USR-LOCAL-' + Date.now().toString(36).toUpperCase(),
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: email.toLowerCase(),
          role,
          district_id: 'DIST-JH-01',
          phc_id: role === 'ADMIN' ? null : 'PHC-RAN-01'
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('arogya_token', mockToken);
        localStorage.setItem('arogya_user', JSON.stringify(dynamicUser));
        setUser(dynamicUser);
        return dynamicUser;
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

      // Cache locally
      const existing = JSON.parse(localStorage.getItem('arogya_registered_users') || '[]');
      existing.push(data.user);
      localStorage.setItem('arogya_registered_users', JSON.stringify(existing));

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
      const existing = JSON.parse(localStorage.getItem('arogya_registered_users') || '[]');
      existing.push(fallbackUser);
      localStorage.setItem('arogya_registered_users', JSON.stringify(existing));

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
