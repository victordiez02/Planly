import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
export function Tabs({ value, onChange, options, className, }) {
    return (_jsx("div", { className: cn('inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1 shadow-[0_2px_8px_-2px_hsl(220_40%_20%/0.1)] backdrop-blur', className), children: options.map((o) => {
            const active = o.value === value;
            return (_jsxs("button", { onClick: () => onChange(o.value), className: "relative rounded-full px-4 py-1.5 text-sm font-medium transition", children: [active && (_jsx(motion.span, { layoutId: "tabs-pill", className: "absolute inset-0 rounded-full bg-primary shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.6)]", transition: { type: 'spring', stiffness: 400, damping: 32 } })), _jsxs("span", { className: cn('relative z-10 transition-colors', active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'), children: [o.label, typeof o.count === 'number' && (_jsx("span", { className: "ml-1.5 text-xs opacity-70", children: o.count }))] })] }, o.value));
        }) }));
}
