import { html } from './html'


// const LISTENER_SCRIPT = html`
//     <script defer>
//         (() => {
//             const addListener = ({ srcElement, event, callbacks }) => {
//                 srcElement?.addEventListener(event, (e) => {
//                     executeCallbacks({ e, srcElement, callbacks })
//                 })
//             }

//             const executeCallbacks = ({ e, srcElement, callbacks }) => {
//                 callbacks?.forEach((callback) => {
//                     if (callback) callback({ e, srcElement })
//                 })
//             }

//             const getCallbackInModule = ({ customModule, event }) => {
//                 if (!customModule) return null
//                 if (customModule[event]) return customModule[event]
//                 const prev = Object.keys(customModule)?.find((key) => customModule[key][event])
//                 if (!prev) return null
//                 return customModule[prev][event]
//             }

//             const getSrcElement = ({ srcElement, event }) => {
//                 if (!srcElement?.hasAttribute) return srcElement
//                 const attribute = 'on-' + event
//                 const hasActionStarter = srcElement?.hasAttribute(attribute)
//                 if (hasActionStarter) return srcElement

//                 const query = ':is(a, button, li)[' + attribute + ']'
//                 const closestButton = srcElement?.closest(query)
//                 if (closestButton) return closestButton

//                 return srcElement
//             }

//             const fetchListener = async ({ srcElement, event, e }) => {
//                 if (!srcElement?.getAttribute) return

//                 const starter = srcElement?.getAttribute('on-' + event)
//                 if (!starter) return

//                 if (starter && ['submit'].includes(event)) e.preventDefault()

//                 const helpers = await Promise.all(
//                     starter?.split(',')?.map((helperName) => {
//                         const toImport = '/' + helperName?.trim() + '.js'
//                         return import(toImport)?.catch((err) => { })
//                     })
//                 )

//                 const callbacks = helpers?.map((helper) => getCallbackInModule({ customModule: helper, event }))

//                 if (['load', 'click', 'submit', 'input', 'change'].includes(event)) executeCallbacks({ e, srcElement, callbacks })
//                 if (['focus', 'blur', 'invalid', 'click', 'submit', 'input', 'change'].includes(event)) addListener({ srcElement, event, callbacks })
//                 srcElement?.removeAttribute('on-' + event)
//             }

//             // load
//             const configLoad = () => {
//                 const event = 'load'
//                 const srcElements = document?.querySelectorAll('[on-' + event + ']')

//                 srcElements?.forEach(async (srcElement) => {
//                     fetchListener({ srcElement, event, e: null })
//                 })
//             }

//             // invalid
//             const configInvalid = () => {
//                 const event = 'invalid'
//                 const srcElements = document?.querySelectorAll('[on-' + event + ']')

//                 srcElements?.forEach(async (srcElement) => {
//                     fetchListener({ srcElement, event, e: null })
//                 })
//             }

//             // blur
//             const configBlur = () => {
//                 const event = 'blur'
//                 const srcElements = document?.querySelectorAll('[on-' + event + ']')

//                 srcElements?.forEach(async (srcElement) => {
//                     fetchListener({ srcElement, event, e: null })
//                 })
//             }

//             // focus
//             const configFocus = () => {
//                 const event = 'focus'
//                 const srcElements = document?.querySelectorAll('[on-' + event + ']')

//                 srcElements?.forEach(async (srcElement) => {
//                     fetchListener({ srcElement, event, e: null })
//                 })
//             }

//             // event-listeners
//             const configEventListeners = () => {
//                 ['mouseover', 'click', 'submit', 'input', 'blur', 'change']?.forEach((event) => document.body['on' + event] = async (e) => {
//                     if (['mouseover', 'click'].includes(event)){
//                         await addScripts()
//                         configLoad()
//                         configInvalid()
//                         configBlur()
//                         configFocus()

//                         configObservers()
//                     }

//                     const srcElement = getSrcElement({ srcElement: e.srcElement, event })
//                     fetchListener({ srcElement, event, e })
//                 })
//             }

//             // observers
//             const configObservers = () => {
//                 const srcElements = [...document.querySelectorAll('[on-observe]')]
                
