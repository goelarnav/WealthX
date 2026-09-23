import { requireUser } from "@/lib/auth/session";
import { Header } from "@/components/navigation/header";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <Header name={user.name} phone={user.phone} />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 md:pb-10">{children}</main>
      <MobileNav />
    </div>
  );
}
