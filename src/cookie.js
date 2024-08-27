const setCookie = ({ key, value }) => {
    return cookieStore?.set(key, value)
}

const getCookie = ({ key }) => {
    return cookieStore?.get(key)
}

const getAllCookies = () => {
    return cookieStore?.getAll()
}

const removeCookie = ({ key }) => {
    return cookieStore?.delete(key)
}

export {
    setCookie,
    getCookie,
    getAllCookies,
    removeCookie,
}