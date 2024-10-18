"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const listener = ({
  SRC_ELEMEMENTS_QUERY = []
} = {}) => {
  const EVENTS_PREVENT_DEFAULT_MANDATORY = [
    "submit"
  ];
  const EVENTS_FIRE_DOCUMENT_BODY_LISTENERS = [
    "mouseover",
    "click"
  ];
  const EVENTS = [
    "submit",
    "input",
    "blur",
    "change",
    "focus",
    "invalid",
    ...EVENTS_FIRE_DOCUMENT_BODY_LISTENERS
  ];
  const addListener = ({ srcElement, event, listeners }) => {
    srcElement == null ? void 0 : srcElement.addEventListener(event, (e) => {
      executeListeners({ e, srcElement, listeners });
    });
  };
  const executeListeners = ({ e, srcElement, listeners }) => {
    listeners == null ? void 0 : listeners.forEach((listener2) => {
      if (listener2) listener2({ e, srcElement });
    });
  };
  const getListenerFromScript = ({ script, event }) => {
    var _a;
    if (!script) return null;
    if (script[event]) return script[event];
    const prev = (_a = Object.keys(script)) == null ? void 0 : _a.find((key) => script[key][event]);
    if (!prev) return null;
    return script[prev][event];
  };
  const fetchListeners = async ({ srcElement, event, e }) => {
    var _a;
    if (!(srcElement == null ? void 0 : srcElement.getAttribute)) return;
    const scriptNames = srcElement == null ? void 0 : srcElement.getAttribute(`on-${event}`);
    if (!scriptNames) return;
    if (scriptNames && EVENTS_PREVENT_DEFAULT_MANDATORY.includes(event)) e.preventDefault();
    const scripts = await Promise.all(
      (_a = scriptNames == null ? void 0 : scriptNames.split(",")) == null ? void 0 : _a.map((scriptName) => {
        const scriptToImport = `/${scriptName == null ? void 0 : scriptName.trim()}.js`;
        return importScriptDynamically({ path: scriptToImport });
      })
    );
    const listeners = scripts == null ? void 0 : scripts.map((script) => getListenerFromScript({ script, event }));
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
    const event = "load";
    const srcElements = document == null ? void 0 : document.querySelectorAll(`[on-${event}]`);
    srcElements == null ? void 0 : srcElements.forEach(async (srcElement) => {
      const listeners = await fetchListeners({ srcElement, event, e: null });
      executeListeners({ e: null, srcElement, listeners });
      srcElement == null ? void 0 : srcElement.removeAttribute(`on-${event}`);
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
      const listener2 = getListenerFromScript({ script, event: "observe" });
      if (!listener2) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => listener2({ entry, observer }));
      });
      observedSrcElements == null ? void 0 : observedSrcElements.forEach((observerSrcElement) => {
        var _a2, _b;
        observer.observe(observerSrcElement);
        const observerAttr = observerSrcElement == null ? void 0 : observerSrcElement.getAttribute("on-observe");
        const updatedObserverAttr = (_b = (_a2 = observerAttr == null ? void 0 : observerAttr.replaceAll(scriptName + ", ", "")) == null ? void 0 : _a2.replaceAll(", " + scriptName, "")) == null ? void 0 : _b.replaceAll(scriptName, "");
        if (updatedObserverAttr === "") observerSrcElement.removeAttribute("on-observe");
        else observerSrcElement.setAttribute("on-observe", updatedObserverAttr);
      });
    });
  };
  const getSrcElement = ({ srcElement, event }) => {
    if (!(srcElement == null ? void 0 : srcElement.hasAttribute)) return srcElement;
    const attribute = `on-${event}`;
    const hasScriptName = srcElement == null ? void 0 : srcElement.hasAttribute(attribute);
    if (hasScriptName) return srcElement;
    const query = `:is(${["a", "button", ...SRC_ELEMEMENTS_QUERY].join(",")})[${attribute}]`;
    const closestButton = srcElement == null ? void 0 : srcElement.closest(query);
    if (closestButton) return closestButton;
    return srcElement;
  };
  const fireListeners = () => {
    EVENTS.forEach((event) => {
      document.body[`on${event}`] = async (e) => {
        if (EVENTS_FIRE_DOCUMENT_BODY_LISTENERS.includes(event)) {
          await addScripts();
          fireLoadListener();
          fireObserverListeners();
        }
        const srcElement = getSrcElement({ srcElement: e == null ? void 0 : e.srcElement, event });
        const listeners = await fetchListeners({ srcElement, event, e });
        executeListeners({ e, srcElement, listeners });
        addListener({ srcElement, event, listeners });
        if (srcElement == null ? void 0 : srcElement.removeAttribute) srcElement.removeAttribute(`on-${event}`);
      };
    });
  };
  fireListeners();
  window.onload = () => {
    setTimeout(() => {
      var _a;
      (_a = document == null ? void 0 : document.body) == null ? void 0 : _a.click();
    }, 2500);
  };
};
const getScriptListener = ({
  SRC_ELEMEMENTS_QUERY = []
} = {}) => {
  return `<script defer>(${listener.toString()})({ SRC_ELEMEMENTS_QUERY: ${JSON.stringify(SRC_ELEMEMENTS_QUERY)} })<\/script>`;
};
exports.getScriptListener = getScriptListener;
exports.listener = listener;
