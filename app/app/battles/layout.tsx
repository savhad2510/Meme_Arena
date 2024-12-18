export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#080B0F] min-h-screen p-6">
      {children}
    </section>
  );
}
