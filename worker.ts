export default {
  async fetch(request: any, env: any, ctx?: any) {
    const kv = env?.NAVIKO_KV || env?.KV;
    if (!kv) {
      return new Response(JSON.stringify({ error: 'NAVIKO_KV binding not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // write a key-value pair
    await kv.put('KEY', 'VALUE');

    // read a key-value pair
    const value = await kv.get('KEY');

    // list all key-value pairs
    const allKeys = await kv.list();

    // delete a key-value pair
    await kv.delete('KEY');

    // return a Workers response
    return new Response(
      JSON.stringify({
        value: value,
        allKeys: allKeys,
      }),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } 
};

