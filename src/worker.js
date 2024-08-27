const executeOnScheduler = async ({ callback, signal, priority }) => {
    try {
        if (!self?.scheduler?.postTask) return { data: await callback() }
        const data = await scheduler.postTask(callback, { priority, signal })
        return { data }
    } catch (err) {
        return { err }
    }
}

const stream = ({ callbacks, headers, status }) => {
    const { readable, writable } = new TransformStream()

    const done = (async () => {
        for (const callback of callbacks) {
            const abortController = new AbortController()
            const executeOnSchedulerResult = await executeOnScheduler({ callback, signal: abortController.signal, priority: 'background' })
            const html = executeOnSchedulerResult?.err ?? executeOnSchedulerResult?.data
            const response = new Response(html, { headers })
            await response.body?.pipeTo(writable, { preventClose: true })
            abortController.abort()
        }

        writable.getWriter().close()
    })()

    return {
        done,
        response: new Response(readable, { headers, status: status ?? 200 }),
    }
}

const fetch = async ({ url, request, ...config }) => {
    try {
        const response = await self?.fetch(url || request, config)?.catch((err) => ({ err }))
        if (response?.err) return response
        return { response }
    } catch (err) {
        return { err }
    }
}

export {
    stream,
    fetch,
}