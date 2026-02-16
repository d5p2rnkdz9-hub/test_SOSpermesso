export function ContentColumn({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[520px] px-4 py-6">
      {children}
    </main>
  );
}
