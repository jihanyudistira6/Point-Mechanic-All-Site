export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL Spreadsheet tidak valid.' });
    }

    let fetchUrl = url.trim();
    if (fetchUrl.includes('docs.google.com/spreadsheets/d/')) {
      const match = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      return res.status(400).json({
        error: `Gagal mengunduh spreadsheet dari URL (Status: ${response.status} ${response.statusText}). Pastikan link dibagikan publik.`,
      });
    }

    const csvText = await response.text();
    res.status(200).json({
      csvText,
      rowCount: csvText.split('\n').filter((r: string) => r.trim()).length,
    });
  } catch (error: any) {
    console.error('Vercel serverless error fetching spreadsheet:', error);
    res.status(500).json({
      error: 'Gagal menghubungkan Spreadsheet',
      details: error.message || String(error),
    });
  }
}
