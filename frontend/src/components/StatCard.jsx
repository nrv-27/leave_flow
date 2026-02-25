export default function StatCard({ label, value, sub, accent = 'blue', icon }) {
  const colors = {
    blue: 'text-primary-400 bg-primary-500/10',
    green: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-surface-400">{label}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[accent]}`}>
            <span className="text-sm">{icon}</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
    </div>
  );
}
