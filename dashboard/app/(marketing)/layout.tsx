export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-10">
      {children}
    </div>
  );
}
