import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Camera, Check, ImagePlus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categoryImage, categoryStyle } from '@/lib/categories';
import { useUpdatePlan } from '@/features/groups/queries';
const MONTHS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];
const TILTS = [-3.2, 2.4, -1.6, 3.1, -2.6, 1.8, -2.2, 2.7];
const PIN_COLORS = ['', 'pushpin-blue', 'pushpin-yellow', 'pushpin-green'];
export function HistoryTimeline({ groupId, draws }) {
    if (draws.length === 0) {
        return (_jsx("div", { className: "cork-frame", children: _jsx("div", { className: "cork-bg cork-vignette rounded-xl p-10 text-center text-card-foreground/80", children: "A\u00FAn no hay recuerdos. El primer sorteo llegar\u00E1 el d\u00EDa 1 del mes." }) }));
    }
    return (_jsx("div", { className: "space-y-12", children: draws.map((draw, idx) => (_jsx(CorkBoard, { title: MONTHS[draw.month - 1], subtitle: String(draw.year), highlight: idx === 0, count: draw.selections.length, children: draw.selections.map((s, i) => (_jsx(PinnedPolaroid, { groupId: groupId, selection: s, tilt: TILTS[i % TILTS.length], pin: PIN_COLORS[i % PIN_COLORS.length], index: i }, s.id))) }, draw.id))) }));
}
function CorkBoard({ title, subtitle, highlight, count, children, }) {
    return (_jsx(motion.section, { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }, className: "cork-frame", children: _jsxs("div", { className: "cork-bg cork-vignette relative overflow-hidden rounded-xl", children: [_jsxs("svg", { "aria-hidden": "true", viewBox: "0 0 1000 40", preserveAspectRatio: "none", className: "absolute inset-x-0 top-7 h-10 w-full text-[hsl(var(--twine))]", children: [_jsx("path", { d: "M 0 6 Q 250 30 500 18 T 1000 8", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", opacity: "0.85" }), _jsx("path", { d: "M 0 7 Q 250 31 500 19 T 1000 9", fill: "none", stroke: "hsl(0 0% 100% / 0.18)", strokeWidth: "0.6", strokeLinecap: "round" })] }), _jsxs("div", { className: "relative z-10 flex items-end justify-between gap-3 px-6 pt-6", children: [_jsxs("div", { className: "relative inline-flex items-baseline gap-2 rounded-md bg-card/95 px-3 py-1.5 shadow-md ring-1 ring-black/10", children: [_jsx("span", { className: "pushpin pushpin-yellow", style: { top: -6, left: 12 } }), _jsx("h3", { className: "font-serif-display text-2xl font-bold leading-none text-card-foreground", children: title }), _jsx("span", { className: "font-display text-sm text-card-foreground/60", children: subtitle })] }), _jsxs("div", { className: "flex items-center gap-2", children: [highlight && _jsx(Badge, { variant: "secondary", children: "m\u00E1s reciente" }), _jsxs("span", { className: "rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm", children: [count, " ", count === 1 ? 'recuerdo' : 'recuerdos'] })] })] }), _jsx("div", { className: "relative z-[1] grid gap-x-6 gap-y-10 p-6 pt-12 sm:grid-cols-2 lg:grid-cols-3", children: children })] }) }));
}
function PinnedPolaroid({ groupId, selection, tilt, pin, index, }) {
    const update = useUpdatePlan(groupId);
    const [showImg, setShowImg] = useState(false);
    const [imgUrl, setImgUrl] = useState(selection.plan.image_url ?? '');
    const { icon: Icon, tint } = categoryStyle(selection.plan.category);
    const image = selection.plan.image_url || categoryImage(selection.plan.category);
    const done = !!selection.plan.completed_at;
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 12, rotate: tilt }, whileInView: { opacity: 1, y: 0, rotate: tilt }, viewport: { once: true, margin: '-40px' }, whileHover: { rotate: tilt * 0.3, y: -3, transition: { duration: 0.2 } }, transition: { delay: index * 0.04, duration: 0.35 }, style: { transformOrigin: 'top center' }, className: "relative", children: [_jsx("span", { className: `pushpin ${pin}`, style: { top: -8, left: '50%', marginLeft: -9 } }), _jsxs("article", { className: "polaroid relative", children: [image ? (_jsxs("div", { className: "relative h-44 w-full overflow-hidden rounded-sm bg-black/10", children: [_jsx("img", { src: image, alt: "", className: "h-full w-full object-cover", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" }), _jsxs("span", { className: `absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest backdrop-blur ${tint}`, children: [_jsx(Icon, { className: "h-3 w-3" }), " ", selection.plan.category || 'plan'] }), done && (_jsxs("span", { className: "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground", children: [_jsx(Check, { className: "h-3 w-3" }), " hecho"] }))] })) : (_jsxs("div", { className: "relative flex h-44 w-full items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/25", children: [_jsx(Sparkles, { className: "h-10 w-10 text-card-foreground/30" }), _jsxs("span", { className: `absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ${tint}`, children: [_jsx(Icon, { className: "h-3 w-3" }), " ", selection.plan.category || 'plan'] })] })), _jsxs("div", { className: "px-1 pt-3", children: [_jsx("h4", { className: "font-serif-display text-lg font-semibold leading-tight text-card-foreground", children: selection.plan.title }), selection.plan.description && (_jsx("p", { className: "mt-1 line-clamp-2 text-sm text-card-foreground/70", children: selection.plan.description })), _jsxs("div", { className: "mt-3 flex items-center justify-between", children: [_jsxs("div", { className: "inline-flex items-center gap-2 text-xs text-card-foreground/70", children: [_jsx(Avatar, { name: selection.plan.author.name, src: selection.plan.author.avatar_url, size: 20 }), selection.plan.author.name, selection.for_user && (_jsxs("span", { className: "text-card-foreground/50", children: ["\u00B7 para ", selection.for_user.name] }))] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowImg((s) => !s), title: "A\u00F1adir foto", children: image ? _jsx(Camera, { className: "h-4 w-4" }) : _jsx(ImagePlus, { className: "h-4 w-4" }) }), _jsxs(Button, { variant: done ? 'secondary' : 'outline', size: "sm", onClick: () => update.mutate({ planId: selection.plan.id, completed: !done }), children: [_jsx(Check, { className: "h-4 w-4" }), " ", done ? 'hecho' : 'marcar'] })] })] }), showImg && (_jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx(Input, { placeholder: "URL de foto", value: imgUrl, onChange: (e) => setImgUrl(e.target.value) }), _jsx(Button, { size: "sm", onClick: async () => {
                                            await update.mutateAsync({
                                                planId: selection.plan.id,
                                                image_url: imgUrl || undefined,
                                            });
                                            setShowImg(false);
                                        }, children: "Guardar" })] }))] })] })] }));
}
