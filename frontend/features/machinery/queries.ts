import { useMutation, useQuery } from "@tanstack/react-query";
import { createMachine, getMachineById, getMachines, getMachineStatus } from "@/lib/api/machinery";
import type { CreateMachineRequest } from "@/types/api";

export const machineryKeys = {
  all: ["machinery"] as const,
  lists: () => [...machineryKeys.all, "list"] as const,
  detail: (id: number) => [...machineryKeys.all, "detail", id] as const,
  status: (id: number) => [...machineryKeys.all, "status", id] as const
};

export function useMachines() {
  return useQuery({
    queryKey: machineryKeys.lists(),
    queryFn: getMachines
  });
}

export function useMachine(id: number, enabled = true) {
  return useQuery({
    queryKey: machineryKeys.detail(id),
    queryFn: () => getMachineById(id),
    enabled
  });
}

export function useMachineStatus(id: number, enabled = true) {
  return useQuery({
    queryKey: machineryKeys.status(id),
    queryFn: () => getMachineStatus(id),
    enabled
  });
}

export function useCreateMachineMutation() {
  return useMutation({
    mutationFn: (payload: CreateMachineRequest) => createMachine(payload)
  });
}
