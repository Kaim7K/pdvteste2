export function PageHeader({ title, description, right }: { title: string; description?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-white">{title}</h1>
        {description ? <p className="mt-1 text-sm text-pdv-muted">{description}</p> : null}
      </div>
      {right}
    </div>
  );
}
