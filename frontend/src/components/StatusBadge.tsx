type BadgeVariant = string;

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  // Offer
  Draft:     { bg: 'bg-slate-800', text: 'text-slate-300', dot: 'bg-slate-400' },
  Active:    { bg: 'bg-emerald-900/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  Paused:    { bg: 'bg-yellow-900/50', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  Expired:   { bg: 'bg-red-900/40', text: 'text-red-300', dot: 'bg-red-400' },
  Cancelled: { bg: 'bg-red-900/40', text: 'text-red-300', dot: 'bg-red-400' },
  // Slots
  Available: { bg: 'bg-emerald-900/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  Full:      { bg: 'bg-orange-900/50', text: 'text-orange-300', dot: 'bg-orange-400' },
  Closed:    { bg: 'bg-slate-800', text: 'text-slate-300', dot: 'bg-slate-400' },
  // Bookings
  Pending:   { bg: 'bg-yellow-900/50', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  Confirmed: { bg: 'bg-emerald-900/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  Completed: { bg: 'bg-blue-900/50', text: 'text-blue-300', dot: 'bg-blue-400' },
  NoShow:    { bg: 'bg-red-900/40', text: 'text-red-300', dot: 'bg-red-400' },
};

interface Props {
  status: BadgeVariant;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const cfg = statusConfig[status] ?? statusConfig['Draft'];
  const px = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
