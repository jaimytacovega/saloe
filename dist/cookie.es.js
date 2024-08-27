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
export {
  getAllCookies,
  getCookie,
  removeCookie,
  setCookie
};
