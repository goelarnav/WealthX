"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { exit } from "@/app/(app)/portfolio/actions";
import { formatInr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function ExitDialog({
  investmentId,
  companyName,
  currentPrice,
}: {
  investmentId: string;
  companyName: string;
  currentPrice: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [exitPrice, setExitPrice] = useState(String(currentPrice));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await exit(investmentId, exitPrice);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
      toast.success(`Exited ${companyName}`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setExitPrice(String(currentPrice));
        setError(null);
      }}
    >
      <DialogTrigger render={<Button variant="destructive" size="sm">Exit position</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Exit {companyName}</DialogTitle>
          <DialogDescription>
            Record the price you actually exited at — it doesn&rsquo;t have to match the live market price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="exit-price">Exit price (₹)</Label>
          <Input
            id="exit-price"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            autoFocus
            value={exitPrice}
            onChange={(event) => setExitPrice(event.target.value)}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">Current market price: {formatInr(currentPrice)}</p>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={isPending}>Cancel</Button>} />
          <Button
            variant="destructive"
            onClick={submit}
            disabled={isPending || !(Number(exitPrice) > 0)}
          >
            {isPending ? "Recording…" : "Confirm exit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
