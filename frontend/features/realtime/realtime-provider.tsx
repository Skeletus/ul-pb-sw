"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/features/auth/auth-store";
import { synchronizeRealtimeQueries } from "@/features/realtime/realtime-sync";
import { getApiOrigin } from "@/lib/api/client";
import type { AlertRealtimeEvent, MachineStatusChangedEvent } from "@/types/api";

type ServerToClientEvents = {
  "machine.status.changed": (event: MachineStatusChangedEvent) => void;
  "alert.created": (event: AlertRealtimeEvent) => void;
  "alert.resolved": (event: AlertRealtimeEvent) => void;
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    const socket: Socket<ServerToClientEvents> = io(`${getApiOrigin()}/realtime`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true
    });
    socket.on("connect", () => {
      void synchronizeRealtimeQueries(queryClient, { kind: "connected" });
    });
    socket.on("machine.status.changed", (event) => {
      void synchronizeRealtimeQueries(queryClient, { kind: "machine", machineId: event.machineId });
    });
    const handleAlert = (event: AlertRealtimeEvent) => {
      void synchronizeRealtimeQueries(queryClient, { kind: "alert", machineId: event.machineId });
    };
    socket.on("alert.created", handleAlert);
    socket.on("alert.resolved", handleAlert);

    return () => {
      socket.disconnect();
    };
  }, [hydrated, queryClient, token]);

  return children;
}
