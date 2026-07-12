import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/sprint4";
export const sprint4Keys={audit:["audit"] as const,maintenance:(id:number)=>["maintenance",id] as const,comparison:(q:string)=>["comparison",q] as const,trends:(q:string)=>["trends",q] as const,incidents:(q:string)=>["prioritized-incidents",q] as const,finalReports:["final-reports"] as const};
export const useAuditLogs=(q:Record<string,string|number|undefined>)=>useQuery({queryKey:[...sprint4Keys.audit,q],queryFn:()=>api.getAuditLogs(q)});
export const useMaintenance=(id:number)=>useQuery({queryKey:sprint4Keys.maintenance(id),queryFn:()=>api.getMaintenance(id),enabled:id>0});
export function useCreateMaintenance(id:number){const c=useQueryClient();return useMutation({mutationFn:(p:Parameters<typeof api.createMaintenance>[1])=>api.createMaintenance(id,p),onSuccess:()=>c.invalidateQueries({queryKey:sprint4Keys.maintenance(id)})});}
export const useComparison=(q:Parameters<typeof api.getComparison>[0],enabled:boolean)=>useQuery({queryKey:sprint4Keys.comparison(JSON.stringify(q)),queryFn:()=>api.getComparison(q),enabled});
export const useTrends=(q:Parameters<typeof api.getTrends>[0],enabled:boolean)=>useQuery({queryKey:sprint4Keys.trends(JSON.stringify(q)),queryFn:()=>api.getTrends(q),enabled});
export const usePrioritizedIncidents=(q:Parameters<typeof api.getPrioritizedIncidents>[0])=>useQuery({queryKey:sprint4Keys.incidents(JSON.stringify(q)),queryFn:()=>api.getPrioritizedIncidents(q)});
export function useUpdateIncidentStatus(){const c=useQueryClient();return useMutation({mutationFn:({id,status}:{id:number;status:Parameters<typeof api.updateIncidentStatus>[1]})=>api.updateIncidentStatus(id,status),onSuccess:()=>c.invalidateQueries({queryKey:["prioritized-incidents"]})});}
export function useFinalReports(){return useQuery({queryKey:sprint4Keys.finalReports,queryFn:api.getFinalReports});}
export function useCreateFinalReport(){const c=useQueryClient();return useMutation({mutationFn:api.createFinalReport,onSuccess:()=>c.invalidateQueries({queryKey:sprint4Keys.finalReports})});}
