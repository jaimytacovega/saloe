import * as URLPatternPolyfill from 'urlpattern-polyfill'


self.URLPattern = self?.URLPattern ?? URLPatternPolyfill.URLPattern

const getURLPatern = ({ pathname }) => new self.URLPattern({ pathname })


export {
    getURLPatern,
}