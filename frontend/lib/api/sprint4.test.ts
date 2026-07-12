import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/sprint4";
describe("Sprint 4 API integration", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ items: [], data: [], machines: [] }), blob: () => Promise.resolve(new Blob(["%PDF"])) })));
  it("loads paginated audit logs with filters", async () => { await api.getAuditLogs({ page: 2, action: "LOGIN" }); expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/audit-logs?page=2"), expect.any(Object)); });
  it("creates and loads machine maintenance history", async () => { await api.createMaintenance(4, { maintenanceDate: "2026-07-01", type: "PREVENTIVE", description: "Oil", status: "COMPLETED", cost: 20 }); await api.getMaintenance(4); expect(fetch).toHaveBeenCalledTimes(2); });
  it("requests comparison and daily trends from the backend", async () => { await api.getComparison({ machineIds: "1,2", from: "2026-07-01", to: "2026-07-31" }); await api.getTrends({ from: "2026-07-01", to: "2026-07-31", groupBy: "daily" }); expect(fetch).toHaveBeenCalledTimes(2); });
  it("loads prioritized incidents and changes their status", async () => { await api.getPrioritizedIncidents({ severity: "CRITICAL" }); await api.updateIncidentStatus(8, "RESOLVED"); expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/incidents/8/status"), expect.objectContaining({ method: "PATCH" })); });
  it("generates and downloads the final optimization PDF", async () => { await api.createFinalReport({ from: "2026-07-01", to: "2026-07-31", machineIds: "1,2" }); const pdf = await api.downloadFinalReport(3); expect(pdf).toBeInstanceOf(Blob); expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/reports/final-optimization/3/export"), expect.any(Object)); });
});
