"use server";

import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./cache";

// Revalidate specific cache tags when data changes
export async function revalidateInvoices() {
  revalidateTag(CACHE_TAGS.invoices);
  revalidateTag(CACHE_TAGS.dashboard);
}

export async function revalidateCustomers() {
  revalidateTag(CACHE_TAGS.customers);
  revalidateTag(CACHE_TAGS.dashboard);
}

export async function revalidateVehicles() {
  revalidateTag(CACHE_TAGS.vehicles);
  revalidateTag(CACHE_TAGS.dashboard);
}

export async function revalidateParts() {
  revalidateTag(CACHE_TAGS.parts);
  revalidateTag(CACHE_TAGS.dashboard);
}

export async function revalidateUsers() {
  revalidateTag(CACHE_TAGS.users);
}

export async function revalidateGroups() {
  revalidateTag(CACHE_TAGS.groups);
}

export async function revalidateAll() {
  Object.values(CACHE_TAGS).forEach((tag) => {
    revalidateTag(tag);
  });
}
