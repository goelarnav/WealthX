"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { closeRecommendationAction } from "@/app/admin/actions";
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

const today = () => new Date().toISOString().slice(0, 10);

export function CloseRecommendationDialog({
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
  const [sellPrice, setSellPrice] = useState(String(currentPrice));
  const [sellDate, setSellDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await closeRecommendationAction(recommendationId, { sellPrice, sellDate });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
      toast.success(`Closed ${companyName}`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSellPrice(String(currentPrice));
          setSellDate(today());
        }
        setError(null);
      }}
    >
      <DialogTrigger render={<Button variant="destructive" size="sm">Close</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Close {companyName}</DialogTitle>
          <DialogDescription>
            Marks the recommendation CLOSED. Users with an active position can still exit on their own —
            closing this doesn&rsquo;t affect them automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="close-sell-price">Sell price (₹)</Label>
            <Input
              id="close-sell-price"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              autoFocus
              value={sellPrice}
              onChange={(event) => setSellPrice(event.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close-sell-date">Sell date</Label>
            <Input
              id="close-sell-date"
              type="date"
              value={sellDate}
              onChange={(event) => setSellDate(event.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={isPending}>Cancel</Button>} />
          <Button variant="destructive" onClick={submit} disabled={isPending || !(Number(sellPrice) > 0)}>
            {isPending ? "Closing…" : "Confirm close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
