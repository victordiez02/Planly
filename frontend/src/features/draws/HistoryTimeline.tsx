import { motion } from 'framer-motion';
import { Camera, Check, ImagePlus, Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categoryImage, categoryStyle } from '@/lib/categories';
import { useUpdatePlan } from '@/features/groups/queries';
import type { Draw } from '@/types';

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

export function HistoryTimeline({ groupId, draws }: { groupId: string; draws: Draw[] }) {
  if (draws.length === 0) {
    return (
      <div className="cork-frame">
        <div className="cork-bg cork-vignette rounded-xl p-10 text-center text-card-foreground/80">
          Aún no hay recuerdos. El primer sorteo llegará el día 1 del mes.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {draws.map((draw, idx) => (
        <CorkBoard
          key={draw.id}
          title={MONTHS[draw.month - 1]}
          subtitle={String(draw.year)}
          highlight={idx === 0}
          count={draw.selections.length}
        >
          {draw.selections.map((s, i) => (
            <PinnedPolaroid
              key={s.id}
              groupId={groupId}
              selection={s}
              tilt={TILTS[i % TILTS.length]}
              pin={PIN_COLORS[i % PIN_COLORS.length]}
              index={i}
            />
          ))}
        </CorkBoard>
      ))}
    </div>
  );
}

function CorkBoard({
  title,
  subtitle,
  highlight,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  highlight?: boolean;
  count: number;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="cork-frame"
    >
      <div className="cork-bg cork-vignette relative overflow-hidden rounded-xl">
        {/* Twine running across the top, with subtle sag */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 40"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-7 h-10 w-full text-[hsl(var(--twine))]"
        >
          <path
            d="M 0 6 Q 250 30 500 18 T 1000 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 0 7 Q 250 31 500 19 T 1000 9"
            fill="none"
            stroke="hsl(0 0% 100% / 0.18)"
            strokeWidth="0.6"
            strokeLinecap="round"
          />
        </svg>

        {/* Board header label, like a stamped tag pinned in a corner */}
        <div className="relative z-10 flex items-end justify-between gap-3 px-6 pt-6">
          <div className="relative inline-flex items-baseline gap-2 rounded-md bg-card/95 px-3 py-1.5 shadow-md ring-1 ring-black/10">
            <span className="pushpin pushpin-yellow" style={{ top: -6, left: 12 }} />
            <h3 className="font-serif-display text-2xl font-bold leading-none text-card-foreground">
              {title}
            </h3>
            <span className="font-display text-sm text-card-foreground/60">{subtitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {highlight && <Badge variant="secondary">más reciente</Badge>}
            <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
              {count} {count === 1 ? 'recuerdo' : 'recuerdos'}
            </span>
          </div>
        </div>

        {/* Pinned polaroids grid */}
        <div className="relative z-[1] grid gap-x-6 gap-y-10 p-6 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </motion.section>
  );
}

function PinnedPolaroid({
  groupId,
  selection,
  tilt,
  pin,
  index,
}: {
  groupId: string;
  selection: Draw['selections'][number];
  tilt: number;
  pin: string;
  index: number;
}) {
  const update = useUpdatePlan(groupId);
  const [showImg, setShowImg] = useState(false);
  const [imgUrl, setImgUrl] = useState(selection.plan.image_url ?? '');

  const { icon: Icon, tint } = categoryStyle(selection.plan.category);
  const image = selection.plan.image_url || categoryImage(selection.plan.category);
  const done = !!selection.plan.completed_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotate: tilt }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ rotate: tilt * 0.3, y: -3, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      style={{ transformOrigin: 'top center' }}
      className="relative"
    >
      {/* Pin pinned through the top edge of the polaroid */}
      <span className={`pushpin ${pin}`} style={{ top: -8, left: '50%', marginLeft: -9 }} />

      <article className="polaroid relative">
        {image ? (
          <div className="relative h-44 w-full overflow-hidden rounded-sm bg-black/10">
            <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <span
              className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest backdrop-blur ${tint}`}
            >
              <Icon className="h-3 w-3" /> {selection.plan.category || 'plan'}
            </span>
            {done && (
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
                <Check className="h-3 w-3" /> hecho
              </span>
            )}
          </div>
        ) : (
          <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/25">
            <Sparkles className="h-10 w-10 text-card-foreground/30" />
            <span
              className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ${tint}`}
            >
              <Icon className="h-3 w-3" /> {selection.plan.category || 'plan'}
            </span>
          </div>
        )}

        <div className="px-1 pt-3">
          <h4 className="font-serif-display text-lg font-semibold leading-tight text-card-foreground">
            {selection.plan.title}
          </h4>
          {selection.plan.description && (
            <p className="mt-1 line-clamp-2 text-sm text-card-foreground/70">
              {selection.plan.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs text-card-foreground/70">
              <Avatar
                name={selection.plan.author.name}
                src={selection.plan.author.avatar_url}
                size={20}
              />
              {selection.plan.author.name}
              {selection.for_user && (
                <span className="text-card-foreground/50">· para {selection.for_user.name}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImg((s) => !s)}
                title="Añadir foto"
              >
                {image ? <Camera className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
              </Button>
              <Button
                variant={done ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => update.mutate({ planId: selection.plan.id, completed: !done })}
              >
                <Check className="h-4 w-4" /> {done ? 'hecho' : 'marcar'}
              </Button>
            </div>
          </div>

          {showImg && (
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="URL de foto"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
              />
              <Button
                size="sm"
                onClick={async () => {
                  await update.mutateAsync({
                    planId: selection.plan.id,
                    image_url: imgUrl || undefined,
                  });
                  setShowImg(false);
                }}
              >
                Guardar
              </Button>
            </div>
          )}
        </div>
      </article>
    </motion.div>
  );
}
