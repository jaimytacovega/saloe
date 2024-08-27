const Scope = {
    Cloudflare: 'cloudflare-worker',
    ServiceWorker: 'service-worker',
    Window: 'window',
}

const Environment = {
    Production: 'prod',
    Development: 'dev',
    Qa: 'qa',
}

const isCloudflareWorker = ({ env }) => env?.IS_CLOUDFLARE_WORKER
const isServiceWorker = ({ env }) => env?.IS_SERVICE_WORKER
const isWindow = () => typeof window === 'object'

const getScope = ({ env }) => {
    if (isCloudflareWorker({ env })) return Scope.Cloudflare
    if (isServiceWorker({ env })) return Scope.ServiceWorker
    if (isWindow()) return Scope.Window
}

const getEnv = ({ env } = {}) => {
    if (isCloudflareWorker({ env }) || isServiceWorker({ env })) return env.ENV
    if (isWindow()) return document?.body?.getAttribute('data-env')
} 

const isProdEnv = ({ env }) => getEnv({ env }) === Environment.Production
const isDevEnv = ({ env }) => getEnv({ env }) === Environment.Development
const isQaEnv = ({ env }) => getEnv({ env }) === Environment.Qa


export {
    getScope,
    getEnv,

    isProdEnv,
    isDevEnv,
    isQaEnv,

    isCloudflareWorker,
    isWindow,
    isServiceWorker,
}