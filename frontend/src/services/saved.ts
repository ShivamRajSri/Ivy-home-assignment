import type { AuthSession } from "@/services/auth";

export type SavedType = "listing" | "rental" | "project";

function getUserKey(session: AuthSession) {
  return session.displayName;
}

function getStorageKey(
  session: AuthSession,
  type: SavedType,
) {
  const user = getUserKey(session);

  if (type === "listing") {
    return `ivy_saved_listings_${user}`;
  }

  if (type === "rental") {
    return `ivy_saved_rentals_${user}`;
  }

  return `ivy_saved_projects_${user}`;
}

export function loadSaved(
  session: AuthSession,
  type: SavedType,
): Set<string> {
  try {
    const stored = localStorage.getItem(
      getStorageKey(session, type),
    );

    if (!stored) {
      return new Set();
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(
      parsed.filter(
        (value): value is string =>
          typeof value === "string",
      ),
    );
  } catch {
    return new Set();
  }
}

export function saveSaved(
  session: AuthSession,
  type: SavedType,
  values: Set<string>,
) {
  localStorage.setItem(
    getStorageKey(session, type),
    JSON.stringify(Array.from(values)),
  );
}

export function toggleSaved(
  session: AuthSession,
  type: SavedType,
  id: string,
): Set<string> {
  const current = loadSaved(session, type);
  const next = new Set(current);

  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }

  saveSaved(session, type, next);

  return next;
}