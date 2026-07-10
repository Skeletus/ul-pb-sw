import { apiRequest } from "@/lib/api/client";
import type { AlertConfiguration } from "@/types/api";
export function getAlertConfiguration(machineId: number) { return apiRequest<AlertConfiguration>(`/machines/${machineId}/alert-configuration`); }
export function updateAlertConfiguration(machineId: number, inactivityThresholdMinutes: number) { return apiRequest<AlertConfiguration>(`/machines/${machineId}/alert-configuration`, { method: "PUT", body: JSON.stringify({ inactivityThresholdMinutes }) }); }
