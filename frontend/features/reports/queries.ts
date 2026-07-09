import { useMutation } from "@tanstack/react-query";
import { getDailyReport } from "@/lib/api/reports";
import type { DailyReportQuery } from "@/types/api";

export function useDailyReportMutation() {
  return useMutation({
    mutationFn: (query: DailyReportQuery) => getDailyReport(query)
  });
}
