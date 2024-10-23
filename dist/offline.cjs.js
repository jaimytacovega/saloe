"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const worker = require("./worker.cjs.js");
const cacheAssets = async ({ cachePrefix, cacheName }) => {
  var _a;
  try {
    const assetsResult = await worker.fetch({ url: "/dist.json" });
    const assetsJSON = (assetsResult == null ? void 0 : assetsResult.err) ? {} : await ((_a = assetsResult == null ? void 0 : assetsResult.response) == null ? void 0 : _a.json());
    const cache = await caches.open(`${cachePrefix}-${cacheName}`);
    return assetsJSON == null ? void 0 : assetsJSON.map(async (path) => {
      const url = path == null ? void 0 : path.replace("dist/", "/");
      try {
        await cache.add(url);
      } catch (err) {
        console.log(`${err} - ${url}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
};
const installStaticAssets = async ({ cachePrefix, cacheName }) => {
  cacheAssets({ cachePrefix, cacheName });
};
const removePreviousCaches = async ({ version, cachePrefix }) => {
  var _a;
  const cacheNames = await caches.keys();
  return Promise.all(
    (_a = cacheNames == null ? void 0 : cacheNames.filter((cacheName) => {
      const startsWithPrefix = cacheName == null ? void 0 : cacheName.startsWith(cachePrefix);
      const endsWithVersion = cacheName == null ? void 0 : cacheName.endsWith(version);
      const cacheToDelete = startsWithPrefix && !endsWithVersion;
      return cacheToDelete;
    })) == null ? void 0 : _a.map((cacheName) => caches == null ? void 0 : caches.delete(cacheName))
  );
};
const serveFromCache = async ({ request, cachePrefix, cacheName }) => {
  try {
    const cache = await caches.open(`${cachePrefix}-${cacheName}`);
    const response = await cache.match(request, { ignoreSearch: true });
    return { response };
  } catch (err) {
    console.error(err);
    return { err };
  }
};
const cacheFirstThenNetwork = async ({ request, cachePrefix, cacheName }) => {
  const cacheResult = await serveFromCache({ request, cachePrefix, cacheName });
  if (cacheResult == null ? void 0 : cacheResult.response) return cacheResult;
  try {
    const fetchResult = await worker.fetch({ request });
    return fetchResult;
  } catch (err) {
    return { err };
  }
};
exports.cacheFirstThenNetwork = cacheFirstThenNetwork;
exports.installStaticAssets = installStaticAssets;
exports.removePreviousCaches = removePreviousCaches;
