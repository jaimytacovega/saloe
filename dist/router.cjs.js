"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const i=require("./urlpattern.cjs.js"),a=require("./worker.cjs.js"),o=new Map,u=()=>o,c=({pathname:t})=>o.get(t),d=({pathname:t,route:e})=>o.set(t,e),R=({pathname:t})=>o.delete(t),p=({url:t})=>{var n;const e=[...new Set((n=u())==null?void 0:n.keys())].find(s=>i.getURLPatern({pathname:s}).test(t.href));return e?i.getURLPatern({pathname:e}):null},l=({origin:t,pathname:e,isRedirectableCallback:n})=>t!==(self==null?void 0:self.origin)?void 0:{response:n({pathname:e})?Response.redirect(e.slice(0,-1),301):null},g=async({request:t})=>{var r;const n=c({pathname:"/404"});return{response:n?(r=await n({request:t,status:404}))==null?void 0:r.response:new Response("404",{status:404})}},f=({origin:t,request:e,isForbiddenCallback:n})=>{if(!(t!==(self==null?void 0:self.origin)||!n({request:e})))return{response:new Response(`${e==null?void 0:e.url} is forbidden`,{status:503})}},b=({origin:t,request:e,isServerOnlyCallback:n})=>{if(!(t!==(self==null?void 0:self.origin)||!n({request:e})))return a.fetch({request:e})};exports.addRoute=d;exports.findPatternFromUrl=p;exports.getForbiddenResponse=f;exports.getNotFoundResponse=g;exports.getRedirectResponse=l;exports.getRoute=c;exports.getRouter=u;exports.getServerOnlyResponse=b;exports.removeRoute=R;
