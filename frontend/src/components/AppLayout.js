import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/features/auth/store';
function HeaderLogo() {
    return (_jsx(Link, { to: "/", className: "group", children: _jsx(Logo, { className: "transition-transform duration-300 group-hover:-rotate-2" }) }));
}
export function AppLayout() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && matchMedia('(prefers-color-scheme: dark)').matches));
    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);
    return (_jsxs("div", { className: "relative flex min-h-screen flex-col", children: [_jsx("div", { "aria-hidden": "true", className: "cork-bg cork-vignette pointer-events-none fixed inset-0 -z-10" }), _jsx("header", { className: "sticky top-0 z-30 border-b border-foreground/10 bg-background/55 shadow-[0_4px_20px_-12px_hsl(0_0%_0%/0.4)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/40", children: _jsxs("div", { className: "container flex h-16 items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx(HeaderLogo, {}), _jsxs("nav", { className: "hidden gap-1 sm:flex", children: [_jsx(NavLink, { to: "/", end: true, className: ({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-medium transition ${isActive
                                                ? 'bg-foreground/5 text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'}`, children: "Inicio" }), user && (_jsx(NavLink, { to: `/u/${user.id}`, className: ({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-medium transition ${isActive
                                                ? 'bg-foreground/5 text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'}`, children: "Mi perfil" }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDark((d) => !d), children: dark ? _jsx(Sun, { className: "h-4 w-4" }) : _jsx(Moon, { className: "h-4 w-4" }) }), user && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-foreground/5", onClick: () => nav(`/u/${user.id}`), children: [_jsx(Avatar, { name: user.name, src: user.avatar_url, size: 28 }), _jsx("span", { className: "hidden text-sm font-medium sm:inline", children: user.name })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: logout, title: "Cerrar sesi\u00F3n", children: _jsx(LogOut, { className: "h-4 w-4" }) })] }))] })] }) }), _jsx("main", { className: "container relative flex-1 py-10", children: _jsx(Outlet, {}) }), _jsx("footer", { className: "border-t border-border/60 py-6 text-center text-xs text-muted-foreground", children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx("span", { className: "h-1 w-1 rounded-full bg-primary" }), "Planly \u00B7 Peque\u00F1os sorteos para grandes recuerdos", _jsx("span", { className: "h-1 w-1 rounded-full bg-secondary" })] }) })] }));
}
