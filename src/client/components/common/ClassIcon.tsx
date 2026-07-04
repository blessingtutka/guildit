import { type ClassMeta } from '../../../shared/web';

export function ClassIcon({
  classMeta,
  className = 'size-5',
}: Readonly<{
  classMeta: ClassMeta;
  className?: string;
}>) {
  const Icon = classMeta.icon;
  return (
    <Icon
      className={`${className} text-foreground`}
      style={{ color: classMeta.color }}
    />
  );
}
