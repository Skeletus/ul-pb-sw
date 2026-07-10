import { apiRequest } from "@/lib/api/client";
import type { DailyReport, DailyReportQuery } from "@/types/api";

export function getDailyReport(query: DailyReportQuery) {
  const params = new URLSearchParams({
    machineId: String(query.machineId),
    date: query.date
  });

  return apiRequest<DailyReport>(`/reports/daily?${params.toString()}`);
}

export function getGeneratedDailyReports() {
  return apiRequest<DailyReport[]>("/reports/daily/generated");
}
