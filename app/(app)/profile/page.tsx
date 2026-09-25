import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { requireUser, type SessionUser } from "@/lib/auth/session";
import { logout } from "@/app/(app)/profile/actions";
import { formatDate } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ChangePinDialog } from "@/components/profile/change-pin-dialog";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Profile — WealthX" };

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function ProfilePage() {
  const user: SessionUser = await requireUser();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>

      <Reveal>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 ring-2 ring-teal-100 ring-offset-2">
              <AvatarFallback className="bg-gradient-to-br from-teal-100 to-teal-200 text-lg font-semibold text-teal-800">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            </div>
          </div>

          <div className="mt-5 divide-y border-t pt-1">
            <div className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-muted-foreground">Account created</span>
              <span className="font-medium text-foreground">{formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <EditProfileDialog currentName={user.name} />
            <ChangePinDialog />
          </div>
        </div>
      </Reveal>

      <form action={logout}>
        <Button type="submit" variant="ghost" className="w-full justify-center gap-2 text-destructive hover:text-destructive">
          <LogOut className="size-4" />
          Logout
        </Button>
      </form>
    </div>
  );
}
