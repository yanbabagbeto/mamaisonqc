"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { decideClaim } from "@/modules/claims";
import { setListingStatus } from "@/modules/premarket";

function readId(formData: FormData, field = "id"): string {
  const value = formData.get(field);
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Champ ${field} manquant.`);
  }
  return value;
}

export async function approveClaimAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await decideClaim(admin.id, readId(formData, "claimId"), "approved");
  revalidatePath("/admin/reclamations");
  revalidatePath("/admin");
}

export async function rejectClaimAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await decideClaim(admin.id, readId(formData, "claimId"), "rejected");
  revalidatePath("/admin/reclamations");
  revalidatePath("/admin");
}

export async function setListingStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const status = readId(formData, "status");
  if (status !== "actif" && status !== "pause" && status !== "retire") {
    throw new Error("Statut invalide.");
  }
  await setListingStatus(readId(formData, "listingId"), status);
  revalidatePath("/admin/annonces");
  revalidatePath("/pre-marche");
}
