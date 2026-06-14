type BadgeVariant = 'pending' | 'confirmed' | 'cancelled';

const variantClasses: Record<BadgeVariant, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Badge({ status }: { status: BadgeVariant }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${variantClasses[status]}`}>
      {status}
    </span>
  );
}
