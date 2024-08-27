import { getAssetFromKV as n } from "@cloudflare/kv-asset-handler";
const A = async ({ request: e, waitUntil: r, manifestJSON: s, env: o }) => {
  try {
    const t = JSON.parse(s ?? {});
    return { response: await n({
      request: e,
      waitUntil: r
    }, {
      ASSET_NAMESPACE: o.__STATIC_CONTENT,
      ASSET_MANIFEST: t
    }) };
  } catch (t) {
    return { err: t };
  }
};
export {
  A as getStaticResponse
};
