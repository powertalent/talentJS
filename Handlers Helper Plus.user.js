// ==UserScript==
// @name        Handlers Helper Plus
// @include       *://*/*
// @grant       none
// @version     1.8
// @author      -
// @description Helper for protocol_hook.lua
// @namespace Violentmonkey Scripts
// @grant    GM_openInTab
// ==/UserScript==

const livechat = false;
const live_window_width = 400;
const live_window_height = 640;
var collected_urls = {};
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

function attachDrag(elem) {

  function GM_btoaUrl(url) {
    return btoa(url).replace(/\//g, "_").replace(/\+/g, "-").replace(/\=/g, "");
  }

  function EA(attr, type) {
    var url = '';
    var subs = '';
    var s = '';
    console.log(attr, type)
    if (attr.startsWith('http')) {
      url = attr;
    } else if (attr.startsWith('mpv://')) {
      location.href = attr;
      return;
    }
    if (url == '') {
      url = location.href;
    }

    // Plus BEGIN
    // https://regex101.com/r/26ann6/1
    if (!url.match(/(youtube\.com|youtu\.be|streamable\.com)\//)) {
      // Open Link In New Tab Inactive
      GM_openInTab(url, { active: false });
      return;
    }
    // Plus END

    console.log(collected_urls);
    if (Object.keys(collected_urls).length > 0) {
        for (link in collected_urls) {
            console.log(link, collected_urls[link]);
            collected_urls[link].style.boxSizing = 'unset';
            collected_urls[link].style.border = 'unset';
            s += link + ' ';
        }
        s = s.trim(' ');
        console.log(s);
        //var s = collected_urls.join(" ");
    } else {
        var s = url;
    }
    collected_urls = {};
    var app = 'play';
    if (type != 'vid') {
      var app = type.toLowerCase();
    }
    var bs = GM_btoaUrl(s);
    var url2 = 'mpv://' + app + '/' + bs + '/' + "?referer=" + GM_btoaUrl(location.href);
    if (subs != '') {
      url2 = url2 + '?subs=' + GM_btoaUrl(subs);
    }
    //alert(url2);
    if (app == 'stream' && livechat == true) {
        var nurl = new URL(url);
        if (nurl.href.indexOf('www.youtube.com/watch') != -1 || nurl.href.indexOf('m.youtube.com/watch') != -1) {
        window.open("https://www.youtube.com/live_chat?is_popout=1&v=" + nurl.search.split("v=")[1], "", "fullscreen=no,toolbar=no,titlebar=no,menubar=no,location=no,width=" + live_window_width + ",height=" + live_window_height)

        } else if (nurl.href.match('https://.*?.twitch.tv/.')) {
        window.open("https://www.twitch.tv/popout" + nurl.pathname + "/chat?popout=", "", "fullscreen=no,toolbar=no,titlebar=no,menubar=no,location=no,width=" + live_window_width + ",height=" + live_window_height)
        }
    }
    location.href = url2;
  }

  // Define the enum-like directory
  const DirectionEnum = {
    RIGHT: 6,
    LEFT: 4,
    UP: 2,
    DOWN: 8,
    UP_LEFT: 1,
    UP_RIGHT: 3,
    DOWN_LEFT: 7,
    DOWN_RIGHT: 9
  };

  function getDirection(x, y, cx, cy) {
    /*=================
    |                 |
    | 1↖   2↑   3↗ |
    |                 |
    | 4←    5    6→ |
    |                 |
    | 7↙   8↓   9↘ |
    |                 |
    |=================*/
    let d, t;
    if (cx == 0 && cy == 0) {
      return 5;
    }
    if ((cx - x) >= -50 && (cx - x) <= 50 && (cy - y) >= -50 && (cy - y) <= 50) {
      return 5;
    }
    // Change (4 == 4) to (8 == 4) to enable 8 directions
    if (4 == 4) { //4 directions
      if (Math.abs(cx - x) < Math.abs(cy - y)) {
        d = cy > y ? "8" : "2";
      } else {
        d = cx > x ? "6" : "4";
      }
    } else { //8 directions
      t = (cy - y) / (cx - x);
      if (-0.4142 <= t && t < 0.4142) d = cx > x ? '6' : "4";
      else if (2.4142 <= t || t < -2.4142) d = cy > y ? '8' : '2';
      else if (0.4142 <= t && t < 2.4142) d = cx > x ? '9' : '1';
      else d = cy > y ? '7' : '3';
    }
    return d;
  }
  elem.addEventListener('dragstart', function(e) {
    //console.log(e.target);
    //console.log(e.target.shadowRoot);
    /*if (e.target.nodeName != "A") {
    e.stopPropagation();
    e.stopImmediatePropagation();
    //e.preventDefault();
    }*/
    console.log('dragstart');
    var x1 = e.clientX;
    var y1 = e.clientY;
    var dragend = elem.addEventListener('dragend', function doEA(e) {
      var x2 = e.clientX;
      var y2 = e.clientY;
      var direction = getDirection(x1, y1, x2, y2);
      //if ((x2 - x1) >= -50 && (x2 - x1) <= 50 && (y2 - y1) >= -50 && (y2 - y1) <= 50) {direction = 5;console.log(5);}
      //if (e.target.nodeName == "A" && e.target.href.match(/youtube.com|youtu.be|streamable.com/)) {
      console.log('Direction: ' + direction);
      console.log(x1, y1, x2, y2, direction);

      const targetHref = e.target.href || e.target.src;

      switch (+direction) {
        case DirectionEnum.RIGHT:
          console.log('MPV: ' + targetHref);
          EA(targetHref, 'vid');
          break;
        case DirectionEnum.LEFT:
          console.log('Streamlink: ' + targetHref);
          EA(targetHref, 'stream');
          break;
        case DirectionEnum.UP:
          console.log('Open: ' + targetHref);
          EA(targetHref, 'list');
          break;
        case DirectionEnum.DOWN:
          console.log('YTDL: ' + targetHref);
          EA(targetHref, 'ytdl');
          break;

        case DirectionEnum.UP_LEFT:
        case DirectionEnum.UP_RIGHT:
        case DirectionEnum.DOWN_LEFT:
        case DirectionEnum.DOWN_RIGHT:
        default:
          break;
      }
      //}
      console.log(direction);
      this.removeEventListener('dragend', doEA);
    }, false);
  }, false);
}

var count = 0;
var mouseIsDown = false;
var held = false;
document.addEventListener("mousedown", function (e) {
    var link = GM_getParentByTagName(e.target, 'A');
    if (link.nodeName == 'A') {

      mouseIsDown = true;
      document.addEventListener("mouseup", function mouseup(e) {
          mouseIsDown = false;
          this.removeEventListener('mouseup', mouseup);
      });
      document.addEventListener("contextmenu", function contextmenu(e) {
          if (held == true) {
              held = false;
              e.preventDefault();
          }
          held = false;
          this.removeEventListener('contextmenu', contextmenu);
      });
      if (e.button === 2) {
          setTimeout(function () {
              if (mouseIsDown) {
                      if (collected_urls[link.href] == undefined) {
                          //var ele = GM_eleTOPele(e.target);
                          //document.body.appendChild(ele);
                          //collected_urls[link.href] = ele;
                          collected_urls[link.href] = e.target;
                          e.target.style.boxSizing = 'border-box';
                          e.target.style.border = 'solid yellow 4px';
                          //popup('Added: ' + link.href, e.clientX, e.clientY)
                      } else {
                          //collected_urls[link.href].parentNode.removeChild(collected_urls[link.href]);
                          collected_urls[link.href].style.boxSizing = 'unset';
                          collected_urls[link.href].style.border = 'unset';
                          delete collected_urls[link.href];
                          //e.target.style.boxSizing = 'unset';
                          //e.target.style.border = 'unset';
                      }
                  console.log(collected_urls);
                  count = 0;
                  mouseIsDown = false;
              held = true;
              }
          }, 200);
      }
    }

});

attachDrag(document);
var attachedeles = [];
document.addEventListener('mouseover', function(e) {
  if (e.target.shadowRoot) {
    if (attachedeles.includes(e.target) == false) {
      console.log(attachedeles);
      attachedeles.push(e.target);
      attachDrag(e.target.shadowRoot);
    }
  }
});