//                 const uniqueStarters = [...srcElements?.reduce((acc, srcElement) => {
//                     const attribute = srcElement?.getAttribute('on-observe')
//                     if (attribute === 'undefined') return acc
//                     const starters = attribute?.split(',')
//                     starters?.forEach((starter) => acc?.set(starter, 1))
//                     return acc
//                 }, new Map())?.keys()]

//                 uniqueStarters?.forEach(async (starter) => {
//                     const starterElements = document.querySelectorAll('[on-observe*="' + starter + '"]')

//                     const helper = await import('/' + starter?.trim() + '.js')?.catch((err) => { })
//                     const callback = getCallbackInModule({ customModule: helper, event: 'observe' })
//                     if (!callback) return

//                     const observer = new IntersectionObserver((entries) => {
//                         entries.forEach((entry) => callback({ entry, observer }))
//                     })

//                     starterElements?.forEach((starterElement) => {
//                         observer.observe(starterElement)

//                         const observerAttr = starterElement?.getAttribute('on-observe')
//                         const updatedObserverAttr = observerAttr?.replaceAll(starter + ', ', '')?.replaceAll(', ' + starter, '')?.replaceAll(starter, '')
                        
//                         if (updatedObserverAttr === '') starterElement.removeAttribute('on-observe')
//                         else starterElement.setAttribute('on-observe', updatedObserverAttr)
//                     })
//                 })
//             }

//             const loadScript = ({ id, attrs, content }) => {
//                 const script = document?.createElement('script')

//                 Object.keys(attrs)?.forEach((attrKey) => script?.setAttribute(attrKey, attrs[attrKey]))
//                 script.id = id

//                 if (content) script?.insertAdjacentHTML('beforeend', content)

//                 return new Promise((resolve, reject) => {
//                     if (!attrs.src) {
//                         resolve()
//                         document?.body?.insertAdjacentElement('beforeend', script)
//                         return
//                     }

//                     script.onload = script.onreadystatechange = function () {
//                         if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
//                             resolve()
//                             script.onload = script.onreadystatechange = null
//                         }
//                     }

//                     script.onerror = () => {
//                         console.error('script failed to load')
//                         reject(new Error('Failed to load script with src ' + script.src))
//                     }

//                     document?.body?.insertAdjacentElement('beforeend', script)
//                 })
//             }

//             const addScripts = () => {
//                 const scriptsToLoad = [...document.querySelectorAll('script[data-script-to-load]')]
//                 return Promise.all(
//                     scriptsToLoad?.map((scriptToLoad) => {
//                         const id = scriptToLoad?.getAttribute('data-script-to-load')
//                         scriptToLoad.removeAttribute('data-script-to-load')

//                         const attrs = scriptToLoad?.getAttributeNames()?.reduce((acc, attrName) => {
//                             const attrValue = scriptToLoad.getAttribute(attrName)
//                             if (attrValue !== 'text/script-to-load') acc[attrName] = attrValue
//                             return acc
//                         }, {})

//                         const content = scriptToLoad?.textContent

//                         scriptToLoad?.remove()

//                         return loadScript({ id, attrs, content }).catch((err) => {
//                             console.error(err)
//                         })
//                     })
//                 )
//             }

//             configEventListeners()

//             window.onload = () => {
//                 setTimeout(() => {
//                     document?.body?.click()
//                 }, 2_500)
//             }
//         })()
//     </script>
// `

