export async function submitSurat(payload) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/surat/submit`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    let message = 'Gagal menyimpan data';

    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {}
    }

    throw new Error(message);
  }

  // if backend returns something later, you’re ready
  try {
    return await res.json();
  } catch {
    return null;
  }
}
