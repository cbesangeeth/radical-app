// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';
import { performLogout } from '../utils/auth';

export const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        performLogout();
        navigate('/');
    };

    return handleLogout;
};
