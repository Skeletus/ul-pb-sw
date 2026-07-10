import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDailyReport, getGeneratedDailyReports } from "@/lib/api/reports";
import type { DailyReportQuery } from "@/types/api";

export const reportKeys = {
  all: ["reports"] as const,
  generatedDaily: () => [...reportKeys.all, "daily", "generated"] as const
};

export function useGeneratedDailyReports() {
  return useQuery({
    queryKey: reportKeys.generatedDaily(),
    queryFn: getGeneratedDailyReports
  });
}

export function useDailyReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query: DailyReportQuery) => getDailyReport(query),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportKeys.generatedDaily() })
  });
}
