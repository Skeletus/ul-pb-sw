"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/api/sprint2";
import { getErrorMessage } from "@/lib/api/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try { await requestPasswordReset(email); setMessage("Si el correo está registrado, recibirás un enlace de restablecimiento."); }
    catch (caught) { setError(getErrorMessage(caught)); }
    finally { setLoading(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-workmeter-concrete p-4"><form onSubmit={submit} className="grid w-full max-w-md gap-4 rounded border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-black text-workmeter-ink">Olvidé mi contraseña</h1><label className="grid gap-2 text-sm font-bold">Correo<input className="h-12 rounded border px-3" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="h-12 rounded bg-workmeter-blue font-black text-white" disabled={loading}>{loading ? "Enviando..." : "Enviar enlace"}</button>{message ? <p className="text-sm font-bold text-emerald-700">{message}</p> : null}{error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}<Link className="text-sm font-bold text-workmeter-blue" href="/login">Volver al login</Link></form></main>;
}
