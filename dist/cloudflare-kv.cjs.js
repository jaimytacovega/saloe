"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const getKV = ({ env, kv }) => env[kv];
const getKVResponse = async ({ env, kv, key }) => {
  const result = await getFromKV({ env, kv, key });
  if (result == null ? void 0 : result.err) return result;
  const response = new Response(result == null ? void 0 : result.data);
  return { response };
};
const getFromKV = async ({ env, kv, key }) => {
  try {
    const data = await getKV({ env, kv }).get(key);
    return { data };
  } catch (err) {
    return { err };
  }
};
const putInKV = async ({ env, kv, key, data }) => {
  try {
    const result = await getKV({ env, kv }).put(key, data);
    return result;
  } catch (err) {
    return { err };
  }
};
exports.getFromKV = getFromKV;
exports.getKV = getKV;
exports.getKVResponse = getKVResponse;
exports.putInKV = putInKV;
