"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuthStore } from "@/features/auth/auth-store";
import { useCurrentUser, useLoginMutation } from "@/features/auth/queries";
import { getErrorMessage } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const loginMutation = useLoginMutation();
  const currentUser = useCurrentUser(Boolean(hydrated && token));

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    if (currentUser.data) {
      setUser(currentUser.data);
      router.replace(routes.dashboard);
    }
  }, [currentUser.data, router, setUser]);

  async function onSubmit(values: LoginFormValues) {
    const response = await loginMutation.mutateAsync(values);
    setSession(response.accessToken, response.user);
    router.replace(routes.dashboard);
  }

  if (!hydrated || (token && currentUser.isLoading)) {
    return <LoadingState label="Validando sesion..." fullScreen />;
  }

  return (
    <main className="grid min-h-screen bg-workmeter-concrete px-4 py-8 text-workmeter-ink sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-0">
      <section className="hidden bg-workmeter-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded bg-workmeter-orange text-sm font-black">
              WM
            </span>
            <span className="text-2xl font-black tracking-normal">WorkMeter</span>
          </div>
          <div className="mt-20 max-w-xl">
            <p className="text-sm font-black uppercase text-workmeter-cyan">Panel operativo</p>
            <h1 className="mt-4 text-5xl font-black leading-tight tracking-normal">
              Monitorea uso, alertas y costos desde una sola vista.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Accede a la aplicacion autenticada para consultar maquinaria, reportes diarios y alertas generadas por el backend.
            </p>
          </div>
        </div>
        <p className="text-sm font-bold text-slate-300">WorkMeter · Energy-Saver</p>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded border border-slate-200 bg-white p-6 shadow-industrial sm:p-8">
          <div className="lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded bg-workmeter-orange text-sm font-black text-white">
                WM
              </span>
              <span className="text-xl font-black tracking-normal">WorkMeter</span>
            </div>
          </div>

          <div className="mt-8 lg:mt-0">
            <h2 className="text-3xl font-black tracking-normal text-workmeter-ink">Iniciar sesion</h2>
            <p className="mt-2 text-sm leading-6 text-workmeter-steel">
              Ingresa con tus credenciales para acceder al panel.
            </p>
          </div>

          {loginMutation.isError ? (
            <div className="mt-5">
              <ErrorState title="No se pudo iniciar sesion" message={getErrorMessage(loginMutation.error)} />
            </div>
          ) : null}

          <form className="mt-6 grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="grid gap-2">
              <span className="text-sm font-black text-workmeter-ink">Correo</span>
              <input
                className="h-12 rounded border border-slate-300 px-4 text-base text-workmeter-ink outline-none transition placeholder:text-slate-400 focus:border-workmeter-orange focus:ring-4 focus:ring-workmeter-orange/20"
                type="email"
                autoComplete="email"
                placeholder="demo@workmeter.com"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <span className="text-sm font-bold text-red-700">{form.formState.errors.email.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-workmeter-ink">Contrasena</span>
              <input
                className="h-12 rounded border border-slate-300 px-4 text-base text-workmeter-ink outline-none transition placeholder:text-slate-400 focus:border-workmeter-orange focus:ring-4 focus:ring-workmeter-orange/20"
                type="password"
                autoComplete="current-password"
                placeholder="Minimo 8 caracteres"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <span className="text-sm font-bold text-red-700">{form.formState.errors.password.message}</span>
              ) : null}
            </label>

            <Button className="h-12 w-full" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Iniciar sesion
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
