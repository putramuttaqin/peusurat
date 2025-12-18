const API_URL = import.meta.env.VITE_API_URL;

/* ------------------------------------------------------------------
 * Fetch entries list
 * ------------------------------------------------------------------ */
export async function fetchEntries({
  filters,
  search,
  user,
  page,
  limit
}) {
  const params = new URLSearchParams({
    ...filters,
    search,
    user,
    page,
    limit
  });

  const res = await fetch(`${API_URL}/api/surat/entries?${params}`, {
    credentials: 'include'
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch entries (${res.status})`);
  }

  return res.json();
}

/* ------------------------------------------------------------------
 * Update entry status (approve / reject)
 * ------------------------------------------------------------------ */
export async function updateEntryStatus({ id, action }) {
  const res = await fetch(`${API_URL}/api/surat/entries/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });

  if (res.status === 403) {
    throw new Error('Admin session expired');
  }

  if (!res.ok) {
    throw new Error('Action failed');
  }

  return res.json();
}
