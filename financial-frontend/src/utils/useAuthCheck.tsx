import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseJwt } from './jwtUtils';

export const useAuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { state: { message: 'Please login again' } });
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('accessToken');
      navigate('/login', { state: { message: 'Please login again' } });
    }
  }, [navigate]);
};