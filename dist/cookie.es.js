const t = ({ key: e, value: o }) => cookieStore == null ? void 0 : cookieStore.set(e, o), r = ({ key: e }) => cookieStore == null ? void 0 : cookieStore.get(e), c = () => cookieStore == null ? void 0 : cookieStore.getAll(), i = ({ key: e }) => cookieStore == null ? void 0 : cookieStore.delete(e);
export {
  c as getAllCookies,
  r as getCookie,
  i as removeCookie,
  t as setCookie
};
