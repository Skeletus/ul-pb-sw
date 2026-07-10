import { useQuery } from "@tanstack/react-query"; import { getSites } from "@/lib/api/sites"; export function useSites(){return useQuery({queryKey:["sites"],queryFn:getSites});}
