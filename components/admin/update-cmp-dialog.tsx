"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCmp } from "@/app/admin/actions";
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

export function UpdateCmpDialog({
  recommendationId,
  companyName,
  currentPrice,
  dayChangePercent,
}: {
  recommendationId: string;
  companyName: string;
  currentPrice: number;
  dayChangePercent: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(currentPrice));
  const [change, setChange] = useState(dayChangePercent != null ? String(dayChangePercent) : "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await updateCmp(recommendationId, { currentPrice: price, dayChangePercent: change });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
      toast.success(`Updated ${companyName}`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setPrice(String(currentPrice));
          setChange(dayChangePercent != null ? String(dayChangePercent) : "");
        }
        setError(null);
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm">Update CMP</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update CMP — {companyName}</DialogTitle>
          <DialogDescription>
            Manual override. Values here get replaced by the next scheduled price refresh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-cmp-price">Current price (₹)</Label>
            <Input
              id="update-cmp-price"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              autoFocus
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-cmp-change">Day change % (optional)</Label>
            <Input
              id="update-cmp-change"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="e.g. 1.2 or -0.8"
              value={change}
              onChange={(event) => setChange(event.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={isPending}>Cancel</Button>} />
          <Button onClick={submit} disabled={isPending || !(Number(price) > 0)}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
