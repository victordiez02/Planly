import { Coffee, Film, Gamepad2, MapPin, Music, Palette, Sparkles, Utensils } from 'lucide-react';
const MAP = {
    cine: { icon: Film, tint: 'text-secondary bg-secondary/15' },
    comida: { icon: Utensils, tint: 'text-secondary bg-secondary/15' },
    cafe: { icon: Coffee, tint: 'text-accent bg-accent/15' },
    café: { icon: Coffee, tint: 'text-accent bg-accent/15' },
    viaje: { icon: MapPin, tint: 'text-primary bg-primary/15' },
    juego: { icon: Gamepad2, tint: 'text-primary bg-primary/15' },
    música: { icon: Music, tint: 'text-secondary bg-secondary/15' },
    musica: { icon: Music, tint: 'text-secondary bg-secondary/15' },
    arte: { icon: Palette, tint: 'text-accent bg-accent/15' },
};
export function categoryStyle(category) {
    const key = (category || '').trim().toLowerCase();
    return MAP[key] ?? { icon: Sparkles, tint: 'text-muted-foreground bg-muted' };
}
const UNSPLASH = {
    cine: 'photo-1517604931442-7e0c8ed2963c',
    comida: 'photo-1504754524776-8f4f37790ca0',
    cafe: 'photo-1495474472287-4d71bcdd2085',
    café: 'photo-1495474472287-4d71bcdd2085',
    viaje: 'photo-1500835556837-99ac94a94552',
    juego: 'photo-1493711662062-fa541adb3fc8',
    música: 'photo-1511671782779-c97d3d27a1d4',
    musica: 'photo-1511671782779-c97d3d27a1d4',
    arte: 'photo-1513364776144-60967b0f800f',
};
export function categoryImage(category) {
    const key = (category || '').trim().toLowerCase();
    const id = UNSPLASH[key];
    if (!id)
        return null;
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
}
