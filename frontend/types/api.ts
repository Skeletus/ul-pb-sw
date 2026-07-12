export enum MachineStatus {
  REGISTERED = "REGISTERED",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  POWERED_ON_NO_PRODUCTIVE_USE = "POWERED_ON_NO_PRODUCTIVE_USE",
  UNDER_DOCUMENTED_MAINTENANCE = "UNDER_DOCUMENTED_MAINTENANCE",
  DECOMMISSIONED = "DECOMMISSIONED"
}

export enum AlertStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED"
}

export type AlertPriority = "HIGH" | string;
export type ReportType = "DAILY";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  status: string;
  role?: { id: number; name: string } | null;
}

export interface CurrentUser extends AuthUser {
  createdAt: string;
}

export interface SavingsProjection { machineId: number; startDate: string; endDate: string; currentInactivityCost: number; targetReductionRate: number; projectedSavings: number; currency: string; explanation: string; }
export interface AlertConfiguration { machineId: number; inactivityThresholdMinutes: number; active: boolean; customized?: boolean; }
export interface Role { id: number; name: string; }
export interface UserSummary { id: number; name: string; email: string; status: string; role: Role | null; }

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Site {
  id: number;
  name: string;
  location: string | null;
}

export interface Machine {
  id: number;
  siteId: number;
  code: string;
  type: string;
  currentStatus: MachineStatus;
  hourlyRate: string;
}

export interface MachineWithSite extends Machine {
  site: Site;
}

export interface MachineStatusResponse {
  machineId: number;
  code: string;
  currentStatus: MachineStatus;
  lastStateStartDate: string | null;
}

export interface SensorReading {
  id: number;
  machineId: number;
  timestamp: string;
  vibration: string;
  energyConsumption: string;
}

export interface MachineStateRecord {
  id: number;
  machineId: number;
  status: MachineStatus;
  startDate: string;
  endDate: string | null;
}

export interface MachineWithLatestState extends Machine {
  machineStateRecords: MachineStateRecord[];
}

export interface TelemetryCreateResponse {
  reading: SensorReading;
  machineState: MachineWithLatestState | null;
}

export interface Alert {
  id: number;
  machineId: number;
  priority: AlertPriority;
  status: AlertStatus;
  generationDate: string;
  resolvedDate: string | null;
}

export interface AlertWithMachine extends Alert {
  stateRecordId: number | null;
  inactiveSince: string;
  inactiveDurationMinutes: number;
  machine: Machine & { site: Site };
}

export interface DailyReport {
  reportId: number;
  machineId: number;
  machineCode: string;
  siteId: number;
  siteName: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  activeHours: number;
  inactiveHours: number;
  totalClassifiedHours: number;
  effectiveUsagePercentage: number | null;
  hourlyRate: number;
  inactivityCost: number;
  hasData: boolean;
}

export type ContractStatus = "VALID" | "EXPIRED" | "CANCELLED" | "RENEWED";
export interface RentalContract { id: number; machineId: number; startDate: string; endDate: string; durationDays: number; totalCost: string; hourlyRate: string; status: ContractStatus; }
export type SensorStatus = "AVAILABLE" | "ASSOCIATED" | "ACTIVE" | "DISCONNECTED" | "ERROR";
export interface Sensor { id: number; machineId: number | null; identifier: string; type: string; status: SensorStatus; installedAt: string | null; lastConnectionAt: string | null; }
export interface EnergyConsumption { machineId: number; sensorId: number; from: string; to: string; timeZone: string; interval: "HOUR" | "DAY" | null; totalConsumption: number; averageConsumption: number | null; minimumConsumption: number | null; maximumConsumption: number | null; readingCount: number; }
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export interface OperationalIncident { id: number; alertId: number; machineId: number; siteId: number; title: string; description: string; severity: IncidentSeverity; status: IncidentStatus; registrationDate: string; registeredBy: Pick<AuthUser, "id" | "name" | "email">; }
export interface PrioritizedIncident extends OperationalIncident { priorityScore: number; machine?: MachineWithSite; }
export interface MaintenanceRecord { id:number; machineId:number; maintenanceDate:string; type:string; description:string; status:string; cost:string|number; provider:string|null; nextMaintenanceDate:string|null; registeredBy?:Pick<AuthUser,"id"|"name">; }
export interface AuditLog { id:number; userId:number|null; action:string; resource:string; resourceId:string|null; occurredAt:string; result:"SUCCESS"|"FAILURE"; metadata:Record<string,unknown>|null; user:{id:number;name:string;email:string}|null; }
export interface AuditLogPage { items:AuditLog[]; page:number; pageSize:number; total:number; totalPages:number; }
export interface AnalyticsMachine { machineId:number; machineCode:string; machineType:string; siteId:number; siteName:string; activeHours:number; inactiveHours:number; totalHours:number; effectiveUsagePercentage:number|null; energyConsumption:number; inactivityCost:number; alertCount:number; incidentCount:number; maintenanceCount:number; currentStatus:MachineStatus; hasData:boolean; }
export interface ComparisonResult { from:string; to:string; timeZone:string; machines:AnalyticsMachine[]; }
export interface TrendPoint { period:string; activeHours:number; inactiveHours:number; effectiveUsagePercentage:number|null; energyConsumption:number; inactivityCost:number; hasData:boolean; }
export interface TrendsResult { from:string; to:string; groupBy:"daily"|"weekly"; timeZone:string; data:TrendPoint[]; }
export interface FinalOptimizationReport { id:number; siteId:number|null; machineIds:number[]; startDate:string; endDate:string; generatedAt:string; summary:Record<string,number>; machineMetrics:Array<Record<string,unknown>>; recommendations:Array<{action:string;justification:string}>; incidentMetrics:Record<string,number>; maintenanceMetrics:Record<string,number>; }
export interface UsageComparisonMachine { machineId: number; machineCode: string; machineType: string; siteId: number; siteName: string; activeHours: number; inactiveHours: number; totalClassifiedHours: number; effectiveUsagePercentage: number; hourlyRate: number; inactivityCost: number; availableOperatingCost: number; lowUtilization: boolean; }
export interface UsageComparison { from: string; to: string; timeZone: string; lowUtilizationThreshold: number; machines: UsageComparisonMachine[]; }

export interface MachineStatusChangedEvent {
  machineId: number;
  machineCode: string;
  siteId: number;
  status: MachineStatus;
  effectiveAt: string;
  stateRecordId: number;
}

export interface AlertRealtimeEvent {
  alertId: number;
  machineId: number;
  machineCode: string;
  siteId: number;
  siteName: string;
  priority: string;
  status: AlertStatus;
  generationDate: string;
  resolvedDate: string | null;
  inactiveSince: string;
  inactiveDurationMinutes: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateMachineRequest {
  siteId: number;
  code: string;
  type: string;
  hourlyRate?: number;
}

export interface CreateTelemetryRequest {
  machineId: number;
  vibrationValue: number;
  energyConsumption: number;
  timestamp?: string;
}

export interface DailyReportQuery {
  machineId: number;
  date: string;
}
