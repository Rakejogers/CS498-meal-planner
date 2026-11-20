"use server";

import { revalidatePath } from "next/cache";
import { cookPlannedMeal } from "@/lib/data";

export async function markMealCooked(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await cookPlannedMeal(id);
  revalidatePath("/dashboard");
  revalidatePath("/pantry");
  revalidatePath(`/meals/${id}`);
}
