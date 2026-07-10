import { describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import { synchronizeRealtimeQueries } from "@/features/realtime/realtime-sync";

describe("synchronizeRealtimeQueries", () => {
  function createQueryClient() {
    return {
      invalidateQueries: vi.fn().mockResolvedValue(undefined)
    } as unknown as QueryClient;
  }

  it("refreshes machine lists, detail, and status after a status event", async () => {
    const queryClient = createQueryClient();
    await synchronizeRealtimeQueries(queryClient, { kind: "machine", machineId: 12 });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["machinery"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["machinery", "detail", 12] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["machinery", "status", 12] });
  });

  it("refreshes active alerts and alert history after alert events", async () => {
    const queryClient = createQueryClient();
    await synchronizeRealtimeQueries(queryClient, { kind: "alert", machineId: 12 });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["alerts"] });
  });

  it("recovers authoritative machine and alert state after reconnecting", async () => {
    const queryClient = createQueryClient();
    await synchronizeRealtimeQueries(queryClient, { kind: "connected" });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["machinery"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["alerts"] });
  });
});
