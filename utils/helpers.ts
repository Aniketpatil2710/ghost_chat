/**
 * Ghost Chat — General Utilities
 */

/**
 * Generate a new device ID using crypto.randomUUID().
 */
export function generateDeviceId(): string {
  return crypto.randomUUID();
}

/**
 * Format an ISO timestamp into a human-readable string.
 * Shows time only for today, date + time for older messages.
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Copy text to clipboard. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Truncate a device ID for display purposes.
 * e.g. "550e8400-e29b-41d4-a716-446655440000" → "550e84...440000"
 */
export function truncateDeviceId(deviceId: string): string {
  if (deviceId.length <= 14) return deviceId;
  return `${deviceId.slice(0, 6)}...${deviceId.slice(-6)}`;
}
