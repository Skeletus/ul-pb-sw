import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignUserRole, getRoles, getUsers } from "@/lib/api/roles";
export function useUsers() { return useQuery({ queryKey: ["users"], queryFn: getUsers }); }
export function useRoles() { return useQuery({ queryKey: ["roles"], queryFn: getRoles }); }
export function useAssignRole() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, roleId }: { id: number; roleId: number }) => assignUserRole(id, roleId), onSuccess: () => client.invalidateQueries({ queryKey: ["users"] }) }); }
