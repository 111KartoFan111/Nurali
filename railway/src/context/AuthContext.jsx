import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Проверяем валидность токена
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Токен истек
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Устанавливаем токен в заголовок запросов
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Получаем информацию о пользователе
          fetchUserProfile();
        }
      } catch (err) {
        console.error('Ошибка при проверке токена:', err);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    
    setLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Ошибка при получении профиля:', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Сохраняем токен
      localStorage.setItem('token', token);
      
      // Устанавливаем токен в заголовок запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Произошла ошибка при входе'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Произошла ошибка при регистрации'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (userData) => {
    try {
      // Явно добавляем токен в заголовки для этого запроса
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/auth/profile', userData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Обновляем данные пользователя в контексте
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Произошла ошибка при обновлении профиля'
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};