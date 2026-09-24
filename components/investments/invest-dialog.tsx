"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { invest } from "@/app/(app)/portfolio/actions";
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

export function InvestDialog({
  recommendationId,
  companyName,
  currentPrice,
}: {
  recommendationId: string;
  companyName: string;
  currentPrice: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsedAmount = Number(amount);
  const units = parsedAmount > 0 ? parsedAmount / currentPrice : 0;

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await invest(recommendationId, amount);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setAmount("");
      router.refresh();
      toast.success(`Invested ${formatInr(parsedAmount)} in ${companyName}`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setAmount("");
          setError(null);
        }
      }}
    >
      <DialogTrigger render={<Button className="w-full sm:w-auto">Invest</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invest in {companyName}</DialogTitle>
          <DialogDescription>At today&rsquo;s price of {formatInr(currentPrice)}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="invest-amount">Amount (₹)</Label>
          <Input
            id="invest-amount"
            type="number"
            inputMode="decimal"
            min="1"
            placeholder="10000"
            autoFocus
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={isPending}
          />
          {parsedAmount > 0 ? (
            <p className="text-xs text-muted-foreground">≈ {units.toFixed(2)} units at current price</p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={isPending}>Cancel</Button>} />
          <Button onClick={submit} disabled={isPending || !(parsedAmount > 0)}>
            {isPending ? "Investing…" : "Confirm investment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
