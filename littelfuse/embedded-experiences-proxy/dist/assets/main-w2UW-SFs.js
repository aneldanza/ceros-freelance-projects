var e=Object.defineProperty,t=(t,i,s)=>((t,i,s)=>i in t?e(t,i,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[i]=s)(t,"symbol"!=typeof i?i+"":i,s);const i="ceros-embedded-viewport:",s="data-ceros-origin-domains",n="ping",r="ready",o="page-nav";class a{constructor(e){t(this,"isMessageSourceValid",(function(e){return null!==this.register.findFrameWithWindow(e)})),t(this,"isMessageOriginValid",(function(e){if(0===this.originWhitelist.length)return!0;if(!e)return!1;for(var t=e.replace(/^https?:\/\//,""),i=0;i<this.originWhitelist.length;i++)if(this.originWhitelist[i]===t.toLowerCase())return!0;return!1})),this.originWhitelist=[],this.createOriginWhitelist(),this.register=e,window.addEventListener("message",this.processMessage.bind(this))}processMessage(e){if(!this.isMessageOriginValid(e.origin)||!this.isMessageSourceValid(e.source))return;let t;try{t=JSON.parse(e.data),t&&t.event&&t.event.startsWith(i)&&this.dispatchEvent(t.event.substr(24),e.source,t)}catch(s){}}dispatchEvent(e,t,i){if(e===r)this.register.handleReadyEvent(t)}createOriginWhitelist(){const e=document.querySelectorAll(`script[${s}]`);let t=[];return e.forEach((e=>{const i=e.getAttribute(s);t=t.concat(this.parseOriginDomainsAttribute(i))})),t}parseOriginDomainsAttribute(e){return e?e.split(",").map((e=>e.trim().toLowerCase())):[]}}t(a,"sendEvent",(function(e,t,i={}){const s={event:t,...i},n=JSON.stringify(s);e.contentWindow.postMessage(n,"*")}));class c{constructor(){this.subscribers={}}subscribe(e,t){this.subscribers[e]||(this.subscribers[e]=[]),this.subscribers[e].push(t)}notify(e,t){this.subscribers[e]&&this.subscribers[e].forEach((e=>e(t)))}}const d=document.getElementById("page-header"),h=d.getAttribute("data-body-id"),u=d.getAttribute("data-header-id"),l=new class{constructor(e,s,o){t(this,"handleReadyEvent",(function(e){var t=this.findFrameWithWindow(e);t&&(t.parentNode.id===this.bodyExperienceId?this.cerosFrames.body=t:t.parentNode.id===this.headerExperienceId&&(this.cerosFrames.header=t),this.cerosFrames.body&&this.cerosFrames.header&&this.onExperiencesReady(this.cerosFrames))})),t(this,"whenDOMIsReady",(function(e){if("complete"===window.document.readyState||"loading"!==window.document.readyState&&!window.document.documentElement.doScroll)e();else{const t=function(){window.document.removeEventListener("DOMContentLoaded",t),e()};window.document.addEventListener("DOMContentLoaded",t)}})),t(this,"registerCerosFramesInDOM",(function(){const e=window.document.getElementsByTagName("iframe");for(let t=0;t<e.length;t++){const i=e[t],s=i.getAttribute("class");s&&-1!==s.indexOf("ceros-experience")&&this.registerFrame(i)}})),t(this,"registerFrame",(function(e){var t=-1!==this.registeredFrames.indexOf(e),s=e.contentWindow&&"function"==typeof e.contentWindow.postMessage;!t&&s&&(a.sendEvent(e,i+n,{},{message:r,callback:this.handleReadyEvent}),this.registeredFrames.push(e))})),t(this,"findFrameWithWindow",(function(e){for(let t=0;t<this.registeredFrames.length;t++){const i=this.registeredFrames[t];if(i.contentWindow===e)return i}return null})),this.registeredFrames=[],this.bodyExperienceId=e,this.headerExperienceId=s,this.cerosFrames={},this.onExperiencesReady=o,this.init()}init(){this.registerCerosFramesInDOM(),this.whenDOMIsReady((()=>{this.registerCerosFramesInDOM()}))}}(h,u,(e=>{console.log("Both header and body experiences are ready",e);const t=new c;((e,t)=>{CerosSDK.findExperience(t).done((function(t){console.log("body experience is found");const i=t.findComponentsByTag("nav");e.subscribe(o,(function(e){const t=i.components.find((t=>t.getPayload()===e));t&&t.click()}))})).fail((function(e){console.log(e)}))})(t,h),((e,t)=>{CerosSDK.findExperience(t).done((function(t){console.log("header experience is found"),t.findComponentsByTag(o).on(CerosSDK.EVENTS.CLICKED,(t=>{const i=t.getPayload();e.notify(o,i)}))})).fail((function(e){console.log(e)}))})(t,u)}));new a(l);
