import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDailyReport, getGeneratedDailyReports, getSavingsProjection } from "@/lib/api/reports";
import type { DailyReportQuery } from "@/types/api";

export const reportKeys = {
  all: ["reports"] as const,
  generatedDaily: () => [...reportKeys.all, "daily", "generated"] as const
};

export function useGeneratedDailyReports(filters: { machineId?: number; from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: [...reportKeys.generatedDaily(), filters],
    queryFn: () => getGeneratedDailyReports(filters)
  });
}

export function useSavingsProjection(machineId: number, startDate: string, endDate: string) {
  return useQuery({ queryKey: [...reportKeys.all, "savings", machineId, startDate, endDate], queryFn: () => getSavingsProjection(machineId, startDate, endDate), enabled: machineId > 0 && Boolean(startDate) && Boolean(endDate) });
}

export function useDailyReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query: DailyReportQuery) => getDailyReport(query),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportKeys.generatedDaily() })
  });
}
