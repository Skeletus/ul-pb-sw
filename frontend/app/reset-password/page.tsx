"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, validateResetToken } from "@/lib/api/sprint2";
import { getErrorMessage } from "@/lib/api/errors";

function ResetForm() {
  const token = useSearchParams().get("token") ?? ""; const router = useRouter();
  const [valid, setValid] = useState<boolean | null>(null); const [password, setPassword] = useState(""); const [confirmation, setConfirmation] = useState(""); const [error, setError] = useState("");
  useEffect(() => { validateResetToken(token).then(() => setValid(true)).catch((caught) => { setValid(false); setError(getErrorMessage(caught)); }); }, [token]);
  async function submit(event: React.FormEvent) { event.preventDefault(); if (password !== confirmation) { setError("Las contraseñas no coinciden."); return; } try { await resetPassword(token, password); router.replace("/login?passwordReset=success"); } catch (caught) { setError(getErrorMessage(caught)); } }
  if (valid === null) return <p>Validando enlace...</p>;
  if (!valid) return <p className="font-bold text-red-700">{error || "El enlace no es válido."}</p>;
  return <form className="grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm font-bold">Nueva contraseña<input className="h-12 rounded border px-3" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="grid gap-2 text-sm font-bold">Confirmar contraseña<input className="h-12 rounded border px-3" type="password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label><button className="h-12 rounded bg-workmeter-blue font-black text-white">Cambiar contraseña</button>{error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}</form>;
}
export default function ResetPasswordPage() { return <main className="grid min-h-screen place-items-center bg-workmeter-concrete p-4"><section className="w-full max-w-md rounded border bg-white p-6"><h1 className="mb-5 text-2xl font-black">Restablecer contraseña</h1><Suspense fallback={<p>Validando enlace...</p>}><ResetForm /></Suspense></section></main>; }
