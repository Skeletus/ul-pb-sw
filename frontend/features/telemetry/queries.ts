import { useMutation, useQuery } from "@tanstack/react-query";
import { createTelemetry, getTelemetryByMachine } from "@/lib/api/telemetry";
import type { CreateTelemetryRequest } from "@/types/api";

export const telemetryKeys = {
  all: ["telemetry"] as const,
  byMachine: (machineId: number) => [...telemetryKeys.all, "machine", machineId] as const
};

export function useTelemetryByMachine(machineId: number, enabled = true) {
  return useQuery({
    queryKey: telemetryKeys.byMachine(machineId),
    queryFn: () => getTelemetryByMachine(machineId),
    enabled
  });
}

export function useCreateTelemetryMutation() {
  return useMutation({
    mutationFn: (payload: CreateTelemetryRequest) => createTelemetry(payload)
  });
}
