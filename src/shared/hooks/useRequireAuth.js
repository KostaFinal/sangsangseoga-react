import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 비로그인 상태에서 로그인 필요한 액션을 시도했을 때, 그 자리에서 /login으로 보내고
// 로그인 성공 후 원래 있던 페이지로 돌아올 수 있도록 state.from을 함께 넘긴다.
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    if (isAuthenticated) return true;
    navigate('/login', { state: { from: location } });
    return false;
  };
}
