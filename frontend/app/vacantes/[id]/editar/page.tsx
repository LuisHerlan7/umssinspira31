"use client";

import { useParams } from "next/navigation";
import EditarVacanteForm from "./EditarVacanteForm";

export default function EditarVacantePage() {
  const params = useParams();
  const id = String(params.id ?? "");

  if (!id) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">
          Vacante no encontrada
        </h1>
      </main>
    );
  }

  return <EditarVacanteForm id={id} />;
}