const LISTENER_SCRIPT = html`
    <script defer>
        (() => {
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

                const scriptNames = srcElement?.getAttribute('on-' + event)
                if (!scriptNames) return

                if (scriptNames && EVENTS_PREVENT_DEFAULT_MANDATORY.includes(event)) e.preventDefault()

                const scripts = await Promise.all(
                    scriptNames?.split(',')?.map((scriptName) => {
                        const scriptToImport = '/' + scriptName?.trim() + '.js'
                        return import(scriptToImport)?.catch((err) => { })
                    })
                )

                const listeners = scripts?.map((script) => getListenerFromScript({ script, event }))

                return listeners

                // if (['load', 'click', 'submit', 'input', 'change'].includes(event)) executeListeners({ e, srcElement, listeners })
                // if (['focus', 'blur', 'invalid', 'click', 'submit', 'input', 'change'].includes(event)) addListener({ srcElement, event, listeners })

                // srcElement?.removeAttribute('on-' + event)
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
                        reject(new Error('Failed to load script with src ' + script.src))
                    }

                    document?.body?.insertAdjacentElement('beforeend', script)
                })
            }

            // load
            const fireLoadListener = () => {
                const event = 'load'
                const srcElements = document?.querySelectorAll('[on-' + event + ']')

                srcElements?.forEach(async (srcElement) => {
                    const listeners = await fetchListeners({ srcElement, event, e: null })
                    executeListeners({ e: null, srcElement, listeners })

                    srcElement?.removeAttribute('on-' + event)
                })
            }

            // invalid
            const fireInvalidListener = () => {
                const event = 'invalid'
                const srcElements = document?.querySelectorAll('[on-' + event + ']')

                srcElements?.forEach(async (srcElement) => {
                    const listeners = await fetchListeners({ srcElement, event, e: null })
                    addListener({ srcElement, event, listeners })
                })
            }

            // blur
            const fireBlurListener = () => {
                const event = 'blur'
                const srcElements = document?.querySelectorAll('[on-' + event + ']')

                srcElements?.forEach(async (srcElement) => {
                    const listeners = await fetchListeners({ srcElement, event, e: null })
                    addListener({ srcElement, event, listeners })
                })
            }

            // focus
            const fireFocusListener = () => {
                const event = 'focus'
                const srcElements = document?.querySelectorAll('[on-' + event + ']')

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
                    const observedSrcElements = document.querySelectorAll('[on-observe*="' + scriptName + '"]')

                    const script = await import('/' + scriptName?.trim() + '.js')?.catch((err) => { })
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
                const attribute = 'on-' + event
                const hasScriptName = srcElement?.hasAttribute(attribute)
                if (hasScriptName) return srcElement

                const query = ':is(a, button, li)[' + attribute + ']'
                const closestButton = srcElement?.closest(query)
                if (closestButton) return closestButton

                return srcElement
            }

            const fireListeners = () => {
                EVENTS_FIRE_DOCUMENT_BODY_LISTENERS?.forEach((event) => {
                    document.body['on' + event] = async (e) => {
                        await addScripts()

                        fireLoadListener()
                        fireObserverListeners()
                    }
                })

                EVENTS?.forEach((event) => {
                    document.body['on' + event] = async (e) => {
                        const srcElement = getSrcElement({ srcElement: e?.srcElement, event })
                        const listeners = await fetchListeners({ srcElement, event, e })
                        
                        executeListeners({ e, srcElement, listeners })
                        addListener({ srcElement, event, listeners })
                        
                        if (srcElement?.removeAttribute) srcElement.removeAttribute('on-' + event)
                    }
                })

                // ['mouseover', 'click', 'submit', 'input', 'blur', 'change']?.forEach((event) => {
                //     document.body['on' + event] = async (e) => {
                //         if (EVENTS_FIRE_DOCUMENT_BODY_LISTENERS.includes(event)) {
                //             await addScripts()

                //             fireLoadListener()
                //             fireInvalidListener()
                //             fireBlurListener()
                //             fireFocusListener()

                //             fireObserverListeners()
                //         }

                //         const srcElement = getSrcElement({ srcElement: e.srcElement, event })
                //         fetchListeners({ srcElement, event, e })
                //     }
                // })
            }

            fireListeners()

            window.onload = () => {
                setTimeout(() => {
                    document?.body?.click()
                }, 2_500)
            }
        })()
    </script>
`

const SW_REGISTER_SCRIPT = html`
    <script defer>
        (async () => {
            if (!navigator.serviceWorker) return

            navigator.serviceWorker.register('/sw.worker.js', { scope: '/', type: 'module' })

            let refreshing
            // check to see if there is a current active service worker
            const oldSw = (await navigator.serviceWorker.getRegistration())?.active?.state
            navigator.serviceWorker.addEventListener('controllerchange', async () => {
                if (refreshing) return
                // when the controllerchange event has fired, we get the new service worker
                const newSw = (await navigator.serviceWorker.getRegistration())?.active?.state
                
                // if there was already an old activated service worker, and a new activating service worker, do notify update
                if (oldSw === 'activated' && newSw === 'activating') {
                    refreshing = true
                    // notifyUpdate()
                    location.reload()
                }
            })
        })()
    </script> 
`

export {
    LISTENER_SCRIPT,
    SW_REGISTER_SCRIPT,
}