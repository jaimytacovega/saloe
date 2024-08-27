import * as URLPatternPolyfill from 'urlpattern-polyfill'


if (self?.URLPattern) self.URLPattern = URLPatternPolyfill.URLPattern

const getURLPatern = ({ pathname }) => new self.URLPattern({ pathname })


export {
    getURLPatern,
}