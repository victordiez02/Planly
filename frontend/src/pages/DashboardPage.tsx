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
import type { Group } from '@/types';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
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

  return (
    <div className="space-y-10">
      <section className="filmstrip-x relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/90 to-secondary/15 px-8 py-12 shadow-[0_10px_40px_-20px_hsl(220_40%_20%/0.25)] backdrop-blur md:px-12 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Hola{user ? `, ${user.name.split(' ')[0]}` : ''}
            </p>
            <h1 className="font-serif-display mt-2 text-4xl font-bold leading-tight md:text-5xl">
              ¿Qué nos espera este mes?
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Crea grupos, propón ideas y deja que el azar elija el día 1.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Próximo sorteo
            </span>
            <Countdown />
          </div>
        </div>
      </section>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold">Tus grupos</h2>
          <p className="text-sm text-muted-foreground">
            Cada grupo tiene su propia magia. Empieza o únete a uno.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoin((s) => !s)}>
            <LogIn className="h-4 w-4" /> Unirme
          </Button>
          <Button onClick={() => setShowCreate((s) => !s)}>
            <Plus className="h-4 w-4" /> Nuevo grupo
          </Button>
        </div>
      </div>

      {showCreate && <CreateGroupForm onDone={() => setShowCreate(false)} />}
      {showJoin && <JoinGroupForm onDone={() => setShowJoin(false)} />}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border bg-card" />
          ))}
        </div>
      ) : !groups || groups.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} onJoin={() => setShowJoin(true)} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="show"
            >
              <GroupTile group={g} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupTile({ group }: { group: Group }) {
  return (
    <Link to={`/g/${group.id}`} className="group block">
      <article className="polaroid relative flex h-full flex-col">
        <div className="relative h-32 w-full overflow-hidden rounded-sm bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(0_0%_100%/0.35),transparent_50%)]" />
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
            {group.selection_mode === 'global' ? 'global' : 'por persona'}
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="font-serif-display text-xl font-semibold leading-tight">{group.name}</h3>
          {group.my_role === 'admin' && <Badge variant="secondary">Admin</Badge>}
        </div>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {group.description || 'Vuestro espacio para juntar ideas y vivirlas.'}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {group.member_count} {group.member_count === 1 ? 'persona' : 'personas'}
          </span>
          <span className="font-display text-[11px] uppercase tracking-widest">
            {group.picks_count} {group.picks_count === 1 ? 'pick' : 'picks'}
          </span>
        </div>
      </article>
    </Link>
  );
}

function EmptyState({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  return (
    <div className="grid gap-6 rounded-3xl border bg-card p-10 text-center md:p-16">
      <p className="font-serif-display text-3xl font-semibold">Todavía no hay grupos por aquí ✨</p>
      <p className="mx-auto max-w-md text-muted-foreground">
        Crea uno para tu pareja, tu cuadrilla o tu familia. O únete con un código.
      </p>
      <div className="flex justify-center gap-2">
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" /> Crear grupo
        </Button>
        <Button variant="outline" onClick={onJoin}>
          <LogIn className="h-4 w-4" /> Tengo un código
        </Button>
      </div>
    </div>
  );
}

function CreateGroupForm({ onDone }: { onDone: () => void }) {
  const create = useCreateGroup();
  const [form, setForm] = useState({
    name: '',
    description: '',
    selection_mode: 'global' as 'global' | 'per_user',
    picks_count: 1,
    avoid_recent_months: 3,
    autodraw_enabled: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo grupo</CardTitle>
        <CardDescription>Configura cómo se sortearán los planes cada mes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Nombre del grupo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Textarea
          placeholder="Descripción (opcional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Modo
            <select
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.selection_mode}
              onChange={(e) =>
                setForm({ ...form, selection_mode: e.target.value as 'global' | 'per_user' })
              }
            >
              <option value="global">Global (mezclar todos)</option>
              <option value="per_user">Por persona</option>
            </select>
          </label>
          <label className="text-sm">
            Nº a seleccionar
            <Input
              type="number"
              min={1}
              value={form.picks_count}
              onChange={(e) => setForm({ ...form, picks_count: Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
          <Button
            disabled={!form.name || create.isPending}
            onClick={async () => {
              await create.mutateAsync(form);
              onDone();
            }}
          >
            Crear grupo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function JoinGroupForm({ onDone }: { onDone: () => void }) {
  const join = useJoinGroup();
  const [code, setCode] = useState('');
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unirme a un grupo</CardTitle>
        <CardDescription>Introduce el código de invitación.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Código de invitación"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
        />
        <Button
          disabled={!code || join.isPending}
          onClick={async () => {
            await join.mutateAsync(code);
            onDone();
          }}
        >
          Unirme
        </Button>
      </CardContent>
    </Card>
  );
}
