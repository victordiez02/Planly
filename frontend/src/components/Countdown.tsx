import { useEffect, useState } from 'react';

function nextDraw(now = new Date()) {
  const y = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const m = (now.getMonth() + 1) % 12;
  return new Date(y, m, 1, 9, 0, 0);
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ compact = false }: { compact?: boolean }) {
  const target = nextDraw();
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (compact) {
    return (
      <span className="font-display text-sm font-semibold tabular-nums">
        {t.days}d {String(t.hours).padStart(2, '0')}h {String(t.minutes).padStart(2, '0')}m
      </span>
    );
  }

  const Box = ({ v, label }: { v: number; label: string }) => (
    <div className="flex flex-col items-center rounded-xl bg-card px-4 py-3 shadow-sm">
      <span className="font-display text-2xl font-bold tabular-nums">
        {String(v).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Box v={t.days} label="días" />
      <Box v={t.hours} label="horas" />
      <Box v={t.minutes} label="min" />
      <Box v={t.seconds} label="seg" />
    </div>
  );
}
