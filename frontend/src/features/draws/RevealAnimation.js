import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Star, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { categoryImage, categoryStyle } from '@/lib/categories';
/**
 * Reveal estilo "cards stack": las tarjetas aparecen apiladas y se van
 * desplegando una a una con un pequeño rebote.
 */
export function RevealAnimation({ draw }) {
    const [revealedCount, setRevealedCount] = useState(0);
    useEffect(() => {
        setRevealedCount(0);
        if (draw.selections.length === 0)
            return;
        const interval = setInterval(() => {
            setRevealedCount((c) => {
                if (c >= draw.selections.length) {
                    clearInterval(interval);
                    return c;
                }
                return c + 1;
            });
        }, 650);
        return () => clearInterval(interval);
    }, [draw.id, draw.selections.length]);
    if (draw.selections.length === 0) {
        return _jsx("p", { className: "text-sm text-muted-foreground", children: "No hubo planes para este sorteo." });
    }
    return (_jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: _jsx(AnimatePresence, { children: draw.selections.slice(0, revealedCount).map((s, i) => {
                const { icon: Icon, tint } = categoryStyle(s.plan.category);
                const img = s.plan.image_url || categoryImage(s.plan.category);
                return (_jsxs(motion.article, { initial: { opacity: 0, y: 40, scale: 0.85, rotate: -4 }, animate: { opacity: 1, y: 0, scale: 1, rotate: 0 }, transition: { type: 'spring', stiffness: 180, damping: 16 }, className: "relative overflow-hidden rounded-2xl border bg-card shadow-md", children: [img ? (_jsxs("div", { className: "relative h-36 w-full overflow-hidden", children: [_jsx("img", { src: img, alt: "", className: "h-full w-full object-cover", loading: "lazy" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" }), _jsxs("span", { className: `absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur ${tint}`, children: [_jsx(Icon, { className: "h-3.5 w-3.5" }), s.plan.category || 'plan'] })] })) : (_jsxs("div", { className: "flex items-center justify-between px-5 pt-5", children: [_jsxs("span", { className: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tint}`, children: [_jsx(Icon, { className: "h-3.5 w-3.5" }), s.plan.category || 'plan'] }), _jsx(Star, { className: "h-4 w-4 text-secondary" })] })), _jsxs("div", { className: "p-5", children: [_jsxs("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: ["Plan #", i + 1] }), _jsx("h4", { className: "font-serif-display mt-1 text-2xl font-bold leading-tight", children: s.plan.title }), s.plan.description && (_jsx("p", { className: "mt-2 line-clamp-3 text-sm text-muted-foreground", children: s.plan.description })), _jsxs("div", { className: "mt-4 flex items-center justify-between text-xs text-muted-foreground", children: [_jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx(Avatar, { name: s.plan.author.name, src: s.plan.author.avatar_url, size: 22 }), "Propuesto por ", _jsx("b", { className: "text-foreground", children: s.plan.author.name })] }), s.for_user && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(UserIcon, { className: "h-3 w-3" }), " para ", s.for_user.name] }))] })] }), _jsx(Sparkles, { className: "absolute right-3 top-3 h-5 w-5 text-secondary/70 mix-blend-multiply" })] }, s.id));
            }) }) }));
}
