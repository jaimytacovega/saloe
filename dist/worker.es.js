const w = async ({ callback: a, signal: n, priority: s }) => {
  var r;
  try {
    return (r = self == null ? void 0 : self.scheduler) != null && r.postTask ? { data: await scheduler.postTask(a, { priority: s, signal: n }) } : { data: await a() };
  } catch (t) {
    return { err: t };
  }
}, d = ({ callbacks: a, headers: n, status: s }) => {
  const { readable: r, writable: t } = new TransformStream();
  return {
    done: (async () => {
      var c;
      for (const p of a) {
        const i = new AbortController(), o = await w({ callback: p, signal: i.signal, priority: "background" }), l = (o == null ? void 0 : o.err) ?? (o == null ? void 0 : o.data);
        await ((c = new Response(l, { headers: n }).body) == null ? void 0 : c.pipeTo(t, { preventClose: !0 })), i.abort();
      }
      t.getWriter().close();
    })(),
    response: new Response(r, { headers: n, status: s ?? 200 })
  };
}, b = async ({ url: a, request: n, ...s }) => {
  var r;
  try {
    const t = await ((r = self == null ? void 0 : self.fetch(a || n, s)) == null ? void 0 : r.catch((e) => ({ err: e })));
    return t != null && t.err ? t : { response: t };
  } catch (t) {
    return { err: t };
  }
};
export {
  b as fetch,
  d as stream
};
