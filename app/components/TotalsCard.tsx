interface TotalsCardProps {
  label: string;
  value: string;
  icon: string;
}

export default function TotalsCard({ label, value, icon }: TotalsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
      <span className="text-4xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
