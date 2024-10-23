import { fetch as fetchAsWorker } from './worker'


// TODO: Function is too specific
const cacheAssets = async ({ cachePrefix, cacheName }) => {
    try {
        const assetsResult = await fetchAsWorker({ url: '/dist.json' })
        const assetsJSON = assetsResult?.err ? {} : await assetsResult?.response?.json()

        const cache = await caches.open(`${cachePrefix}-${cacheName}`)

        return assetsJSON?.map(async (path) => {
            const url = path?.replace('dist/', '/')
            try {
                await cache.add(url)
            } catch (err) {
                console.log(`${err} - ${url}`)
            }
        })

    } catch (err) {
        console.error(err)
    }
}

const installStaticAssets = async ({ cachePrefix, cacheName }) => {
    cacheAssets({ cachePrefix, cacheName })
}

const removePreviousCaches = async ({ version, cachePrefix }) => {
    const cacheNames = await caches.keys()
    return Promise.all(
        cacheNames?.filter((cacheName) => {
            const startsWithPrefix = cacheName?.startsWith(cachePrefix)
            const endsWithVersion = cacheName?.endsWith(version)
            const cacheToDelete = startsWithPrefix && !endsWithVersion
            return cacheToDelete
        })?.map((cacheName) => caches?.delete(cacheName))
    )
}

const serveFromCache = async ({ request, cachePrefix, cacheName }) => {
    try {
        const cache = await caches.open(`${cachePrefix}-${cacheName}`)
        const response = await cache.match(request, { ignoreSearch: true })
        return { response }
    } catch (err) {
        console.error(err)
        return { err }
    }
}

const cacheFirstThenNetwork = async ({ request, cachePrefix, cacheName }) => {
    const cacheResult = await serveFromCache({ request, cachePrefix, cacheName })
    if (cacheResult?.response) return cacheResult

    try {
        const fetchResult = await fetchAsWorker({ request })
        return fetchResult
    } catch (err) {
        return { err }
    }
}

export {
    installStaticAssets,
    removePreviousCaches,
    cacheFirstThenNetwork,
}