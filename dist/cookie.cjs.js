"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const setCookie = ({ key, value }) => {
  return cookieStore == null ? void 0 : cookieStore.set(key, value);
};
const getCookie = ({ key }) => {
  return cookieStore == null ? void 0 : cookieStore.get(key);
};
const getAllCookies = () => {
  return cookieStore == null ? void 0 : cookieStore.getAll();
};
const removeCookie = ({ key }) => {
  return cookieStore == null ? void 0 : cookieStore.delete(key);
};
exports.getAllCookies = getAllCookies;
exports.getCookie = getCookie;
exports.removeCookie = removeCookie;
exports.setCookie = setCookie;
