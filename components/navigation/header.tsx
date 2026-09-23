import Link from "next/link";
import { Brand } from "@/components/navigation/brand";
import { NavLink } from "@/components/navigation/nav-link";
import { MoreMenu } from "@/components/navigation/more-menu";
import { UserMenu } from "@/components/navigation/user-menu";

export function Header({ name, phone }: { name: string; phone: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/dashboard">Recommendations</NavLink>
            <MoreMenu />
          </nav>
        </div>
        <UserMenu name={name} phone={phone} />
      </div>
    </header>
  );
}
