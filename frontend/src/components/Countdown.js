import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
function nextDraw(now = new Date()) {
    const y = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    const m = (now.getMonth() + 1) % 12;
    return new Date(y, m, 1, 9, 0, 0);
}
function diff(target) {
    const ms = Math.max(0, target.getTime() - Date.now());
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return { days, hours, minutes, seconds };
}
export function Countdown({ compact = false }) {
    const target = nextDraw();
    const [t, setT] = useState(() => diff(target));
    useEffect(() => {
        const id = setInterval(() => setT(diff(target)), 1000);
        return () => clearInterval(id);
    }, [target]);
    if (compact) {
        return (_jsxs("span", { className: "font-display text-sm font-semibold tabular-nums", children: [t.days, "d ", String(t.hours).padStart(2, '0'), "h ", String(t.minutes).padStart(2, '0'), "m"] }));
    }
    const Box = ({ v, label }) => (_jsxs("div", { className: "flex flex-col items-center rounded-xl bg-card px-4 py-3 shadow-sm", children: [_jsx("span", { className: "font-display text-2xl font-bold tabular-nums", children: String(v).padStart(2, '0') }), _jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label })] }));
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Box, { v: t.days, label: "d\u00EDas" }), _jsx(Box, { v: t.hours, label: "horas" }), _jsx(Box, { v: t.minutes, label: "min" }), _jsx(Box, { v: t.seconds, label: "seg" })] }));
}
