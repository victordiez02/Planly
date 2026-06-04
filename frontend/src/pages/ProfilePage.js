import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { categoryStyle, categoryImage } from '@/lib/categories';
import { useUserProfile } from '@/features/groups/queries';
export function ProfilePage() {
    const { id = '' } = useParams();
    const { data, isLoading } = useUserProfile(id);
    if (isLoading || !data) {
        return _jsx("div", { className: "h-64 animate-pulse rounded-2xl border bg-card" });
    }
    const { user, shared_groups, plans, stats } = data;
    return (_jsxs("div", { className: "space-y-10", children: [_jsx(motion.header, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, className: "filmstrip-x from-primary/12 relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br via-card/90 to-accent/15 px-8 py-12 shadow-[0_10px_40px_-20px_hsl(220_40%_20%/0.25)] backdrop-blur md:px-12 md:py-14", children: _jsxs("div", { className: "flex flex-col items-start gap-6 md:flex-row md:items-center", children: [_jsx(Avatar, { name: user.name, src: user.avatar_url, size: 96 }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm uppercase tracking-widest text-muted-foreground", children: "Perfil" }), _jsx("h1", { className: "font-serif-display text-4xl font-bold md:text-5xl", children: user.name }), _jsx("p", { className: "mt-1 text-muted-foreground", children: user.email })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Stat, { icon: _jsx(Sparkles, { className: "h-4 w-4" }), label: "Planes creados", value: stats.plans_created }), _jsx(Stat, { icon: _jsx(Trophy, { className: "h-4 w-4" }), label: "Sorteados", value: stats.times_selected })] })] }) }), _jsxs("section", { children: [_jsxs("h2", { className: "mb-4 flex items-center gap-2 font-display text-xl font-semibold", children: [_jsx(Users, { className: "h-5 w-5 text-muted-foreground" }), " Grupos en com\u00FAn"] }), shared_groups.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "A\u00FAn no compart\u00EDs ning\u00FAn grupo." })) : (_jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: shared_groups.map((g) => (_jsxs(Link, { to: `/g/${g.id}`, className: "rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md", children: [_jsx("p", { className: "font-serif-display text-lg font-semibold", children: g.name }), g.description && (_jsx("p", { className: "mt-1 line-clamp-2 text-sm text-muted-foreground", children: g.description }))] }, g.id))) }))] }), _jsxs("section", { children: [_jsx("h2", { className: "mb-4 font-display text-xl font-semibold", children: "Planes propuestos" }), plans.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "Todav\u00EDa no ha propuesto planes en grupos que compart\u00EDs." })) : (_jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: plans.map((p) => {
                            const { icon: Icon, tint } = categoryStyle(p.category);
                            const img = p.image_url || categoryImage(p.category);
                            return (_jsxs("article", { className: "polaroid", children: [img ? (_jsxs("div", { className: "relative h-32 w-full overflow-hidden rounded-sm", children: [_jsx("img", { src: img, alt: "", className: "h-full w-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" })] })) : (_jsx("div", { className: "h-32 w-full rounded-sm bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20" })), _jsxs("div", { className: "space-y-2 pt-3", children: [_jsxs("span", { className: `inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs ${tint}`, children: [_jsx(Icon, { className: "h-3 w-3" }), " ", p.category || 'plan'] }), _jsx("p", { className: "font-serif-display text-base font-semibold leading-tight", children: p.title }), p.completed_at && _jsx(Badge, { variant: "accent", children: "hecho" })] })] }, p.id));
                        }) }))] })] }));
}
function Stat({ icon, label, value }) {
    return (_jsxs("div", { className: "rounded-2xl border bg-background/60 px-5 py-3 text-center", children: [_jsxs("div", { className: "mb-1 flex items-center justify-center gap-1 text-xs uppercase tracking-widest text-muted-foreground", children: [icon, label] }), _jsx("p", { className: "font-display text-3xl font-bold tabular-nums", children: value })] }));
}
