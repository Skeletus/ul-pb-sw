import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/lib/api/sprint2";

describe("Sprint 2 API integration", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}), blob: () => Promise.resolve(new Blob(["%PDF"])) }));
  });

  it("requests password recovery without authentication", async () => {
    await api.requestPasswordReset("user@example.com");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/forgot-password"), expect.objectContaining({ method: "POST" }));
  });

  it("submits a rental contract to the selected machine", async () => {
    await api.createContract(4, { startDate: "2026-07-01", endDate: "2026-07-31", totalCost: 1000, hourlyRate: 20 });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/machines/4/contracts"), expect.any(Object));
  });

  it("associates the entered physical sensor identifier", async () => {
    await api.associateSensor(4, "SEN-1");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/machines/4/sensor"), expect.objectContaining({ body: JSON.stringify({ identifier: "SEN-1" }) }));
  });

  it("loads real energy consumption for the selected period", async () => {
    await api.getEnergy(4, "2026-07-01T00:00:00Z", "2026-07-02T00:00:00Z");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/telemetry/machine/4/energy?"), expect.any(Object));
  });

  it("registers and reloads alert incidents through backend endpoints", async () => {
    await api.createIncident(3, { title: "Idle", description: "No material", severity: "HIGH" });
    await api.getIncidents(3);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("loads multi-machine utilization comparison", async () => {
    await api.getUsageComparison("2026-07-01", "2026-07-31", 1, 40);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/reports/usage-comparison?"), expect.any(Object));
  });

  it("downloads a binary PDF from the authenticated report endpoint", async () => {
    const blob = await api.downloadUsagePdf(4, "2026-07-01", "2026-07-31");
    expect(blob).toBeInstanceOf(Blob);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/reports/machines/4/pdf?"), expect.any(Object));
  });
});
