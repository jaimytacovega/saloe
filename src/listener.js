const listener = () => {
    const EVENTS_PREVENT_DEFAULT_MANDATORY = [
        'submit'
    ]

    const EVENTS_FIRE_DOCUMENT_BODY_LISTENERS = [
        'mouseover',
        'click',
    ]

    const EVENTS = [
        'submit',
        'input',
        'blur',
        'change',
        'focus',
        'invalid',
        ...EVENTS_FIRE_DOCUMENT_BODY_LISTENERS,
    ]

    const addListener = ({ srcElement, event, listeners }) => {
        srcElement?.addEventListener(event, (e) => {
            executeListeners({ e, srcElement, listeners })
        })
    }

    const executeListeners = ({ e, srcElement, listeners }) => {
        listeners?.forEach((listener) => {
            if (listener) listener({ e, srcElement })
        })
    }

    const getListenerFromScript = ({ script, event }) => {
        if (!script) return null
        if (script[event]) return script[event]
        const prev = Object.keys(script)?.find((key) => script[key][event])
        if (!prev) return null
        return script[prev][event]
    }

    const fetchListeners = async ({ srcElement, event, e }) => {
        if (!srcElement?.getAttribute) return

        const scriptNames = srcElement?.getAttribute(`on-${event}`)
        if (!scriptNames) return

        if (scriptNames && EVENTS_PREVENT_DEFAULT_MANDATORY.includes(event)) e.preventDefault()

        const scripts = await Promise.all(
            scriptNames?.split(',')?.map((scriptName) => {
                const scriptToImport = `/${scriptName?.trim()}.js`
                return import(scriptToImport)?.catch((err) => { })
            })
        )

        const listeners = scripts?.map((script) => getListenerFromScript({ script, event }))

        return listeners
    }

    const addScripts = () => {
        const scriptsToLoad = [...document.querySelectorAll('script[data-script-to-load]')]
        return Promise.all(
            scriptsToLoad?.map((scriptToLoad) => {
                const id = scriptToLoad?.getAttribute('data-script-to-load')
                scriptToLoad.removeAttribute('data-script-to-load')

                const attrs = scriptToLoad?.getAttributeNames()?.reduce((acc, attrName) => {
                    const attrValue = scriptToLoad.getAttribute(attrName)
                    if (attrValue !== 'text/script-to-load') acc[attrName] = attrValue
                    return acc
                }, {})

                const content = scriptToLoad?.textContent

                scriptToLoad?.remove()

                return loadScript({ id, attrs, content }).catch((err) => {
                    console.error(err)
                })
            })
        )
    }

    const loadScript = ({ id, attrs, content }) => {
        const script = document?.createElement('script')

        Object.keys(attrs)?.forEach((attrKey) => script?.setAttribute(attrKey, attrs[attrKey]))
        script.id = id

        if (content) script?.insertAdjacentHTML('beforeend', content)

        return new Promise((resolve, reject) => {
            if (!attrs.src) {
                resolve()
                document?.body?.insertAdjacentElement('beforeend', script)
                return
            }

            script.onload = script.onreadystatechange = function () {
                if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                    resolve()
                    script.onload = script.onreadystatechange = null
                }
            }

            script.onerror = () => {
                console.error('script failed to load')
                reject(new Error(`Failed to load script with src ${script.src}`))
            }

            document?.body?.insertAdjacentElement('beforeend', script)
        })
    }

    // load
    const fireLoadListener = () => {
        const event = 'load'
        const srcElements = document?.querySelectorAll(`[on-${event}]`)

        srcElements?.forEach(async (srcElement) => {
            const listeners = await fetchListeners({ srcElement, event, e: null })
            executeListeners({ e: null, srcElement, listeners })

            srcElement?.removeAttribute(`on-${event}`)
        })
    }

    // invalid
    const fireInvalidListener = () => {
        const event = 'invalid'
        const srcElements = document?.querySelectorAll(`[on-${event}]`)

        srcElements?.forEach(async (srcElement) => {
            const listeners = await fetchListeners({ srcElement, event, e: null })
            addListener({ srcElement, event, listeners })
        })
    }

    // blur
    const fireBlurListener = () => {
        const event = 'blur'
        const srcElements = document?.querySelectorAll(`[on-${event}]`)

        srcElements?.forEach(async (srcElement) => {
            const listeners = await fetchListeners({ srcElement, event, e: null })
            addListener({ srcElement, event, listeners })
        })
    }

    // focus
    const fireFocusListener = () => {
        const event = 'focus'
        const srcElements = document?.querySelectorAll(`[on-${event}]`)

        srcElements?.forEach(async (srcElement) => {
            const listeners = await fetchListeners({ srcElement, event, e: null })
            addListener({ srcElement, event, listeners })
        })
    }

    // observers
    const fireObserverListeners = () => {
        const srcElements = [...document.querySelectorAll('[on-observe]')]

        const uniqueScriptNames = [...srcElements?.reduce((acc, srcElement) => {
            const attribute = srcElement?.getAttribute('on-observe')
            if (attribute === 'undefined') return acc

            const scriptNames = attribute?.split(',')
            scriptNames?.forEach((scriptName) => acc?.set(scriptName, 1))

            return acc
        }, new Map())?.keys()]

        uniqueScriptNames?.forEach(async (scriptName) => {
            const observedSrcElements = document.querySelectorAll(`[on-observe*="${scriptName}"]`)

            const script = await import(`/${scriptName?.trim()}.js`)?.catch((err) => { })
            const listener = getListenerFromScript({ script, event: 'observe' })
            if (!listener) return

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => listener({ entry, observer }))
            })

            observedSrcElements?.forEach((observerSrcElement) => {
                observer.observe(observerSrcElement)

                const observerAttr = observerSrcElement?.getAttribute('on-observe')
                const updatedObserverAttr = observerAttr?.replaceAll(scriptName + ', ', '')?.replaceAll(', ' + scriptName, '')?.replaceAll(scriptName, '')

                if (updatedObserverAttr === '') observerSrcElement.removeAttribute('on-observe')
                else observerSrcElement.setAttribute('on-observe', updatedObserverAttr)
            })
        })
    }

    const getSrcElement = ({ srcElement, event }) => {
        if (!srcElement?.hasAttribute) return srcElement
        const attribute = `on-${event}`
        const hasScriptName = srcElement?.hasAttribute(attribute)
        if (hasScriptName) return srcElement

        const query = `:is(a, button, li)[${attribute}]`
        const closestButton = srcElement?.closest(query)
        if (closestButton) return closestButton

        return srcElement
    }

    const fireListeners = () => {
        EVENTS.forEach((event) => {
            document.body[`on${event}`] = async (e) => {
                if (EVENTS_FIRE_DOCUMENT_BODY_LISTENERS.includes(event)){
                    await addScripts()
                    fireLoadListener()
                    fireObserverListeners()
                }

                const srcElement = getSrcElement({ srcElement: e?.srcElement, event })
                const listeners = await fetchListeners({ srcElement, event, e })
                
                executeListeners({ e, srcElement, listeners })
                addListener({ srcElement, event, listeners })
                
                if (srcElement?.removeAttribute) srcElement.removeAttribute(`on-${event}`)
            }
        })
    }

    fireListeners()

    window.onload = () => {
        setTimeout(() => {
            document?.body?.click()
        }, 2_500)
    }
}

const getScriptListener = () => {
    return `<script defer>(${listener.toString()})()</script>`
}

export {
    listener,
    getScriptListener,
}