const a = ({ env: n, kv: r }) => n[r], o = async ({ env: n, kv: r, key: e }) => {
  const t = await c({ env: n, kv: r, key: e });
  return t != null && t.err ? t : { response: new Response(t == null ? void 0 : t.data) };
}, c = async ({ env: n, kv: r, key: e }) => {
  try {
    return { data: await a({ env: n, kv: r }).get(e) };
  } catch (t) {
    return { err: t };
  }
}, p = async ({ env: n, kv: r, key: e, data: t }) => {
  try {
    return await a({ env: n, kv: r }).put(e, t);
  } catch (s) {
    return { err: s };
  }
};
export {
  c as getFromKV,
  a as getKV,
  o as getKVResponse,
  p as putInKV
};
