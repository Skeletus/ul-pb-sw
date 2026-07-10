import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/sprint2";

export const sprint2Keys = { contracts: (id: number) => ["contracts", id] as const, sensor: (id: number) => ["sensor", id] as const, energy: (id: number, from: string, to: string) => ["energy", id, from, to] as const, incidents: (id: number) => ["incidents", id] as const, comparison: (from: string, to: string) => ["usage-comparison", from, to] as const };
export const useContracts = (id: number) => useQuery({ queryKey: sprint2Keys.contracts(id), queryFn: () => api.getContracts(id), enabled: id > 0 });
export const useSensor = (id: number) => useQuery({ queryKey: sprint2Keys.sensor(id), queryFn: () => api.getSensor(id), enabled: id > 0 });
export const useEnergy = (id: number, from: string, to: string) => useQuery({ queryKey: sprint2Keys.energy(id, from, to), queryFn: () => api.getEnergy(id, from, to), enabled: id > 0 && Boolean(from && to), retry: false });
export function useCreateContract(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (payload: { startDate: string; endDate: string; totalCost: number; hourlyRate: number }) => api.createContract(id, payload), onSuccess: () => client.invalidateQueries({ queryKey: sprint2Keys.contracts(id) }) }); }
export function useAssociateSensor(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (identifier: string) => api.associateSensor(id, identifier), onSuccess: () => client.invalidateQueries({ queryKey: sprint2Keys.sensor(id) }) }); }
export const useIncidents = (id: number) => useQuery({ queryKey: sprint2Keys.incidents(id), queryFn: () => api.getIncidents(id), enabled: id > 0 });
export function useCreateIncident(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (payload: { title: string; description: string; severity: string }) => api.createIncident(id, payload), onSuccess: () => client.invalidateQueries({ queryKey: sprint2Keys.incidents(id) }) }); }
export const useUsageComparison = (from: string, to: string) => useQuery({ queryKey: sprint2Keys.comparison(from, to), queryFn: () => api.getUsageComparison(from, to), enabled: Boolean(from && to), retry: false });
