import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Copy, Plus, Settings, Share2, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarStack } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Countdown } from '@/components/Countdown';
import { categoryImage, categoryStyle } from '@/lib/categories';
import { useCreatePlan, useCurrentDraw, useDraws, useGroup, useMembers, usePlans, useRevealDraw, useRunDrawNow, useUpdatePlan, } from '@/features/groups/queries';
import { RevealAnimation } from '@/features/draws/RevealAnimation';
import { HistoryTimeline } from '@/features/draws/HistoryTimeline';
export function GroupPage() {
    const { id = '' } = useParams();
    const { data: group } = useGroup(id);
    const { data: members } = useMembers(id);
    const { data: plans } = usePlans(id, 'active');
    const { data: current } = useCurrentDraw(id);
    const { data: draws } = useDraws(id);
    const reveal = useRevealDraw(id);
    const runNow = useRunDrawNow(id);
    const [tab, setTab] = useState('plans');
    const [revealing, setRevealing] = useState(false);
    if (!group) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-32 animate-pulse rounded-2xl border bg-card" }), _jsx("div", { className: "h-64 animate-pulse rounded-2xl border bg-card" })] }));
    }
    const copyInvite = () => {
        navigator.clipboard.writeText(group.invite_code);
        toast.success('Código copiado al portapapeles');
    };
    const featuredPlan = current?.revealed ? current.selections[0]?.plan : null;
    return (_jsxs("div", { className: "space-y-10", children: [_jsx(motion.header, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, className: "filmstrip-x from-primary/12 relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br via-card/90 to-secondary/15 px-8 py-12 shadow-[0_10px_40px_-20px_hsl(220_40%_20%/0.25)] backdrop-blur md:px-12 md:py-14", children: _jsxs("div", { className: "flex flex-col gap-6 md:flex-row md:items-start md:justify-between", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs(Badge, { variant: "outline", children: [group.selection_mode === 'global' ? 'sorteo global' : 'sorteo por persona', ' · ', group.picks_count, " ", group.picks_count === 1 ? 'plan' : 'planes'] }), _jsx("h1", { className: "font-serif-display text-4xl font-bold leading-tight md:text-5xl", children: group.name }), group.description && (_jsx("p", { className: "max-w-xl text-balance text-muted-foreground", children: group.description })), members && members.length > 0 && (_jsxs("div", { className: "flex items-center gap-3 pt-1", children: [_jsx(AvatarStack, { users: members, size: 32 }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [members.length, " ", members.length === 1 ? 'persona' : 'personas'] })] }))] }), _jsxs("div", { className: "flex flex-col items-start gap-3 md:items-end", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("button", { onClick: copyInvite, className: "inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium transition hover:bg-background", children: [_jsx(Share2, { className: "h-3.5 w-3.5" }), group.invite_code, _jsx(Copy, { className: "h-3 w-3 opacity-60" })] }), group.my_role === 'admin' && (_jsxs(Button, { size: "sm", variant: "secondary", onClick: async () => {
                                                try {
                                                    await runNow.mutateAsync();
                                                    toast.success('Sorteo lanzado');
                                                }
                                                catch {
                                                    toast.error('No hay planes activos o ya se sorteó este mes');
                                                }
                                            }, children: [_jsx(Sparkles, { className: "h-4 w-4" }), " Sortear ahora"] })), group.my_role === 'admin' && (_jsx(Button, { size: "icon", variant: "ghost", title: "Configurar (pr\u00F3ximamente)", children: _jsx(Settings, { className: "h-4 w-4" }) }))] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "Pr\u00F3ximo sorteo" }), _jsx(Countdown, { compact: true })] })] })] }) }), current && (_jsxs("section", { className: "overflow-hidden rounded-3xl border bg-card p-6 md:p-8", children: [_jsxs("div", { className: "mb-5 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Sorteo del mes" }), _jsx("h2", { className: "font-serif-display text-3xl font-bold", children: current.revealed ? 'Esto es lo que os ha tocado' : 'Hay un sorteo esperando' })] }), !current.revealed && (_jsxs(Button, { size: "lg", onClick: async () => {
                                    setRevealing(true);
                                    await reveal.mutateAsync(current.id);
                                }, children: [_jsx(Sparkles, { className: "h-4 w-4" }), " Revelar"] }))] }), (current.revealed || revealing) && _jsx(RevealAnimation, { draw: current }), featuredPlan && (_jsxs("div", { className: "mt-6 rounded-2xl border border-dashed bg-secondary/10 p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-widest text-secondary", children: "Plan destacado del mes" }), _jsx("p", { className: "font-serif-display mt-1 text-xl font-semibold", children: featuredPlan.title })] }))] })), _jsx("div", { className: "flex items-center justify-between", children: _jsx(Tabs, { value: tab, onChange: setTab, options: [
                        { value: 'plans', label: 'Planes', count: plans?.length },
                        { value: 'members', label: 'Miembros', count: members?.length },
                        { value: 'history', label: 'Historial', count: draws?.length },
                    ] }) }), tab === 'plans' && (_jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_2fr]", children: [_jsx(NewPlanForm, { groupId: id }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [plans?.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground", children: "A\u00FAn no hay planes propuestos. Lanza el primero \u2728" })), plans?.map((p, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04 }, children: _jsx(PlanCard, { plan: p, groupId: id }) }, p.id)))] })] })), tab === 'members' && (_jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: members?.map((m) => (_jsxs(Link, { to: `/u/${m.id}`, className: "group flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md", children: [_jsx(Avatar, { name: m.name, src: m.avatar_url, size: 48 }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate font-medium", children: m.name }), _jsx("p", { className: "truncate text-xs text-muted-foreground", children: m.email })] }), m.role === 'admin' && _jsx(Badge, { variant: "secondary", children: "admin" })] }, m.id))) })), tab === 'history' && _jsx(HistoryTimeline, { groupId: id, draws: draws || [] })] }));
}
function PlanCard({ plan, groupId }) {
    const update = useUpdatePlan(groupId);
    const { icon: Icon, tint } = categoryStyle(plan.category);
    const image = plan.image_url || categoryImage(plan.category);
    const done = !!plan.completed_at;
    return (_jsxs("article", { className: "polaroid group flex h-full flex-col", children: [image ? (_jsxs("div", { className: "relative h-36 w-full overflow-hidden rounded-sm", children: [_jsx("img", { src: image, alt: "", className: "h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" }), _jsxs("span", { className: `absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest backdrop-blur ${tint}`, children: [_jsx(Icon, { className: "h-3 w-3" }), " ", plan.category || 'plan'] })] })) : (_jsx("div", { className: "relative h-36 w-full overflow-hidden rounded-sm bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20", children: _jsxs("span", { className: `absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest backdrop-blur ${tint}`, children: [_jsx(Icon, { className: "h-3 w-3" }), " ", plan.category || 'plan'] }) })), _jsxs("div", { className: "flex flex-1 flex-col gap-2 pt-3", children: [_jsx("h4", { className: "font-serif-display text-lg font-semibold leading-tight", children: plan.title }), plan.description && (_jsx("p", { className: "line-clamp-2 text-sm text-muted-foreground", children: plan.description })), _jsxs("div", { className: "mt-auto flex items-center justify-between pt-2 text-xs", children: [_jsxs("span", { className: "inline-flex items-center gap-2 text-muted-foreground", children: [_jsx(Avatar, { name: plan.author.name, src: plan.author.avatar_url, size: 20 }), plan.author.name] }), _jsxs(Button, { variant: done ? 'secondary' : 'ghost', size: "sm", onClick: () => update.mutate({ planId: plan.id, completed: !done }), children: [_jsx(Check, { className: "h-3.5 w-3.5" }), done ? 'hecho' : 'marcar'] })] })] })] }));
}
function NewPlanForm({ groupId }) {
    const create = useCreatePlan(groupId);
    const [form, setForm] = useState({ title: '', description: '', category: '', image_url: '' });
    return (_jsxs(Card, { className: "h-fit", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "A\u00F1adir un plan" }), _jsx(CardDescription, { children: "Entrar\u00E1 en el sorteo del pr\u00F3ximo d\u00EDa 1." })] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsx(Input, { placeholder: "T\u00EDtulo", value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }) }), _jsx(Textarea, { placeholder: "Descripci\u00F3n (opcional)", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) }), _jsx(Input, { placeholder: "Categor\u00EDa: cine, comida, viaje\u2026", value: form.category, onChange: (e) => setForm({ ...form, category: e.target.value }) }), _jsx(Input, { placeholder: "URL de imagen (opcional)", value: form.image_url, onChange: (e) => setForm({ ...form, image_url: e.target.value }) }), _jsxs(Button, { className: "w-full", disabled: !form.title || create.isPending, onClick: async () => {
                            await create.mutateAsync({
                                title: form.title,
                                description: form.description || undefined,
                                category: form.category || undefined,
                                image_url: form.image_url || undefined,
                            });
                            setForm({ title: '', description: '', category: '', image_url: '' });
                            toast.success('Plan añadido');
                        }, children: [_jsx(Plus, { className: "h-4 w-4" }), " A\u00F1adir"] }), _jsxs("p", { className: "flex items-center gap-1 pt-1 text-xs text-muted-foreground", children: [_jsx(Users, { className: "h-3 w-3" }), " Lo ver\u00E1n todos los miembros del grupo."] })] })] }));
}
