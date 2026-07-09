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
}

export interface CurrentUser extends AuthUser {
  createdAt: string;
}

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
  machine: Machine;
}

export interface DailyReport {
  reportId: number;
  machineId: number;
  machineCode: string;
  siteId: number;
  date: string;
  activeHours: number;
  inactiveHours: number;
  effectiveUsagePercentage: number;
  hourlyRate: number;
  inactivityCost: number;
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
