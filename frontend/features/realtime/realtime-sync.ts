import type { QueryClient } from "@tanstack/react-query";
import { alertKeys } from "@/features/alerts/queries";
import { machineryKeys } from "@/features/machinery/queries";

export type RealtimeSyncTarget =
  | { kind: "connected" }
  | { kind: "machine"; machineId: number }
  | { kind: "alert"; machineId: number };

export async function synchronizeRealtimeQueries(
  queryClient: QueryClient,
  target: RealtimeSyncTarget
) {
  const invalidations: Promise<unknown>[] = [];

  if (target.kind === "connected" || target.kind === "machine") {
    invalidations.push(queryClient.invalidateQueries({ queryKey: machineryKeys.all }));
  }

  if (target.kind === "machine") {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: machineryKeys.detail(target.machineId) }),
      queryClient.invalidateQueries({ queryKey: machineryKeys.status(target.machineId) })
    );
  }

  if (target.kind === "connected" || target.kind === "alert") {
    invalidations.push(queryClient.invalidateQueries({ queryKey: alertKeys.all }));
  }

  await Promise.all(invalidations);
}
