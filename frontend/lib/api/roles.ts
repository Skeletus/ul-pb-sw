import { apiRequest } from "@/lib/api/client";
import type { Role, UserSummary } from "@/types/api";
export function getRoles() { return apiRequest<Role[]>("/roles"); }
export function getUsers() { return apiRequest<UserSummary[]>("/users"); }
export function assignUserRole(id: number, roleId: number) { return apiRequest<UserSummary>(`/users/${id}/role`, { method: "POST", body: JSON.stringify({ roleId }) }); }
