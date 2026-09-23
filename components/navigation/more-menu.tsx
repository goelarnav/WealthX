"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { CALCULATORS } from "@/lib/calculators";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MoreMenu() {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/calculators");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1 text-sm font-medium outline-none transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        More
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Calculators</DropdownMenuLabel>
          {CALCULATORS.map((calculator) => (
            <DropdownMenuItem
              key={calculator.slug}
              render={
                <Link href={`/calculators/${calculator.slug}`} className="flex items-start gap-2.5">
                  <calculator.icon className="mt-0.5 size-4 text-teal-600" />
                  <span>{calculator.name}</span>
                </Link>
              }
            />
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href="/calculators" className="flex items-center gap-2.5 text-muted-foreground">
              <LayoutGrid className="size-4" />
              <span>View all</span>
            </Link>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
