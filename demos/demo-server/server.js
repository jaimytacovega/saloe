import { findPatternFromUrl, getRedirectResponse, getForbiddenResponse, getRoute, getNotFoundResponse, getServerOnlyResponse } from 'saloe/router'
import { getStaticResponse } from 'saloe/cloudflare-worker'
import { addRoute } from 'saloe/router'
import { html, stream } from 'saloe/html'


const isRedirectableCallback = ({ pathname }) => {
    return pathname !== '/' && pathname.endsWith('/')
}

const isForbiddenCallback = ({ request }) => {
    const forbiddenURLs = []   
    return forbiddenURLs.find((filename) => request?.url?.endsWith(filename))    
}

const isServerOnlyCallback = ({ request }) => {
    const serverOnlyURLs = []
    return serverOnlyURLs?.find((filename) => request?.url?.endsWith(filename))
}


(() => {
    addRoute({
        pathname: '/',
        route: ({ request, env }) => {
            return stream({
                head: () => html`
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cloudflare Worker Server</title>
                `,
                body: () => html`
                    <h1>Hello world!</h1>
                `,
                scripts: () => html`
                    <script>
                        console.log('Hello world!')
                    </script>
                `,
                env,
            })
        }
    })

})()

const handleFetch = async ({ request, env, ctx }) => {
    const url = new URL(request.url)
    const { origin, pathname } = url

    const pattern = findPatternFromUrl({ url })

    const redirectResult = getRedirectResponse({ origin, pathname, isRedirectableCallback })
    if (redirectResult?.response) return redirectResult.response

    const forbiddenResult = getForbiddenResponse({ origin, request, isForbiddenCallback })
    if (forbiddenResult?.response) return forbiddenResult.response

    const serverOnlyResult = getServerOnlyResponse({ origin, request, isServerOnlyCallback })
    if (serverOnlyResult?.response) return serverOnlyResult.response

    const route = getRoute({ pathname: pattern?.pathname })
    const routeResult = route ? await route({ request, pattern, env }) : null
    if (routeResult?.response) return routeResult.response

    const staticResult = await getStaticResponse({ request, waitUntil: ctx.waitUntil.bind(ctx), env })
    if (staticResult?.response) return staticResult?.response

    const notFoundResult = await getNotFoundResponse({ request })
    return notFoundResult?.response
}

export default {
    fetch: (request, env, ctx) => handleFetch({ request, env, ctx })
}