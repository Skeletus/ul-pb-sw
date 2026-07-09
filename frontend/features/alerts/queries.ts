import { useQuery } from "@tanstack/react-query";
import { getActiveAlerts, getAlertById, getAlerts } from "@/lib/api/alerts";

export const alertKeys = {
  all: ["alerts"] as const,
  active: () => [...alertKeys.all, "active"] as const,
  list: () => [...alertKeys.all, "list"] as const,
  detail: (id: number) => [...alertKeys.all, "detail", id] as const
};

export function useActiveAlerts() {
  return useQuery({
    queryKey: alertKeys.active(),
    queryFn: getActiveAlerts
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: alertKeys.list(),
    queryFn: getAlerts
  });
}

export function useAlert(id: number, enabled = true) {
  return useQuery({
    queryKey: alertKeys.detail(id),
    queryFn: () => getAlertById(id),
    enabled
  });
}
