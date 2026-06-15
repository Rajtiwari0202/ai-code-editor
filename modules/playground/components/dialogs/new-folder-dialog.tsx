"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { getPathSegmentError } from "../../lib/item-name-validation";

interface NewFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

function NewFolderDialog({
  isOpen,
  onClose,
  onCreateFolder,
}: NewFolderDialogProps) {
  const [folderName, setFolderName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFolderName = folderName.trim();
    const nextError = getPathSegmentError(trimmedFolderName, "Folder name");

    if (nextError) {
      setError(nextError);
      return;
    }

    onCreateFolder(trimmedFolderName);
    setFolderName("");
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Enter a name for the new folder.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="foldername" className="text-right">
                Folder Name
              </Label>
              <Input
                id="foldername"
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  setError(null);
                }}
                className="col-span-2"
                autoFocus
                placeholder="components"
              />
            </div>
            {error && (
              <p className="col-span-3 text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewFolderDialog;
