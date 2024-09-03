import { findPatternFromUrl, getRedirectResponse, getForbiddenResponse, getRoute, getNotFoundResponse, getServerOnlyResponse } from 'saloe/router'
import { getStaticResponse } from 'saloe/cloudflare-worker'
import { addRoute } from 'saloe/router'
import { html, stream } from 'saloe/html'
import { LISTENER_SCRIPT } from 'saloe/actions'
import { listener, getScriptListener } from 'saloe/listener'

import manifestJSON from '__STATIC_CONTENT_MANIFEST'


const isRedirectableCallback = ({ pathname }) => {
    return pathname !== '/' && pathname.endsWith('/')
}

const isForbiddenCallback = ({ request }) => {
    const forbiddenURLs = []   
    return forbiddenURLs.find((pathname) => request?.url?.endsWith(pathname))    
}

const isServerOnlyCallback = ({ request }) => {
    const serverOnlyURLs = []
    return serverOnlyURLs?.find((pathname) => request?.url?.endsWith(pathname))
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
                    
                    <form 
                        on-submit="submit"
                    >
                        <h1
                            on-load="load"
                        >
                            Hello world!
                        </h1>
                        <input 
                            type="text"
                            on-input="input"
                        />
                        <button type="submit">Submit!</button>     
                    </form>
                `,
                scripts: () => html`
                    ${getScriptListener()}
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

    const staticResult = await getStaticResponse({ request, waitUntil: ctx.waitUntil.bind(ctx), manifestJSON, env })
    if (staticResult?.response) return staticResult?.response

    const notFoundResult = await getNotFoundResponse({ request })
    return notFoundResult?.response
}

export default {
    fetch: (request, env, ctx) => handleFetch({ request, env, ctx })
}