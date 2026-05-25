export interface XhsTheme {
  id: string;
  name: string;
  bgGradient: string;
  textColor: string;
  titleColor: string;
  accentColor: string;
  fontFamily: string;
  borderColor?: string;
  cardStyle?: React.CSSProperties;
}

export const xhsThemes: XhsTheme[] = [
  {
    id: 'gradient-pink',
    name: '马卡龙粉紫',
    bgGradient: 'from-pink-100 via-purple-100 to-indigo-100',
    textColor: 'text-gray-800',
    titleColor: 'text-indigo-900',
    accentColor: 'bg-indigo-600/10 text-indigo-600 border-indigo-200',
    fontFamily: 'font-sans',
  },
  {
    id: 'minimalist-white',
    name: '极简杂志',
    bgGradient: 'from-amber-50/20 via-stone-100/50 to-stone-50',
    textColor: 'text-stone-850',
    titleColor: 'text-stone-900',
    accentColor: 'bg-stone-200/50 text-stone-700 border-stone-300',
    fontFamily: 'font-serif',
    borderColor: 'border border-stone-300/60 shadow-inner',
  },
  {
    id: 'tech-dark',
    name: '极客暗黑',
    bgGradient: 'from-slate-900 via-zinc-900 to-slate-950',
    textColor: 'text-zinc-300',
    titleColor: 'text-emerald-400',
    accentColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    fontFamily: 'font-mono',
  },
  {
    id: 'vintage-yellow',
    name: '复古报纸',
    bgGradient: 'from-yellow-50/60 via-amber-50 to-orange-50/40',
    textColor: 'text-amber-950/90',
    titleColor: 'text-amber-950',
    accentColor: 'bg-amber-900/10 text-amber-900 border-amber-950/20',
    fontFamily: 'font-serif',
    borderColor: 'border-2 border-dashed border-amber-900/30',
  }
];
