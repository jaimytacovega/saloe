"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const kvAssetHandler = require("@cloudflare/kv-asset-handler");
const getStaticResponse = async ({ request, waitUntil, manifestJSON, env }) => {
  try {
    const ASSET_MANIFEST = JSON.parse(manifestJSON ?? {});
    const response = await kvAssetHandler.getAssetFromKV({
      request,
      waitUntil
    }, {
      ASSET_NAMESPACE: env.__STATIC_CONTENT,
      ASSET_MANIFEST
    });
    return { response };
  } catch (err) {
    return { err };
  }
};
exports.getStaticResponse = getStaticResponse;
