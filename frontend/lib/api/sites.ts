import { apiRequest } from "@/lib/api/client";
import type { Site } from "@/types/api";
export function getSites() { return apiRequest<Site[]>("/sites"); }
