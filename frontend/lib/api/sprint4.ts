import { apiBlobRequest, apiRequest } from "@/lib/api/client";
import type { AuditLogPage, ComparisonResult, FinalOptimizationReport, IncidentStatus, IncidentSeverity, MaintenanceRecord, TrendsResult, PrioritizedIncident } from "@/types/api";

const query = (values:Record<string,string|number|undefined>) => { const p=new URLSearchParams(); Object.entries(values).forEach(([k,v])=>v!==undefined&&v!==""&&p.set(k,String(v))); return p.toString(); };
export function getAuditLogs(values:Record<string,string|number|undefined>={}) { return apiRequest<AuditLogPage>(`/audit-logs?${query(values)}`); }
export function getMaintenance(machineId:number) { return apiRequest<MaintenanceRecord[]>(`/machines/${machineId}/maintenance`); }
type MaintenancePayload = Omit<MaintenanceRecord,"id"|"machineId"|"registeredBy"|"provider"|"nextMaintenanceDate"> & { provider?: string|null; nextMaintenanceDate?: string|null };
export function createMaintenance(machineId:number,payload:MaintenancePayload) { return apiRequest<MaintenanceRecord>(`/machines/${machineId}/maintenance`,{method:"POST",body:JSON.stringify(payload)}); }
export function updateMaintenance(id:number,payload:MaintenancePayload) { return apiRequest<MaintenanceRecord>(`/maintenance/${id}`,{method:"PATCH",body:JSON.stringify(payload)}); }
export function getComparison(values:{machineIds:string;from:string;to:string;siteId?:number}) { return apiRequest<ComparisonResult>(`/analytics/machines/comparison?${query(values)}`); }
export function getTrends(values:{from:string;to:string;groupBy:"daily"|"weekly";machineId?:number;siteId?:number}) { return apiRequest<TrendsResult>(`/analytics/usage-trends?${query(values)}`); }
export function getPrioritizedIncidents(values:{severity?:IncidentSeverity;status?:IncidentStatus;machineId?:number;siteId?:number}={}) { return apiRequest<PrioritizedIncident[]>(`/incidents/prioritized?${query(values)}`); }
export function updateIncidentStatus(id:number,status:IncidentStatus) { return apiRequest(`/incidents/${id}/status`,{method:"PATCH",body:JSON.stringify({status})}); }
export function createFinalReport(payload:{from:string;to:string;siteId?:number;machineIds?:string}) { return apiRequest<FinalOptimizationReport>("/reports/final-optimization",{method:"POST",body:JSON.stringify(payload)}); }
export function getFinalReports() { return apiRequest<FinalOptimizationReport[]>("/reports/final-optimization"); }
export function getFinalReport(id:number) { return apiRequest<FinalOptimizationReport>(`/reports/final-optimization/${id}`); }
export function downloadFinalReport(id:number) { return apiBlobRequest(`/reports/final-optimization/${id}/export`); }
