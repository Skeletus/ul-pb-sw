import { apiRequest } from "@/lib/api/client";
import type { AlertWithMachine } from "@/types/api";

export function getActiveAlerts() {
  return apiRequest<AlertWithMachine[]>("/alerts/active");
}

export function getAlerts() {
  return apiRequest<AlertWithMachine[]>("/alerts");
}

export function getAlertById(id: number) {
  return apiRequest<AlertWithMachine>(`/alerts/${id}`);
}
