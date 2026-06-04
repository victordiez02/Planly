import { FlaskConical, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/store';

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

export function LoginPage() {
  const nav = useNavigate();
  const { fetchMe } = useAuth();

  const handleGoogle = async () => {
    const { data } = await api.get<{ authorization_url: string }>('/auth/google/login');
    window.location.href = data.authorization_url;
  };

  const handleDevLogin = async () => {
    await api.post('/auth/dev-login');
    await fetchMe();
    nav('/', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid w-full max-w-5xl gap-10 rounded-3xl border border-border/70 bg-card/85 p-10 shadow-2xl backdrop-blur-xl md:grid-cols-2 md:p-12"
      >
        <div className="flex flex-col justify-between">
          <div>
            <Logo className="mb-8" />
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              Para parejas, amigos y familias indecisas
            </span>
            <h1 className="font-serif-display mt-6 text-balance text-5xl font-bold leading-[1.05] md:text-6xl">
              Dejad de discutir qué hacer.
              <span className="block text-primary">Sorteadlo.</span>
            </h1>
            <p className="mt-5 max-w-md text-balance text-muted-foreground">
              Cada uno propone planes. El día 1 de cada mes, Planly elige uno con cariño y os lo
              cuenta con una animación bonita y un email.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <Button size="lg" onClick={handleGoogle}>
              Continuar con Google
            </Button>
            {DEV_BYPASS && (
              <Button variant="outline" size="lg" onClick={handleDevLogin}>
                <FlaskConical className="h-4 w-4" />
                Entrar en modo dev
              </Button>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Sin spam. Sin tarjetas. Sólo planes.
            </p>
          </div>
        </div>

        <div className="relative hidden min-h-[360px] md:block">
          <div className="drift-a polaroid absolute left-4 top-6 w-64">
            <div className="h-32 w-full rounded-sm bg-gradient-to-br from-primary/30 via-primary/15 to-secondary/25" />
            <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              Junio · Sorteado
            </p>
            <p className="font-serif-display mt-1 text-lg font-semibold leading-tight">
              Cena tailandesa en el barrio
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Propuesto por Marta</p>
          </div>
          <div className="drift-b polaroid absolute right-0 top-40 w-64">
            <div className="h-32 w-full rounded-sm bg-gradient-to-br from-secondary/35 via-secondary/15 to-accent/25" />
            <p className="mt-3 text-[10px] uppercase tracking-widest text-secondary">Mayo</p>
            <p className="font-serif-display mt-1 text-lg font-semibold leading-tight">
              Ruta por el Montseny
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Os tocó a los dos 💚</p>
          </div>
          <div className="drift-c polaroid absolute bottom-2 left-16 w-64">
            <div className="h-32 w-full rounded-sm bg-gradient-to-br from-accent/35 via-accent/15 to-primary/20" />
            <p className="mt-3 text-[10px] uppercase tracking-widest text-accent">Abril</p>
            <p className="font-serif-display mt-1 text-lg font-semibold leading-tight">
              Concierto sorpresa
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Categoría: música</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
