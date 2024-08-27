"use strict";var p=Object.freeze,w=Object.defineProperty;var m=(e,n)=>p(w(e,"raw",{value:p(n||e.slice())}));Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const $=require("./worker.cjs.js"),r=require("./router.cjs.js"),u=require("./util.cjs.js"),d=(e,...n)=>{var o;return(o=e==null?void 0:e.map((a,c)=>`${a}${(n==null?void 0:n.at(c))??""}`))==null?void 0:o.join("")},b=({head:e,body:n,scripts:o,env:a,status:c,args:t})=>{const l=new Headers;l.append("Content-Type","text/html;charset=UTF-8");const s=[()=>d`
            <!DOCTYPE html>
            <html lang="${(t==null?void 0:t.lang)??"en"}">
            <head>
        `,e,()=>d`
            </head>
            <body 
                data-scope="${u.getScope({env:a})}" 
                data-env="${u.getEnv({env:a})}" 
                ${(t==null?void 0:t.isPublic)??""}
                ${(t==null?void 0:t.isLoading)??""}
            >
        `,n,o??(()=>""),()=>d`
            </body>
            </html>
        `];return $.stream({callbacks:s,headers:l,status:c})};var h;const T=async({pending:e,success:n,error:o})=>{const a=Math.floor(Math.random()*1e9),c=`pending_${a}`,t=`/~/components/${c}`,l=async()=>{const s={"Content-Type":"text/html;charset=utf-8","Transfer-Encoding":"chunked"},y=$.stream({callbacks:[async()=>d`
                    ${await n().then(i=>i).catch(i=>(console.error(i==null?void 0:i.stack),o?o({id:a,err:i}):""))}
                `],headers:s});return r.removeRoute({pathname:t}),y};return r.addRoute({pathname:t,route:{getPage:l}}),d(h||(h=m([`
        `,`
        <script
            data-script-to-load="await-html_script-`,`" 
            type="text/script-to-load"
        >
            (async () => {
                const pendingEl = document?.querySelector('[data-await-pending-template="`,`"]')
                const response = await fetch('`,`')
                const templateString = await response.text()
                pendingEl.outerHTML = templateString
            })()
        <\/script>
    `])),await e({id:c}),a,c,t)};exports.awaitHtml=T;exports.html=d;exports.stream=b;
