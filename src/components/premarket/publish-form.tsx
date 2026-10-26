"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

type Claim = { matricule: string; address: string | null; municipalityCode: string };

const HORIZONS = [
  { value: "0-3", label: "D'ici 3 mois" },
  { value: "3-6", label: "Dans 3 à 6 mois" },
  { value: "6-12", label: "Dans 6 à 12 mois" },
  { value: "12+", label: "Dans plus d'un an" },
];

export function PublishForm({ claims }: { claims: Claim[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      matricule: String(data.get("matricule") ?? ""),
      askingPrice: String(data.get("askingPrice") ?? ""),
      horizon: String(data.get("horizon") ?? "3-6"),
      description: String(data.get("description") ?? ""),
      visibility: String(data.get("visibility") ?? "acheteurs_verifies"),
    };

    setStatus("submitting");
    setMessage("");
    setFieldErrors({});
    try {
      const response = await fetch("/api/premarket", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as
        | { ok: true; data: { id: string } }
        | { ok: false; error: { message: string; details?: Record<string, string[]> } };
      if (!response.ok || !body.ok) {
        if (!body.ok && body.error.details) setFieldErrors(body.error.details);
        setStatus("error");
        setMessage(body.ok ? "Publication impossible." : body.error.message);
        return;
      }
      router.push(`/proprietaire/tableau-de-bord?publie=1`);
    } catch {
      setStatus("error");
      setMessage("Réseau indisponible. Réessayez dans un instant.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Propriété" htmlFor="premarket-matricule" error={fieldErrors.matricule?.[0]}>
        <Select id="premarket-matricule" name="matricule" required defaultValue={claims[0]?.matricule}>
          {claims.map((claim) => (
            <option key={claim.matricule} value={claim.matricule}>
              {claim.address ?? claim.matricule} — {claim.municipalityCode}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Prix demandé ($)"
        htmlFor="premarket-price"
        hint="Le montant que vous auriez en tête si vous mettiez en vente. Vous pourrez le changer."
        error={fieldErrors.askingPrice?.[0]}
      >
        <Input
          id="premarket-price"
          name="askingPrice"
          type="number"
          inputMode="numeric"
          min={1000}
          step={1000}
          required
          placeholder="450000"
        />
      </Field>

      <Field label="Horizon de vente" htmlFor="premarket-horizon">
        <Select id="premarket-horizon" name="horizon" defaultValue="3-6">
          {HORIZONS.map((horizon) => (
            <option key={horizon.value} value={horizon.value}>
              {horizon.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Description"
        htmlFor="premarket-description"
        hint="20 à 600 caractères. Ne publiez ni numéro civique ni informations personnelles : l'adresse exacte reste masquée."
        error={fieldErrors.description?.[0]}
      >
        <Textarea
          id="premarket-description"
          name="description"
          minLength={20}
          maxLength={600}
          required
          placeholder="Maison de 3 chambres, cour arrière, rénovée en 2019…"
        />
      </Field>

      <Field label="Visibilité" htmlFor="premarket-visibility">
        <Select id="premarket-visibility" name="visibility" defaultValue="acheteurs_verifies">
          <option value="acheteurs_verifies">Acheteurs qui expriment un intérêt</option>
          <option value="prive">Privé — je décide qui voit la fiche</option>
        </Select>
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? "Publication…" : "Publier en pré-marché"}
        </Button>
        <p className="text-xs text-muted-fg">Gratuit. Aucun engagement de vendre.</p>
      </div>
      <p
        aria-live="polite"
        className={status === "error" ? "text-sm font-medium text-danger" : "text-sm text-muted-fg"}
      >
        {message}
      </p>
    </form>
  );
}
