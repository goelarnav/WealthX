"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { addRecommendation } from "@/app/admin/actions";
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

export function AddRecommendationDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [nseCode, setNseCode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setCompanyName("");
    setNseCode("");
    setPurchasePrice("");
    setPurchaseDate(today());
    setError(null);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addRecommendation({ companyName, nseCode, purchasePrice, purchaseDate });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
      toast.success(`Added ${companyName}`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button className="gap-1.5"><Plus className="size-4" />Add recommendation</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add recommendation</DialogTitle>
          <DialogDescription>Starts OPEN with current price equal to purchase price.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-company-name">Company name</Label>
            <Input
              id="add-company-name"
              placeholder="Yatharth Hospitals & Trauma Care"
              autoFocus
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-nse-code">NSE code</Label>
            <Input
              id="add-nse-code"
              placeholder="YATHARTH"
              value={nseCode}
              onChange={(event) => setNseCode(event.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="add-purchase-price">Purchase price (₹)</Label>
              <Input
                id="add-purchase-price"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="857"
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-purchase-date">Purchase date</Label>
              <Input
                id="add-purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={isPending}>Cancel</Button>} />
          <Button
            onClick={submit}
            disabled={isPending || companyName.trim().length < 2 || !nseCode.trim() || !(Number(purchasePrice) > 0)}
          >
            {isPending ? "Adding…" : "Add recommendation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
