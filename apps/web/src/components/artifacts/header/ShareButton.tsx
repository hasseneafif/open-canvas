"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { toast } from "@/hooks/use-toast";
import { ArtifactCodeV3, ArtifactMarkdownV3 } from "@opencanvas/shared/types";

interface ShareButtonProps {
  currentArtifactContent: ArtifactCodeV3 | ArtifactMarkdownV3;
}

export function ShareButton({ currentArtifactContent }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifactContent: currentArtifactContent }),
      });

      if (!res.ok) {
        throw new Error("Failed to create share link");
      }

      const { shareId } = await res.json();
      const shareUrl = `${window.location.origin}/share/${shareId}`;

      await navigator.clipboard.writeText(shareUrl);

      toast({ title: "Link copied!", description: shareUrl });
    } catch {
      toast({
        title: "Failed to share",
        description: "Could not create a share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TooltipIconButton
      tooltip="Copy share link"
      variant="ghost"
      className="w-8 h-8"
      delayDuration={400}
      onClick={handleShare}
      disabled={isSharing}
    >
      <Share2 className="text-gray-600" />
    </TooltipIconButton>
  );
}
