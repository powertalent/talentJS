// ==UserScript==
// @name        Link Drag
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description Link Drag
// @grant    GM_openInTab
// @grant    GM_setClipboard
// ==/UserScript==


function attachDrag(elem) {

    function GM_btoaUrl(url) {
      return btoa(url).replace(/\//g, "_").replace(/\+/g, "-").replace(/\=/g, "");
    }
  
    function EA(attr, type) {
      console.log(attr, type)
      if (attr.startsWith('http')) {
        url = attr;
      }
      if (url == '') {
        var url = location.href;
      }
      var subs = '';
      var s = url;
  
      var app = 'play';
      if (type != 'vid') {
        var app = type.toLowerCase();
      }
      var bs = GM_btoaUrl(s);
      var url2 = 'mpv://' + app + '/' + bs + '/' + "?referer=" + GM_btoaUrl(location.href);
      if (subs != '') {
        url2 = url2 + '?subs=' + GM_btoaUrl(subs);
      }
      console.log("final url: " + url2);
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
  
        console.log(JSON.stringify(e));
        const targetHref = e.target.href || e.target.src;
  
        switch (+direction) {
          case DirectionEnum.DOWN:
            console.log('MPV: ' + targetHref);
            EA(targetHref, 'vid');
            break;
          case DirectionEnum.LEFT:
            // console.log('Streamlink: ' + targetHref);
            // EA(targetHref, 'stream');
            // document.querySelector('.p-breadcrumbs li:last-child a').click(); // VOZ up level
            break;
          case DirectionEnum.RIGHT:
            console.log('Open: ' + targetHref);
            // copy(targetHref);
            // Copy to clipboard
            GM_setClipboard(targetHref);
            let tabControl = GM_openInTab(targetHref, { active: false });
            // location.href(targetHref)
            // createTab({
            //   url: targetHref,
            //   active: false,
            // });
            // window.open(targetHref, '_blank');
            // openInNewTab(targetHref);
            // createTab({
            //       url: targetHref,
            //       active: false,
            // });
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
  
  function openInNewTab(href) {
    Object.assign(document.createElement('a'), {
      target: '_blank',
      rel: 'noopener noreferrer',
      href: href,
    }).click();
  }
  
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
  
  async function createTab(props) {
      const allTabs = await browser.tabs.query({});
      const tabs = await browser.tabs.query({
          currentWindow: true,
          active: true
      });
      let position = tabs[0].index + 1;
      if (position < 0) {
          position = 0;
      }
      await browser.tabs.create(Object.assign(props, {
          index: position
      }));
  }