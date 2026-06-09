/**
 * Ghost Chat — Device Service
 * Handles device registration and verification against Supabase.
 */

import { supabase } from "@/lib/supabase";
import type { Device } from "@/types";

/**
 * Generate a random 5-digit uppercase alphanumeric short code.
 */
export function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Register a new device with a hashed secret code and a unique short code.
 */
export async function registerDevice(
  deviceId: string,
  secretHash: string
): Promise<{ success: boolean; shortCode?: string; error?: string }> {
  // First, check if this secret code is already registered to another identity
  const { data: existingHash } = await supabase
    .from("devices")
    .select("id")
    .eq("secret_hash", secretHash)
    .maybeSingle();

  if (existingHash) {
    return { success: false, error: "This secret code is already taken. Please choose another one." };
  }

  let shortCode = "";
  let isUnique = false;
  let retries = 5;

  while (!isUnique && retries > 0) {
    shortCode = generateShortCode();
    const { data } = await supabase
      .from("devices")
      .select("id")
      .eq("short_code", shortCode)
      .maybeSingle();
    if (!data) {
      isUnique = true;
    } else {
      retries--;
    }
  }

  const { error } = await supabase.from("devices").insert({
    id: deviceId,
    secret_hash: secretHash,
    short_code: shortCode,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Account already registered or code conflict." };
    }
    return { success: false, error: error.message };
  }

  return { success: true, shortCode };
}

/**
 * Verify a device identity solely using its secret code hash.
 * Allows login using only the 6-digit secret code.
 */
export async function verifyDeviceBySecretHash(
  secretHash: string
): Promise<{ success: boolean; deviceId?: string; shortCode?: string; error?: string }> {
  const { data, error } = await supabase
    .from("devices")
    .select("id, secret_hash, short_code")
    .eq("secret_hash", secretHash)
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: "Invalid secret code. Account not found." };
  }

  const device = data as Device;

  let shortCode = device.short_code;
  if (!shortCode) {
    let isUnique = false;
    let retries = 5;
    while (!isUnique && retries > 0) {
      shortCode = generateShortCode();
      const { data: existing } = await supabase
        .from("devices")
        .select("id")
        .eq("short_code", shortCode)
        .maybeSingle();
      if (!existing) {
        isUnique = true;
      } else {
        retries--;
      }
    }
    await supabase
      .from("devices")
      .update({ short_code: shortCode })
      .eq("id", device.id);
  }

  // Update last_seen timestamp
  await supabase
    .from("devices")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", device.id);

  return { success: true, deviceId: device.id, shortCode };
}

/**
 * Check if a device exists in the database.
 */
export async function deviceExists(deviceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("devices")
    .select("id")
    .eq("id", deviceId)
    .single();

  return !error && !!data;
}

/**
 * Resolve a device by ID or 5-digit short code.
 */
export async function lookupDevice(
  query: string
): Promise<{ exists: boolean; deviceId?: string; shortCode?: string }> {
  const trimmed = query.trim();
  if (!trimmed) return { exists: false };

  // If 5 characters, try short code lookup first
  if (trimmed.length === 5) {
    const { data, error } = await supabase
      .from("devices")
      .select("id, short_code")
      .eq("short_code", trimmed.toUpperCase())
      .maybeSingle();

    if (!error && data) {
      return { exists: true, deviceId: data.id, shortCode: data.short_code };
    }
  }

  // Fallback/direct check for UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    const { data, error } = await supabase
      .from("devices")
      .select("id, short_code")
      .eq("id", trimmed)
      .maybeSingle();

    if (!error && data) {
      return { exists: true, deviceId: data.id, shortCode: data.short_code };
    }
  }

  return { exists: false };
}
