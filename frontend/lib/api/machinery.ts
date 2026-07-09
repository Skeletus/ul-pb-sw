import { apiRequest } from "@/lib/api/client";
import type { CreateMachineRequest, Machine, MachineStatusResponse, MachineWithSite } from "@/types/api";

export function getMachines() {
  return apiRequest<MachineWithSite[]>("/machines");
}

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
