"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const g=require("fs"),b=require("path");var w=typeof document<"u"?document.currentScript:null;const y=async({path:e})=>{let t=[];try{const r=await g.promises.readdir(e);for(const a of r){const n=b.join(e,a);if((await g.promises.stat(n)).isDirectory()){const c=await y({path:n});t=t.concat(c)}else t.push(n)}}catch(r){console.error("Error reading directory:",r)}return t},S=async({code:e,filePath:t})=>{try{await g.promises.writeFile(t,e),console.info(`File '${t}' has been created`)}catch(r){console.error("Error writing file:",r)}},_=({source:e})=>y({path:`src/${e}/`}),R=async({sources:e})=>{var r;let t=0;return Promise.all((r=e??[])==null?void 0:r.map(async(a,n)=>{var d;const u=await _({source:a}),c=(d=u==null?void 0:u.map((s,o)=>{var l;if(!(s!=null&&s.includes("/actions/"))||!(s!=null&&s.endsWith(".js")))return"";t++;const i=(l=s==null?void 0:s.replace(`src/${a}`,`@/${a}`))==null?void 0:l.replace(".js","");return`import * as A${t} from '${i}'
console.log(A${t})
`}))==null?void 0:d.join("");return{filePaths:u,code:c}}))},j=({path:e})=>new URL(`${e}`,typeof document>"u"?require("url").pathToFileURL(__filename).href:w&&w.src||new URL("vite.cjs.js",document.baseURI).href).pathname,U=async({sources:e})=>{var t;try{const r=await R({sources:e}),a=`${(t=r==null?void 0:r.map(c=>c==null?void 0:c.code))==null?void 0:t.join(`
`)}`,n="src/_actions_autogenerated.js";return await S({code:a,filePath:n}),{...r==null?void 0:r.reduce((c,d)=>{var s;return c={...c,...(s=d==null?void 0:d.filePaths)==null?void 0:s.reduce((o,i)=>{var f;if(i!=null&&i.endsWith(".js")&&!(i!=null&&i.includes("/actions/")))return o;const l=(f=i==null?void 0:i.split("/"))==null?void 0:f.pop(),$=l==null?void 0:l.replace(/\.[^.]+$/,"");return o[$]=j({path:i}),o},{})},c},{}),actionsFilePath:j({path:n})}}catch(r){return console.error(r),{}}},C=async()=>{const e=await y({path:"dist/"}),t=e==null?void 0:e.filter(r=>!(r!=null&&r.endsWith(".DS_Store")));await S({code:JSON.stringify(t),filePath:"dist/dist.json"})},D=()=>[{name:"postbuild-command",closeBundle:C}];exports.getInputPaths=U;exports.getPlugin=D;
