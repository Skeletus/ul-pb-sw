import { apiRequest } from "@/lib/api/client";
import type { CreateTelemetryRequest, SensorReading, TelemetryCreateResponse } from "@/types/api";

export function createTelemetry(payload: CreateTelemetryRequest) {
  return apiRequest<TelemetryCreateResponse>("/telemetry", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getTelemetryByMachine(machineId: number) {
  return apiRequest<SensorReading[]>(`/telemetry/machine/${machineId}`);
}
