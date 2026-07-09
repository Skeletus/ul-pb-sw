import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkMeter | Monitoreo de maquinaria alquilada",
  description:
    "WorkMeter ayuda a constructoras a monitorear maquinaria alquilada, detectar inactividad y reducir costos con sensores, alertas y reportes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
