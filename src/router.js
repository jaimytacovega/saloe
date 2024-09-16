import { getURLPatern } from './urlpattern'
import { fetch as fetchAsWorker } from './worker'


const router = new Map()

const getRouter = () => router
const getRoute = ({ pathname }) => router.get(pathname)
const addRoute = ({ pathname, route }) => router.set(pathname, route)
const removeRoute = ({ pathname }) => router.delete(pathname)

const findPatternFromUrl = ({ url }) => {
    const patternPathname = [...new Set(getRouter()?.keys())]
        .find((patternPathname) => {
            const pattern = getURLPatern({ pathname: patternPathname })
            return pattern.test(url.href)
        })

    return patternPathname ? getURLPatern({ pathname: patternPathname }) : null
}

const getRedirectResponse = ({ origin, request, isRedirectableCallback }) => {
    const url = new URL(request.url)
    const requestOrigin = url.origin
    if (origin !== requestOrigin) return

    if (!isRedirectableCallback) return

    const isRedirectable = isRedirectableCallback({ request })
    const response = isRedirectable ? Response.redirect(pathname.slice(0, -1), 301) : null

    return { response }
}

const getNotFoundResponse = async ({ request }) => {
    const status = 404
    const notFoundRoute = getRoute({ pathname: `/${status}` })
    const response = notFoundRoute ? (await notFoundRoute({ request, status }))?.response : new Response('404', { status })
    return { response }
}

const getForbiddenResponse = ({ origin, request, isForbiddenCallback }) => {  
    const url = new URL(request.url)
    const requestOrigin = url.origin
    if (origin !== requestOrigin) return

    if (!isForbiddenCallback) return

    const isForbidden = isForbiddenCallback({ request })
    if (!isForbidden) return

    return { response: new Response(`${request?.url} is forbidden`, { status: 503 }) }
}

const getServerOnlyResponse = ({ origin, request, isServerOnlyCallback }) => {
    const url = new URL(request.url)
    const requestOrigin = url.origin
    if (origin !== requestOrigin) return

    if (!isServerOnlyCallback) return

    const isServerOnly = isServerOnlyCallback({ request })
    if (!isServerOnly) return
    
    return fetchAsWorker({ request })
}

export {
    getRouter,
    getRoute,
    addRoute,
    removeRoute,

    findPatternFromUrl,
    getRedirectResponse,
    getNotFoundResponse,
    getForbiddenResponse,
    getServerOnlyResponse,
}