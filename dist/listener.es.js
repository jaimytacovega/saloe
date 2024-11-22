const listener = ({
  SRC_ELEMEMENTS_QUERY = [],
  listenAfterMs = 2500
} = {}) => {
  const EVENTS_PREVENT_DEFAULT_MANDATORY = [
    "submit"
  ];
  const EVENTS = [
    "mouseover",
    "click",
    "submit",
    "input",
    "blur",
    "change",
    "focus",
    "invalid"
  ];
  const addListener = ({ srcElement, eventName, listeners, afterExecuteListeners }) => {
    srcElement == null ? void 0 : srcElement.addEventListener(eventName, (e) => {
      executeListeners({ e, srcElement, listeners, afterExecuteListeners });
    });
  };
  const executeListeners = async ({ e, srcElement, listeners, afterExecuteListeners }) => {
    await Promise.all(
      (listeners ?? []).map((listener2) => {
        if (listener2) return listener2({ e, srcElement });
      })
    );
    if (afterExecuteListeners) await afterExecuteListeners();
  };
  const getListenerFromScript = ({ script, eventName }) => {
    var _a;
    if (!script) return null;
    if (script[eventName]) return script[eventName];
    const prev = (_a = Object.keys(script)) == null ? void 0 : _a.find((key) => script[key][eventName]);
    if (!prev) return null;
    return script[prev][eventName];
  };
  const fetchListeners = async ({ srcElement, eventName, e }) => {
    var _a;
    if (!(srcElement == null ? void 0 : srcElement.getAttribute)) return;
    const scriptNames = srcElement == null ? void 0 : srcElement.getAttribute(`on-${eventName}`);
    if (!scriptNames) return;
    if (e && scriptNames && EVENTS_PREVENT_DEFAULT_MANDATORY.includes(eventName)) e.preventDefault();
    const scripts = await Promise.all(
      (_a = scriptNames == null ? void 0 : scriptNames.split(",")) == null ? void 0 : _a.map((scriptName) => {
        const scriptToImport = `/${scriptName == null ? void 0 : scriptName.trim()}.js`;
        return importScriptDynamically({ path: scriptToImport });
      })
    );
    const listeners = scripts == null ? void 0 : scripts.map((script) => getListenerFromScript({ script, eventName }));
    return listeners;
  };
  const addScripts = () => {
    const scriptsToLoad = [...document.querySelectorAll("script[data-script-to-load]")];
    return Promise.all(
      scriptsToLoad == null ? void 0 : scriptsToLoad.map((scriptToLoad) => {
        var _a;
        const id = scriptToLoad == null ? void 0 : scriptToLoad.getAttribute("data-script-to-load");
        scriptToLoad.removeAttribute("data-script-to-load");
        const attrs = (_a = scriptToLoad == null ? void 0 : scriptToLoad.getAttributeNames()) == null ? void 0 : _a.reduce((acc, attrName) => {
          const attrValue = scriptToLoad.getAttribute(attrName);
          if (attrValue !== "text/script-to-load") acc[attrName] = attrValue;
          return acc;
        }, {});
        const content = scriptToLoad == null ? void 0 : scriptToLoad.textContent;
        scriptToLoad == null ? void 0 : scriptToLoad.remove();
        return loadScript({ id, attrs, content }).catch((err) => {
          console.error(err);
        });
      })
    );
  };
  const loadScript = ({ id, attrs, content }) => {
    var _a;
    const script = document == null ? void 0 : document.createElement("script");
    (_a = Object.keys(attrs)) == null ? void 0 : _a.forEach((attrKey) => script == null ? void 0 : script.setAttribute(attrKey, attrs[attrKey]));
    script.id = id;
    if (content) script == null ? void 0 : script.insertAdjacentHTML("beforeend", content);
    return new Promise((resolve, reject) => {
      var _a2, _b;
      if (!attrs.src) {
        resolve();
        (_a2 = document == null ? void 0 : document.body) == null ? void 0 : _a2.insertAdjacentElement("beforeend", script);
        return;
      }
      script.onload = script.onreadystatechange = function() {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
          resolve();
          script.onload = script.onreadystatechange = null;
        }
      };
      script.onerror = () => {
        console.error("script failed to load");
        reject(new Error(`Failed to load script with src ${script.src}`));
      };
      (_b = document == null ? void 0 : document.body) == null ? void 0 : _b.insertAdjacentElement("beforeend", script);
    });
  };
  const importScriptDynamically = ({ path }) => {
    var _a;
    return (_a = import(path)) == null ? void 0 : _a.catch((err) => {
    });
  };
  const fireLoadListener = () => {
    const eventName = "load";
    const srcElements = document == null ? void 0 : document.querySelectorAll(`[on-${eventName}]`);
    srcElements == null ? void 0 : srcElements.forEach(async (srcElement) => {
      const listeners = await fetchListeners({ srcElement, eventName, e: null });
      executeListeners({ e: null, srcElement, listeners });
      srcElement == null ? void 0 : srcElement.removeAttribute(`on-${eventName}`);
    });
  };
  const fireObserverListeners = () => {
    var _a;
    const srcElements = [...document.querySelectorAll("[on-observe]")];
    const uniqueScriptNames = [...(_a = srcElements == null ? void 0 : srcElements.reduce((acc, srcElement) => {
      const attribute = srcElement == null ? void 0 : srcElement.getAttribute("on-observe");
      if (attribute === "undefined") return acc;
      const scriptNames = attribute == null ? void 0 : attribute.split(",");
      scriptNames == null ? void 0 : scriptNames.forEach((scriptName) => acc == null ? void 0 : acc.set(scriptName, 1));
      return acc;
    }, /* @__PURE__ */ new Map())) == null ? void 0 : _a.keys()];
    uniqueScriptNames == null ? void 0 : uniqueScriptNames.forEach(async (scriptName) => {
      const observedSrcElements = document.querySelectorAll(`[on-observe*="${scriptName}"]`);
      const script = await importScriptDynamically({ path: `/${scriptName == null ? void 0 : scriptName.trim()}.js` });
      const listener2 = getListenerFromScript({ script, eventName: "observe" });
      if (!listener2) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => listener2({ entry, observer }));
      }, {
        threshold: 0.5
      });
      observedSrcElements == null ? void 0 : observedSrcElements.forEach((observerSrcElement) => {
        var _a2, _b;
        observer.observe(observerSrcElement);
        const observerAttr = observerSrcElement == null ? void 0 : observerSrcElement.getAttribute("on-observe");
        const updatedObserverAttr = (_b = (_a2 = observerAttr == null ? void 0 : observerAttr.replaceAll(scriptName + ", ", "")) == null ? void 0 : _a2.replaceAll(", " + scriptName, "")) == null ? void 0 : _b.replaceAll(scriptName, "");
        if (!updatedObserverAttr) observerSrcElement.removeAttribute("on-observe");
        else observerSrcElement.setAttribute("on-observe", updatedObserverAttr);
      });
    });
  };
  const getSrcElement = ({ srcElement, eventName }) => {
    if (!(srcElement == null ? void 0 : srcElement.hasAttribute)) return srcElement;
    const attribute = `on-${eventName}`;
    const hasScriptName = srcElement == null ? void 0 : srcElement.hasAttribute(attribute);
    if (hasScriptName) return srcElement;
    const query = `:is(${["a", "button", ...SRC_ELEMEMENTS_QUERY].join(",")})[${attribute}]`;
    const closestButton = srcElement == null ? void 0 : srcElement.closest(query);
    if (closestButton) return closestButton;
    return srcElement;
  };
  const cloneSrcElement = ({ srcElement }) => {
    const newSrcElement = document.createElement(srcElement == null ? void 0 : srcElement.tagName);
    Array.from(srcElement == null ? void 0 : srcElement.attributes).forEach((attr) => {
      if (attr.name.startsWith("on-")) return;
      newSrcElement.setAttribute(attr.name, attr.value);
    });
    return newSrcElement;
  };
  const isAnchorBeingClicked = ({ srcElement, eventName }) => {
    return (srcElement == null ? void 0 : srcElement.tagName) === "A" && eventName === "click";
  };
  const clickDefaultAnchor = ({ srcElement }) => {
    const newAnchor = cloneSrcElement({ srcElement });
    newAnchor.click();
  };
  const fireListeners = () => {
    EVENTS.forEach((eventName) => {
      document.body[`on${eventName}`] = async (e) => {
        const srcElement = getSrcElement({ srcElement: e == null ? void 0 : e.srcElement, eventName });
        const isAnchorClicked = isAnchorBeingClicked({ srcElement, eventName });
        if (isAnchorClicked) e.preventDefault();
        const listeners = await fetchListeners({ srcElement, eventName, e });
        const afterExecuteListeners = isAnchorClicked ? () => {
          clickDefaultAnchor({ srcElement });
        } : null;
        executeListeners({ e, srcElement, listeners, afterExecuteListeners });
        addListener({ srcElement, eventName, listeners, afterExecuteListeners });
        if (srcElement == null ? void 0 : srcElement.removeAttribute) srcElement.removeAttribute(`on-${eventName}`);
      };
    });
    const saloeListenEvent = new CustomEvent("saloeListen", {
      detail: { message: "This is a custom eventName!" }
    });
    document.body.addEventListener("saloeListen", async (e) => {
      await addScripts();
      fireLoadListener();
      fireObserverListeners();
    });
    document.body.saloeListen = function() {
      document.body.dispatchEvent(saloeListenEvent);
    };
  };
  fireListeners();
  window.onload = () => {
    setTimeout(() => {
      document.body.saloeListen();
    }, listenAfterMs);
  };
};
const getScriptListener = ({
  SRC_ELEMEMENTS_QUERY = [],
  listenAfterMs = 2500
} = {}) => {
  return `<script defer>(${listener.toString()})({ SRC_ELEMEMENTS_QUERY: ${JSON.stringify(SRC_ELEMEMENTS_QUERY)}, listenAfterMs: ${listenAfterMs} })<\/script>`;
};
export {
  getScriptListener,
  listener
};
