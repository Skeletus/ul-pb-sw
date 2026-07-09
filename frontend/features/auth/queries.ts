import { useMutation, useQuery } from "@tanstack/react-query";
import { getCurrentUser, login, logout } from "@/lib/api/auth";
import type { LoginRequest } from "@/types/api";

export const authKeys = {
  currentUser: ["auth", "me"] as const
};

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: getCurrentUser,
    enabled,
    retry: false
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload)
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout
  });
}
