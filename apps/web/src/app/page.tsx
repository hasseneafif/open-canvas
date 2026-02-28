"use client";

import { Canvas } from "@/components/canvas";
import { UserProvider } from "@/contexts/UserContext";
import { AssistantProvider } from "@/contexts/AssistantContext";
import { ThreadProvider } from "@/contexts/ThreadProvider";
import { GraphProvider } from "@/contexts/GraphContext";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <UserProvider>
      <AssistantProvider>
        <ThreadProvider>
          <GraphProvider>
            <Canvas />
            <Toaster />
          </GraphProvider>
        </ThreadProvider>
      </AssistantProvider>
    </UserProvider>
  );
}
