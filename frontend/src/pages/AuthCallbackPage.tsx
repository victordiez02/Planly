import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/store';

export function AuthCallbackPage() {
  const nav = useNavigate();
  const { fetchMe } = useAuth();
  useEffect(() => {
    (async () => {
      await fetchMe();
      nav('/', { replace: true });
    })();
  }, [fetchMe, nav]);
  return <div className="p-10 text-center text-muted-foreground">Iniciando sesión…</div>;
}
