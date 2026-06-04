import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { Countdown } from '@/components/Countdown';
import { useAuth } from '@/features/auth/store';
import { useCreateGroup, useGroups, useJoinGroup } from '@/features/groups/queries';
const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    }),
};
export function DashboardPage() {
    const { user } = useAuth();
    const { data: groups, isLoading } = useGroups();
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    return (_jsxs("div", { className: "space-y-10", children: [_jsx("section", { className: "filmstrip-x relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/90 to-secondary/15 px-8 py-12 shadow-[0_10px_40px_-20px_hsl(220_40%_20%/0.25)] backdrop-blur md:px-12 md:py-14", children: _jsxs("div", { className: "flex flex-col gap-6 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm uppercase tracking-widest text-muted-foreground", children: ["Hola", user ? `, ${user.name.split(' ')[0]}` : ''] }), _jsx("h1", { className: "font-serif-display mt-2 text-4xl font-bold leading-tight md:text-5xl", children: "\u00BFQu\u00E9 nos espera este mes?" }), _jsx("p", { className: "mt-3 max-w-xl text-muted-foreground", children: "Crea grupos, prop\u00F3n ideas y deja que el azar elija el d\u00EDa 1." })] }), _jsxs("div", { className: "flex flex-col items-start gap-2 md:items-end", children: [_jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Pr\u00F3ximo sorteo" }), _jsx(Countdown, {})] })] }) }), _jsxs("div", { className: "flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-display text-2xl font-semibold", children: "Tus grupos" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Cada grupo tiene su propia magia. Empieza o \u00FAnete a uno." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => setShowJoin((s) => !s), children: [_jsx(LogIn, { className: "h-4 w-4" }), " Unirme"] }), _jsxs(Button, { onClick: () => setShowCreate((s) => !s), children: [_jsx(Plus, { className: "h-4 w-4" }), " Nuevo grupo"] })] })] }), showCreate && _jsx(CreateGroupForm, { onDone: () => setShowCreate(false) }), showJoin && _jsx(JoinGroupForm, { onDone: () => setShowJoin(false) }), isLoading ? (_jsx("div", { className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3", children: [0, 1, 2].map((i) => (_jsx("div", { className: "h-48 animate-pulse rounded-2xl border bg-card" }, i))) })) : !groups || groups.length === 0 ? (_jsx(EmptyState, { onCreate: () => setShowCreate(true), onJoin: () => setShowJoin(true) })) : (_jsx("div", { className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3", children: groups.map((g, i) => (_jsx(motion.div, { custom: i, variants: cardVariants, initial: "hidden", animate: "show", children: _jsx(GroupTile, { group: g }) }, g.id))) }))] }));
}
function GroupTile({ group }) {
    return (_jsx(Link, { to: `/g/${group.id}`, className: "group block", children: _jsxs("article", { className: "polaroid relative flex h-full flex-col", children: [_jsxs("div", { className: "relative h-32 w-full overflow-hidden rounded-sm bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/25", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(0_0%_100%/0.35),transparent_50%)]" }), _jsx("span", { className: "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur", children: group.selection_mode === 'global' ? 'global' : 'por persona' })] }), _jsxs("div", { className: "mt-3 flex items-start justify-between gap-2", children: [_jsx("h3", { className: "font-serif-display text-xl font-semibold leading-tight", children: group.name }), group.my_role === 'admin' && _jsx(Badge, { variant: "secondary", children: "Admin" })] }), _jsx("p", { className: "mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground", children: group.description || 'Vuestro espacio para juntar ideas y vivirlas.' }), _jsxs("div", { className: "mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground", children: [_jsxs("span", { className: "inline-flex items-center gap-1.5", children: [_jsx(Users, { className: "h-3.5 w-3.5" }), group.member_count, " ", group.member_count === 1 ? 'persona' : 'personas'] }), _jsxs("span", { className: "font-display text-[11px] uppercase tracking-widest", children: [group.picks_count, " ", group.picks_count === 1 ? 'pick' : 'picks'] })] })] }) }));
}
function EmptyState({ onCreate, onJoin }) {
    return (_jsxs("div", { className: "grid gap-6 rounded-3xl border bg-card p-10 text-center md:p-16", children: [_jsx("p", { className: "font-serif-display text-3xl font-semibold", children: "Todav\u00EDa no hay grupos por aqu\u00ED \u2728" }), _jsx("p", { className: "mx-auto max-w-md text-muted-foreground", children: "Crea uno para tu pareja, tu cuadrilla o tu familia. O \u00FAnete con un c\u00F3digo." }), _jsxs("div", { className: "flex justify-center gap-2", children: [_jsxs(Button, { onClick: onCreate, children: [_jsx(Plus, { className: "h-4 w-4" }), " Crear grupo"] }), _jsxs(Button, { variant: "outline", onClick: onJoin, children: [_jsx(LogIn, { className: "h-4 w-4" }), " Tengo un c\u00F3digo"] })] })] }));
}
function CreateGroupForm({ onDone }) {
    const create = useCreateGroup();
    const [form, setForm] = useState({
        name: '',
        description: '',
        selection_mode: 'global',
        picks_count: 1,
        avoid_recent_months: 3,
        autodraw_enabled: true,
    });
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Nuevo grupo" }), _jsx(CardDescription, { children: "Configura c\u00F3mo se sortear\u00E1n los planes cada mes." })] }), _jsxs(CardContent, { className: "space-y-3", children: [_jsx(Input, { placeholder: "Nombre del grupo", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }), _jsx(Textarea, { placeholder: "Descripci\u00F3n (opcional)", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("label", { className: "text-sm", children: ["Modo", _jsxs("select", { className: "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm", value: form.selection_mode, onChange: (e) => setForm({ ...form, selection_mode: e.target.value }), children: [_jsx("option", { value: "global", children: "Global (mezclar todos)" }), _jsx("option", { value: "per_user", children: "Por persona" })] })] }), _jsxs("label", { className: "text-sm", children: ["N\u00BA a seleccionar", _jsx(Input, { type: "number", min: 1, value: form.picks_count, onChange: (e) => setForm({ ...form, picks_count: Number(e.target.value) }) })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx(Button, { variant: "ghost", onClick: onDone, children: "Cancelar" }), _jsx(Button, { disabled: !form.name || create.isPending, onClick: async () => {
                                    await create.mutateAsync(form);
                                    onDone();
                                }, children: "Crear grupo" })] })] })] }));
}
function JoinGroupForm({ onDone }) {
    const join = useJoinGroup();
    const [code, setCode] = useState('');
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Unirme a un grupo" }), _jsx(CardDescription, { children: "Introduce el c\u00F3digo de invitaci\u00F3n." })] }), _jsxs(CardContent, { className: "flex flex-col gap-3 sm:flex-row", children: [_jsx(Input, { placeholder: "C\u00F3digo de invitaci\u00F3n", value: code, onChange: (e) => setCode(e.target.value.trim()) }), _jsx(Button, { disabled: !code || join.isPending, onClick: async () => {
                            await join.mutateAsync(code);
                            onDone();
                        }, children: "Unirme" })] })] }));
}
