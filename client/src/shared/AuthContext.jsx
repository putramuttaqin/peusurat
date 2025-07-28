import { createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: 'include'
        });
        const data = await res.json();
        const isLoggedIn = data?.isAdmin === true;
        setIsAdmin(isLoggedIn);
        setUser(data.user || null);
        setLoginModalVisible(!isLoggedIn); // show login modal if not authenticated
      } catch {
        setIsAdmin(false);
        setUser(null);
        setLoginModalVisible(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        setIsAdmin(true); // triggers rerender if context is used properly
        return { success: true };
      } else {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errorData?.message || 'Login gagal. Username atau password salah.',
        };
      }
    } catch (err) {
      return {
        success: false,
        message: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
      };
    }
  };

  const logout = async () => {
    await fetch(`${apiUrl}/api/auth/session`, {
      method: 'DELETE',
      credentials: 'include'
    });
    setIsAdmin(false);
    setUser(null); // 👈 clear user data
    setLoginModalVisible(true);
  };

  return (
    <AuthContext.Provider value={{
      isAdmin,
      user,
      loading,
      login,
      logout,
      loginModalVisible,
      setLoginModalVisible
    }}>
      {children}
    </AuthContext.Provider>
  );
}
