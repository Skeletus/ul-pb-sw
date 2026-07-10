import { apiRequest } from "@/lib/api/client";
import type { DailyReport, DailyReportQuery, SavingsProjection } from "@/types/api";

export function getDailyReport(query: DailyReportQuery) {
  const params = new URLSearchParams({
    machineId: String(query.machineId),
    date: query.date
  });

  return apiRequest<DailyReport>(`/reports/daily?${params.toString()}`);
}

export function getGeneratedDailyReports(filters: { machineId?: number; from?: string; to?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.machineId) params.set("machineId", String(filters.machineId));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<DailyReport[]>(`/reports/daily/generated${suffix}`);
}

export function getSavingsProjection(machineId: number, startDate: string, endDate: string) {
  const params = new URLSearchParams({ machineId: String(machineId), startDate, endDate });
  return apiRequest<SavingsProjection>(`/reports/savings-projection?${params.toString()}`);
}
