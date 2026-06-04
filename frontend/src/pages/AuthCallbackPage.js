import { jsx as _jsx } from "react/jsx-runtime";
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
    return _jsx("div", { className: "p-10 text-center text-muted-foreground", children: "Iniciando sesi\u00F3n\u2026" });
}
