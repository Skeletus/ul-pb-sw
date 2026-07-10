import { apiBlobRequest, apiRequest } from "@/lib/api/client";
import type { EnergyConsumption, OperationalIncident, RentalContract, Sensor, UsageComparison } from "@/types/api";

export const requestPasswordReset = (email: string) => apiRequest<{ message: string }>("/auth/forgot-password", { method: "POST", authenticated: false, body: JSON.stringify({ email }) });
export const validateResetToken = (token: string) => apiRequest<{ valid: true; expiresAt: string }>(`/auth/reset-password/validate?token=${encodeURIComponent(token)}`, { authenticated: false });
export const resetPassword = (token: string, newPassword: string) => apiRequest<{ message: string }>("/auth/reset-password", { method: "POST", authenticated: false, body: JSON.stringify({ token, newPassword }) });
export const getContracts = (machineId: number) => apiRequest<RentalContract[]>(`/machines/${machineId}/contracts`);
export const createContract = (machineId: number, payload: { startDate: string; endDate: string; totalCost: number; hourlyRate: number }) => apiRequest<RentalContract>(`/machines/${machineId}/contracts`, { method: "POST", body: JSON.stringify(payload) });
export const getSensor = (machineId: number) => apiRequest<Sensor | null>(`/machines/${machineId}/sensor`);
export const associateSensor = (machineId: number, identifier: string) => apiRequest<Sensor>(`/machines/${machineId}/sensor`, { method: "POST", body: JSON.stringify({ identifier }) });
export const getEnergy = (machineId: number, from: string, to: string) => apiRequest<EnergyConsumption>(`/telemetry/machine/${machineId}/energy?${new URLSearchParams({ from, to })}`);
export const getIncidents = (alertId: number) => apiRequest<OperationalIncident[]>(`/alerts/${alertId}/incidents`);
export const createIncident = (alertId: number, payload: { title: string; description: string; severity: string }) => apiRequest<OperationalIncident>(`/alerts/${alertId}/incidents`, { method: "POST", body: JSON.stringify(payload) });
export const getUsageComparison = (from: string, to: string, siteId?: number, threshold?: number) => {
  const params = new URLSearchParams({ from, to });
  if (siteId) params.set("siteId", String(siteId));
  if (threshold !== undefined) params.set("lowUtilizationThreshold", String(threshold));
  return apiRequest<UsageComparison>(`/reports/usage-comparison?${params}`);
};
export const downloadUsagePdf = (machineId: number, from: string, to: string) => apiBlobRequest(`/reports/machines/${machineId}/pdf?${new URLSearchParams({ from, to })}`);
