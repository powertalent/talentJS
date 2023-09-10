// ==UserScript==
// @name         VOZ
// @namespace    http://tampermonkey.net/
// @version      20230910_131408
// @description  try to take over the world!
// @author       Me
// @match        https://voz.vn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=voz.vn
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
  document.querySelectorAll('.bbWrapper .bbImage').forEach(img => {
    img.style.maxHeight = '350px';
    // console.log('talent: ' + img.height)
    if (img.height >= 350) {
      img.style.width = 'auto';
      img.parentElement.style.border = '1px dotted';
      img.parentElement.style.padding = '2px';
      // img.style.margin = '4px';
    }

    // if (img.height > 350) {
    //   img.style.height = '350px';
    //   img.style.width = 'auto';
    // }
  })

  document.querySelectorAll('.bbWrapper').forEach(x => x.innerHTML = x.innerHTML.replace(/<\/blockquote>(?<!\s)/g,'</blockquote>\n')
                                                 .replace(/(^[\S ]+)<div class="bbImageWrapper/gm,'$1<br><div class="bbImageWrapper')
                                                 .replace(/<\/div>(<br>|\n|\r)+<div class="bbImageWrapper/g,'</div><div class="bbImageWrapper')
                                                 )
  // document.querySelectorAll('.bbWrapper').forEach(x => x.innerHTML = x.innerHTML.replace(/(^[\S ]+)<div class="bbImageWrapper/gm,'$1<br><div class="bbImageWrapper'))
  // document.querySelectorAll('.bbWrapper').forEach(x => x.innerHTML = x.innerHTML.replace(/<\/div>(<br>|\n|\r)+<div class="bbImageWrapper/g,'</div><div class="bbImageWrapper'))

})();
