import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/store';
export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading)
        return _jsx("div", { className: "p-10 text-center text-muted-foreground", children: "Cargando\u2026" });
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    return _jsx(_Fragment, { children: children });
}
