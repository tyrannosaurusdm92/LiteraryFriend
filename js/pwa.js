(function(global){
'use strict';
if(!('serviceWorker' in navigator))return;
function register(){
  if(location.protocol==='file:')return;
  navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',register,{once:true});else register();
})(window);
