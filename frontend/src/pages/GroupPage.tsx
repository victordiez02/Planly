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
import {
  useCreatePlan,
  useCurrentDraw,
  useDraws,
  useGroup,
  useMembers,
  usePlans,
  useRevealDraw,
  useRunDrawNow,
  useUpdatePlan,
} from '@/features/groups/queries';
import { RevealAnimation } from '@/features/draws/RevealAnimation';
import { HistoryTimeline } from '@/features/draws/HistoryTimeline';
import type { Plan } from '@/types';

export function GroupPage() {
  const { id = '' } = useParams();
  const { data: group } = useGroup(id);
  const { data: members } = useMembers(id);
  const { data: plans } = usePlans(id, 'active');
  const { data: current } = useCurrentDraw(id);
  const { data: draws } = useDraws(id);
  const reveal = useRevealDraw(id);
  const runNow = useRunDrawNow(id);
  const [tab, setTab] = useState<'plans' | 'members' | 'history'>('plans');
  const [revealing, setRevealing] = useState(false);

  if (!group) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl border bg-card" />
        <div className="h-64 animate-pulse rounded-2xl border bg-card" />
      </div>
    );
  }

  const copyInvite = () => {
    navigator.clipboard.writeText(group.invite_code);
    toast.success('Código copiado al portapapeles');
  };

  const featuredPlan = current?.revealed ? current.selections[0]?.plan : null;

  return (
    <div className="space-y-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="filmstrip-x from-primary/12 relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br via-card/90 to-secondary/15 px-8 py-12 shadow-[0_10px_40px_-20px_hsl(220_40%_20%/0.25)] backdrop-blur md:px-12 md:py-14"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <Badge variant="outline">
              {group.selection_mode === 'global' ? 'sorteo global' : 'sorteo por persona'}
              {' · '}
              {group.picks_count} {group.picks_count === 1 ? 'plan' : 'planes'}
            </Badge>
            <h1 className="font-serif-display text-4xl font-bold leading-tight md:text-5xl">
              {group.name}
            </h1>
            {group.description && (
              <p className="max-w-xl text-balance text-muted-foreground">{group.description}</p>
            )}
            {members && members.length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                <AvatarStack users={members} size={32} />
                <span className="text-sm text-muted-foreground">
                  {members.length} {members.length === 1 ? 'persona' : 'personas'}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyInvite}
                className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium transition hover:bg-background"
              >
                <Share2 className="h-3.5 w-3.5" />
                {group.invite_code}
                <Copy className="h-3 w-3 opacity-60" />
              </button>
              {group.my_role === 'admin' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await runNow.mutateAsync();
                      toast.success('Sorteo lanzado');
                    } catch {
                      toast.error('No hay planes activos o ya se sorteó este mes');
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4" /> Sortear ahora
                </Button>
              )}
              {group.my_role === 'admin' && (
                <Button size="icon" variant="ghost" title="Configurar (próximamente)">
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Próximo sorteo
              </p>
              <Countdown compact />
            </div>
          </div>
        </div>
      </motion.header>

      {current && (
        <section className="overflow-hidden rounded-3xl border bg-card p-6 md:p-8">
          <div className="mb-5 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Sorteo del mes
              </p>
              <h2 className="font-serif-display text-3xl font-bold">
                {current.revealed ? 'Esto es lo que os ha tocado' : 'Hay un sorteo esperando'}
              </h2>
            </div>
            {!current.revealed && (
              <Button
                size="lg"
                onClick={async () => {
                  setRevealing(true);
                  await reveal.mutateAsync(current.id);
                }}
              >
                <Sparkles className="h-4 w-4" /> Revelar
              </Button>
            )}
          </div>
          {(current.revealed || revealing) && <RevealAnimation draw={current} />}

          {featuredPlan && (
            <div className="mt-6 rounded-2xl border border-dashed bg-secondary/10 p-4">
              <p className="text-xs uppercase tracking-widest text-secondary">
                Plan destacado del mes
              </p>
              <p className="font-serif-display mt-1 text-xl font-semibold">{featuredPlan.title}</p>
            </div>
          )}
        </section>
      )}

      <div className="flex items-center justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'plans', label: 'Planes', count: plans?.length },
            { value: 'members', label: 'Miembros', count: members?.length },
            { value: 'history', label: 'Historial', count: draws?.length },
          ]}
        />
      </div>

      {tab === 'plans' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <NewPlanForm groupId={id} />
          <div className="grid gap-3 sm:grid-cols-2">
            {plans?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aún no hay planes propuestos. Lanza el primero ✨
              </p>
            )}
            {plans?.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <PlanCard plan={p} groupId={id} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members?.map((m) => (
            <Link
              key={m.id}
              to={`/u/${m.id}`}
              className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Avatar name={m.name} src={m.avatar_url} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              {m.role === 'admin' && <Badge variant="secondary">admin</Badge>}
            </Link>
          ))}
        </div>
      )}

      {tab === 'history' && <HistoryTimeline groupId={id} draws={draws || []} />}
    </div>
  );
}

function PlanCard({ plan, groupId }: { plan: Plan; groupId: string }) {
  const update = useUpdatePlan(groupId);
  const { icon: Icon, tint } = categoryStyle(plan.category);
  const image = plan.image_url || categoryImage(plan.category);
  const done = !!plan.completed_at;

  return (
    <article className="polaroid group flex h-full flex-col">
      {image ? (
        <div className="relative h-36 w-full overflow-hidden rounded-sm">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span
            className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest backdrop-blur ${tint}`}
          >
            <Icon className="h-3 w-3" /> {plan.category || 'plan'}
          </span>
        </div>
      ) : (
        <div className="relative h-36 w-full overflow-hidden rounded-sm bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20">
          <span
            className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest backdrop-blur ${tint}`}
          >
            <Icon className="h-3 w-3" /> {plan.category || 'plan'}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 pt-3">
        <h4 className="font-serif-display text-lg font-semibold leading-tight">{plan.title}</h4>
        {plan.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{plan.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Avatar name={plan.author.name} src={plan.author.avatar_url} size={20} />
            {plan.author.name}
          </span>
          <Button
            variant={done ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => update.mutate({ planId: plan.id, completed: !done })}
          >
            <Check className="h-3.5 w-3.5" />
            {done ? 'hecho' : 'marcar'}
          </Button>
        </div>
      </div>
    </article>
  );
}

function NewPlanForm({ groupId }: { groupId: string }) {
  const create = useCreatePlan(groupId);
  const [form, setForm] = useState({ title: '', description: '', category: '', image_url: '' });

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Añadir un plan</CardTitle>
        <CardDescription>Entrará en el sorteo del próximo día 1.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input
          placeholder="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Descripción (opcional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          placeholder="Categoría: cine, comida, viaje…"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <Input
          placeholder="URL de imagen (opcional)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <Button
          className="w-full"
          disabled={!form.title || create.isPending}
          onClick={async () => {
            await create.mutateAsync({
              title: form.title,
              description: form.description || undefined,
              category: form.category || undefined,
              image_url: form.image_url || undefined,
            });
            setForm({ title: '', description: '', category: '', image_url: '' });
            toast.success('Plan añadido');
          }}
        >
          <Plus className="h-4 w-4" /> Añadir
        </Button>
        <p className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" /> Lo verán todos los miembros del grupo.
        </p>
      </CardContent>
    </Card>
  );
}
