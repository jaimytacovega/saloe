import * as CookieStorePolyfill from 'cookie-store'


if (!self.cookieStore) self.cookieStore = CookieStorePolyfill.cookieStore

const setCookie = ({ key, value, config }) => {
    return self.cookieStore?.set(key, value, config)
}

const getCookie = ({ key }) => {
    return self.cookieStore?.get(key)
}

const getAllCookies = () => {
    return self.cookieStore?.getAll()
}

const removeCookie = ({ key }) => {
    return self.cookieStore?.delete(key)
}

export {
    setCookie,
    getCookie,
    getAllCookies,
    removeCookie,
}