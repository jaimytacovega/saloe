const listener = ({ 
    SRC_ELEMEMENTS_QUERY = [] 
} = {}) => {
    const EVENTS_PREVENT_DEFAULT_MANDATORY = [
        'submit'
    ]

    const EVENTS = [
        'mouseover',
        'click',
        'submit',
        'input',
        'blur',
        'change',
        'focus',
        'invalid',
    ]

    const addListener = ({ srcElement, eventName, listeners, afterExecuteListeners }) => {
        srcElement?.addEventListener(eventName, (e) => {
            executeListeners({ e, srcElement, listeners, afterExecuteListeners })
        })
    }

    const executeListeners = async ({ e, srcElement, listeners, afterExecuteListeners }) => {        
        await Promise.all(
            (listeners ?? []).map((listener) => {
                if (listener) return listener({ e, srcElement })
            })
        )

        if (afterExecuteListeners) await afterExecuteListeners()
    }

    const getListenerFromScript = ({ script, eventName }) => {
        if (!script) return null
        if (script[eventName]) return script[eventName]
        const prev = Object.keys(script)?.find((key) => script[key][eventName])
        if (!prev) return null
        return script[prev][eventName]
    }

    const fetchListeners = async ({ srcElement, eventName, e }) => {
        if (!srcElement?.getAttribute) return

        const scriptNames = srcElement?.getAttribute(`on-${eventName}`)
        if (!scriptNames) return

        if (e && scriptNames && EVENTS_PREVENT_DEFAULT_MANDATORY.includes(eventName)) e.preventDefault()

        const scripts = await Promise.all(
            scriptNames?.split(',')?.map((scriptName) => {
                const scriptToImport = `/${scriptName?.trim()}.js`
                return importScriptDynamically({ path: scriptToImport })
            })
        )

        const listeners = scripts?.map((script) => getListenerFromScript({ script, eventName }))

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

    // FIX: return import() to prevent __vitePreload to take action
    const importScriptDynamically = ({ path }) => {
        return import(path)?.catch((err) => { })
    }

    // load
    const fireLoadListener = () => {
        const eventName = 'load'
        const srcElements = document?.querySelectorAll(`[on-${eventName}]`)

        srcElements?.forEach(async (srcElement) => {
            const listeners = await fetchListeners({ srcElement, eventName, e: null })
            executeListeners({ e: null, srcElement, listeners })

            srcElement?.removeAttribute(`on-${eventName}`)
        })
    }

    // invalid
    const fireInvalidListener = () => {
        const eventName = 'invalid'
        const srcElements = document?.querySelectorAll(`[on-${eventName}]`)

        srcElements?.forEach(async (srcElement) => {
            const listeners = await fetchListeners({ srcElement, eventName, e: null })
            addListener({ srcElement, eventName, listeners })
        })
    }

    // blur
    const fireBlurListener = () => {
        const eventName = 'blur'
        const srcElements = document?.querySelectorAll(`[on-${eventName}]`)

        srcElements?.forEach(async (srcElement) => {
            const listeners = await fetchListeners({ srcElement, eventName, e: null })
            addListener({ srcElement, eventName, listeners })
        })
    }

    // focus
    const fireFocusListener = () => {
        const eventName = 'focus'
        const srcElements = document?.querySelectorAll(`[on-${eventName}]`)

        srcElements?.forEach(async (srcElement) => {
            const listeners = await fetchListeners({ srcElement, eventName, e: null })
            addListener({ srcElement, eventName, listeners })
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

            const script = await importScriptDynamically({ path: `/${scriptName?.trim()}.js` })
            const listener = getListenerFromScript({ script, eventName: 'observe' })
            if (!listener) return

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => listener({ entry, observer }))
            }, {
                threshold: .5,
            })

            observedSrcElements?.forEach((observerSrcElement) => {
                observer.observe(observerSrcElement)

                const observerAttr = observerSrcElement?.getAttribute('on-observe')
                const updatedObserverAttr = observerAttr?.replaceAll(scriptName + ', ', '')?.replaceAll(', ' + scriptName, '')?.replaceAll(scriptName, '')

                if (!updatedObserverAttr) observerSrcElement.removeAttribute('on-observe')
                else observerSrcElement.setAttribute('on-observe', updatedObserverAttr)
            })
        })
    }

    const getSrcElement = ({ srcElement, eventName }) => {
        if (!srcElement?.hasAttribute) return srcElement
        const attribute = `on-${eventName}`
        const hasScriptName = srcElement?.hasAttribute(attribute)
        if (hasScriptName) return srcElement

        const query = `:is(${['a', 'button', ...SRC_ELEMEMENTS_QUERY].join(',')})[${attribute}]`
        const closestButton = srcElement?.closest(query)
        if (closestButton) return closestButton

        return srcElement
    }

    const cloneSrcElement = ({ srcElement }) => {
        const newSrcElement = document.createElement(srcElement?.tagName)

        Array.from(srcElement?.attributes).forEach((attr) => {
            if (attr.name.startsWith('on-')) return
            newSrcElement.setAttribute(attr.name, attr.value)
        })

        return newSrcElement
    }

    const isAnchorBeingClicked = ({ srcElement, eventName }) => {
        return srcElement?.tagName === 'A' && eventName === 'click'
    }

    const clickDefaultAnchor = ({ srcElement }) => {
        const newAnchor = cloneSrcElement({ srcElement })
        newAnchor.click()
    }

    const fireListeners = () => {
        EVENTS.forEach((eventName) => {
            document.body[`on${eventName}`] = async (e) => {
                const srcElement = getSrcElement({ srcElement: e?.srcElement, eventName })
                const isAnchorClicked = isAnchorBeingClicked({ srcElement, eventName })
                
                if (isAnchorClicked) e.preventDefault()

                const listeners = await fetchListeners({ srcElement, eventName, e })
                const afterExecuteListeners = isAnchorClicked 
                    ? () => { clickDefaultAnchor({ srcElement }) } 
                    : null 

                executeListeners({ e, srcElement, listeners, afterExecuteListeners })
                addListener({ srcElement, eventName, listeners, afterExecuteListeners })

                if (srcElement?.removeAttribute) srcElement.removeAttribute(`on-${eventName}`)
            }
        })

        const saloeListenEvent = new CustomEvent('saloeListen', {
            detail: { message: 'This is a custom eventName!' }
        })

        document.body.addEventListener('saloeListen', async (e) => {
            await addScripts()
            fireLoadListener()
            fireObserverListeners()
        })

        document.body.saloeListen = function () {
            document.body.dispatchEvent(saloeListenEvent)
        }

    }

    fireListeners()

    window.onload = () => {
        setTimeout(() => {
            document.body.saloeListen()
        }, 2_500)
    }
}

const getScriptListener = ({ 
    SRC_ELEMEMENTS_QUERY = [],
} = {}) => {
    return `<script defer>(${listener.toString()})({ SRC_ELEMEMENTS_QUERY: ${JSON.stringify(SRC_ELEMEMENTS_QUERY)} })</script>`
}

export {
    listener,
    getScriptListener,
}