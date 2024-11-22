import { stream as streamAsWorker } from './worker'
import { addRoute, removeRoute } from './router'
import { getScope, getEnv } from './util'


const html = (s, ...args) => {
    return s?.map((ss, i) => `${ss}${args?.at(i) ?? ''}`)?.join('')
}

const stream = ({ head, body, scripts, env, status, args }) => {
    const headers = new Headers()
    headers.append('Content-Type', 'text/html;charset=UTF-8')

    const callbacks = [
        () => html`
            <!DOCTYPE html>
            <html lang="${args?.lang ?? 'en'}">
            <head>
        `,
        head,
        () => html`
            </head>
            <body 
                data-scope="${getScope({ env })}" 
                data-env="${getEnv({ env })}" 
                ${args ?? ''}
            >
        `,
        body,
        scripts ?? (() => ''),
        () => html`
            </body>
            </html>
        `
    ]

    return streamAsWorker({ callbacks, headers, status })
}

const awaitHtml = async ({ id, pending, success, error }) => {
    id = id ?? Math.floor(Math.random() * 1_000_000_000)
    
    const pendingId = `pending_${id}`
    const pendingRoutePathname = `/~/components/${pendingId}`

    const route = async () => {
        const headers = new Headers()
        headers.append('Content-Type', 'text/html;charset=UTF-8')
        headers.append('Transfer-Encoding', 'chunked')
        
        const streamResult = streamAsWorker({ 
            callbacks: [
                async () => html`
                    ${
                        await success()
                            .then((template) => template)
                            .catch((err) => {
                                console.error(err?.stack)
                                return error ? error({ id, err }) : ''
                            })
                    }
                `
            ], 
            headers, 
        })

        // removeRoute({ pathname: pendingRoutePathname })

        return streamResult
    }

    addRoute({
        pathname: pendingRoutePathname,
        route,
    })

    return html`
        ${await pending({ id: pendingId })}
        <script
            data-script-to-load="await-html_script-${id}" 
            type="text/script-to-load"
        >
            (async () => {
                const pendingEl = document?.querySelector('[data-await-pending-template="${pendingId}"]')
                const response = await fetch('${pendingRoutePathname}')
                const templateString = await response.text()
                pendingEl.outerHTML = templateString

                if (document?.body?.saloeListen) document?.body?.saloeListen()
            })()
        </script>
    `
}

export {
    html,
    stream,
    awaitHtml,
}