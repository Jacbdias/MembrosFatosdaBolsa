// app/api/ifix/route.ts
export async function GET() {
  try {
    const res = await fetch('https://api.hgbrasil.com/finance?format=json&key=free', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IFIX-Fetch-Server',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'HG Brasil API falhou' }), { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro na requisição IFIX', detail: err }), {
      status: 500
    });
  }
}
