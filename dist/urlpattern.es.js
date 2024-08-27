import * as e from "urlpattern-polyfill";
self != null && self.URLPattern && (self.URLPattern = e.URLPattern);
const r = ({ pathname: t }) => new self.URLPattern({ pathname: t });
export {
  r as getURLPatern
};
