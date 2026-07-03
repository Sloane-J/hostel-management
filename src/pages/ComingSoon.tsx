interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed py-24 text-center">
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  );
}