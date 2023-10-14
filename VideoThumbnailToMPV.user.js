// ==UserScript==
// @name        Click on video thumbnail to play in MPV
// @name:ru     Нажми на митиатюру для проигрывания в MPV
// @namespace   nsinister.scripts.videothumb2mpv
// @match       https://*.youtube.com/*
// @match       https://vimeo.com/*
// @grant       none
// @version     0.2
// @author      nSinister
// @license     MIT
// @description Opens videos in external player (mpv) by simply clicking on a thumbnail.
// @description:ru Проигрывает ролики во внешнем плеере (mpv) по нажатию на миниатюру
//
// ==/UserScript==

"use strict";

let sites = {
  "www.youtube.com": { sel: "a.ytd-thumbnail", url: "https://www.youtube.com", needsFullUrl: true },
  "m.youtube.com": { sel: "a.media-item-thumbnail-container", url: "https://m.youtube.com", needsFullUrl: true },
  "vimeo.com": { sel: "a.iris_video-vital__overlay", url: "https://vimeo.com", needsFullUrl: false },
};

function GM_btoaUrl(url) {
  return btoa(url).replace(/\//g, "_").replace(/\+/g, "-").replace(/\=/g, "");
}

function replaceLink(node, site) {
  if(node) {
    let hrefval = node.getAttribute('href');
    if (hrefval == null || hrefval.startsWith("mpv"))
      return;

    let full_url = (site.needsFullUrl ? site.url : "") + hrefval;
    if (full_url.startsWith('http')) {
      url = full_url;
    }
    if (url == '') {
      var url = location.href;
    }

    var subs = '';
    var s = url;
    var bs = GM_btoaUrl(s);
    var url2 = 'mpv://play/' + bs + '/' + "?referer=" + GM_btoaUrl(location.href);
    if (subs != '') {
      url2 = url2 + '?subs=' + GM_btoaUrl(subs);
    }

    node.setAttribute('href', url2);
    node.addEventListener('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      location.href = url2;
    });
  }
}

function GM_getParentByTagName(el, tagName) {
  tagName = tagName.toLowerCase();
  if (el.tagName.toLowerCase() == tagName) {
    return el;
  }
  while (el && el.parentNode) {
    el = el.parentNode;
    if (el.tagName && el.tagName.toLowerCase() == tagName) {
      return el;
    }
  }
  return "undefined";
}

function detectSite(sites) {
  let site;
  for (let s in sites) {
    site = sites[s];
    if (location.href.includes(s)) {
      return site;
    }
  }
  return null;
}

let site = detectSite(sites)
document.addEventListener('mousedown', function(e) {
  let el = GM_getParentByTagName(e.target, 'A');
  if (el.href && el.href.startsWith('http') && el.matches(site.sel)) {
    replaceLink(el, site);
  }
});