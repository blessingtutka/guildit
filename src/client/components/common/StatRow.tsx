type StatRowProps = Readonly<{
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}>;

export function StatRow({ label, value, valueColor }: StatRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </span>
    </div>
  );
}
