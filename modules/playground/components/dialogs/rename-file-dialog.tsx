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
import {
  getFileExtensionError,
  getPathSegmentError,
  normalizeFileExtension,
} from "../../lib/item-name-validation";

interface RenameFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (filename: string, extension: string) => void;
  currentFilename: string;
  currentExtension: string;
}

function RenameFileDialog({
  isOpen,
  onClose,
  onRename,
  currentFilename,
  currentExtension,
}: RenameFileDialogProps) {
  const [filename, setFilename] = React.useState(currentFilename);
  const [extension, setExtension] = React.useState(currentExtension);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFilename(currentFilename);
      setExtension(currentExtension);
      setError(null);
    }
  }, [isOpen, currentFilename, currentExtension]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedFilename = filename.trim();
    const normalizedExtension = normalizeFileExtension(
      extension,
      currentExtension
    );
    const nextError =
      getPathSegmentError(trimmedFilename, "Filename") ||
      getFileExtensionError(normalizedExtension);

    if (nextError) {
      setError(nextError);
      return;
    }

    onRename(trimmedFilename, normalizedExtension);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
          <DialogDescription>Enter a new name for the file.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="rename-filename" className="text-right">
                Filename
              </Label>
              <Input
                id="rename-filename"
                value={filename}
                onChange={(e) => {
                  setFilename(e.target.value);
                  setError(null);
                }}
                className="col-span-2"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="rename-extension" className="text-right">
                Extension
              </Label>
              <Input
                id="rename-extension"
                value={extension}
                onChange={(e) => {
                  setExtension(e.target.value);
                  setError(null);
                }}
                className="col-span-2"
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
            <Button type="submit" disabled={!filename.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RenameFileDialog;
