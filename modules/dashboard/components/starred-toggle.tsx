"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarIcon, StarOffIcon } from "lucide-react";
import type React from "react";
import { forwardRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { togglePlaygroundStar } from "../actions";

interface StarredToggleButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  starred: boolean;
  id: string;
}

export const StarredToggleButton = forwardRef<
  HTMLButtonElement,
  StarredToggleButtonProps
>(({ starred, id, onClick, className, children, ...props }, ref) => {
  const [isStarred, setIsStarred] = useState(starred);

  useEffect(() => {
    setIsStarred(starred);
  }, [starred]);

  const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    const nextStarred = !isStarred;
    setIsStarred(nextStarred);

    try {
      const result = await togglePlaygroundStar(id, nextStarred);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(
        nextStarred ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error) {
      console.error("Failed to update favorite:", error);
      setIsStarred(!nextStarred);
      toast.error("Failed to update favorite");
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "flex w-full cursor-pointer items-center justify-start rounded-md px-2 py-1.5 text-sm",
        className
      )}
      onClick={handleToggle}
      {...props}
    >
      {isStarred ? (
        <StarIcon size={16} className="mr-2 text-red-500" />
      ) : (
        <StarOffIcon size={16} className="mr-2 text-gray-500" />
      )}
      {children || (isStarred ? "Remove favorite" : "Add to favorites")}
    </Button>
  );
});

StarredToggleButton.displayName = "StarredToggleButton";
