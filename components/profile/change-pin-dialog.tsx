"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changePin } from "@/app/(app)/profile/actions";
import { PinInput } from "@/components/auth/pin-input";
import { Button } from "@/components/ui/button";
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

export function ChangePinDialog() {
  const [open, setOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setError(null);
  }

  function submit() {
    setError(null);
    if (newPin !== confirmPin) {
      setError("New PINs don't match.");
      return;
    }
    startTransition(async () => {
      const result = await changePin(currentPin, newPin);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      toast.success("PIN updated");
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
      <DialogTrigger render={<Button variant="outline">Change PIN</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change PIN</DialogTitle>
          <DialogDescription>Enter your current PIN, then choose a new one.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Current PIN</Label>
            <PinInput value={currentPin} onChange={setCurrentPin} disabled={isPending} aria-label="Current PIN" />
          </div>
          <div className="space-y-2">
            <Label>New PIN</Label>
            <PinInput value={newPin} onChange={setNewPin} disabled={isPending} aria-label="New PIN" />
          </div>
          <div className="space-y-2">
            <Label>Confirm new PIN</Label>
            <PinInput value={confirmPin} onChange={setConfirmPin} disabled={isPending} aria-label="Confirm new PIN" />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={isPending}>Cancel</Button>} />
          <Button
            onClick={submit}
            disabled={isPending || currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4}
          >
            {isPending ? "Saving…" : "Update PIN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
