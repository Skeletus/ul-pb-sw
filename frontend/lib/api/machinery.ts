import { apiRequest } from "@/lib/api/client";
import type { CreateMachineRequest, Machine, MachineStatusResponse, MachineWithSite } from "@/types/api";

export function getMachines(siteId?: number) {
  return apiRequest<MachineWithSite[]>(siteId ? `/machines?siteId=${siteId}` : "/machines");
}

export function updateMachine(id: number, payload: { code?: string; type?: string; siteId?: number }) { return apiRequest<MachineWithSite>(`/machines/${id}`, { method: "PATCH", body: JSON.stringify(payload) }); }
export function decommissionMachine(id: number) { return apiRequest<MachineWithSite>(`/machines/${id}/decommission`, { method: "PATCH" }); }

export function getMachineById(id: number) {
  return apiRequest<MachineWithSite>(`/machines/${id}`);
}

export function createMachine(payload: CreateMachineRequest) {
  return apiRequest<Machine>("/machines", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMachineStatus(id: number) {
  return apiRequest<MachineStatusResponse>(`/machines/${id}/status`);
}
