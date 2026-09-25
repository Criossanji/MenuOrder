/* ═══════════════════════════════════════════════════════════════
   CartFX — Croissanji add-to-cart animations (self-contained)
   Usage:  CartFX.play(sourceButton)                      → random animation
           CartFX.play(sourceButton, {variant:'chef'})    → specific one
           CartFX.play(btn, {target: el, onLand: fn})     → custom cart target
   Variants: 'chef' | 'belt' | 'scooter' | 'mitt'
   Drop this file into any project — it injects its own CSS.
   ═══════════════════════════════════════════════════════════════ */
window.CartFX = (function(){
  "use strict";
  var VARIANTS = ["chef","belt","scooter","mitt"];

  var CSS = [
    ".cartfx-piece{position:fixed;left:0;top:0;z-index:2999;font-size:28px;pointer-events:none;will-change:transform}",
    ".cartfx-steam{position:fixed;z-index:2998;width:10px;height:22px;border-radius:50%;background:rgba(247,224,218,.75);filter:blur(4px);pointer-events:none;animation:cartfxSteam .8s ease-out forwards}",
    "@keyframes cartfxSteam{to{transform:translateY(-36px) scale(1.6);opacity:0}}",
    ".cartfx-bounce{animation:cartfxBounce .45s ease}",
    "@keyframes cartfxBounce{0%{transform:scale(1)}35%{transform:scale(1.25,.8)}60%{transform:scale(.9,1.15)}100%{transform:scale(1)}}",
    ".cartfx-chef{position:fixed;left:0;top:0;z-index:2997;pointer-events:none;will-change:transform;text-align:center}",
    ".cartfx-chef .cartfx-chef-emoji{font-size:44px;display:block;line-height:1}",
    ".cartfx-chef .cartfx-chef-carry{position:absolute;font-size:22px;right:-12px;top:14px}",
    ".cartfx-speech{position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:#fff;color:#680411;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;border:1.5px solid #680411;white-space:nowrap;font-family:Poppins,sans-serif}",
    ".cartfx-oven{box-shadow:inset 0 0 22px rgba(255,140,0,.85)!important;color:transparent!important}",
    ".cartfx-door{position:absolute;inset:0;background:linear-gradient(#5a3a1e,#3b2413);border-radius:10px;border:2px solid #2a1809;transform-origin:bottom;animation:cartfxDoor .5s ease forwards;pointer-events:none}",
    ".cartfx-door::after{content:\"\";position:absolute;left:20%;right:20%;top:30%;bottom:30%;background:rgba(255,170,60,.9);border-radius:4px;box-shadow:0 0 14px rgba(255,150,40,.9)}",
    "@keyframes cartfxDoor{0%{transform:perspective(300px) rotateX(0)}100%{transform:perspective(300px) rotateX(72deg);opacity:.4}}",
    ".cartfx-belt{position:fixed;left:0;right:0;bottom:0;height:36px;z-index:2996;background:repeating-linear-gradient(90deg,#3b2413 0 26px,#57381c 26px 52px);border-top:3px solid #2a1809;transform:translateY(110%);transition:transform .3s ease;pointer-events:none}",
    ".cartfx-belt.cartfx-on{transform:translateY(0)}",
    ".cartfx-belt.cartfx-rolling{animation:cartfxBeltScroll .5s linear infinite}",
    "@keyframes cartfxBeltScroll{from{background-position-x:0}to{background-position-x:-52px}}",
    ".cartfx-tray{position:fixed;left:0;top:0;z-index:2997;pointer-events:none;will-change:transform;text-align:center}",
    ".cartfx-tray .cartfx-food{font-size:26px;line-height:1;display:block}",
    ".cartfx-tray .cartfx-plate{display:block;width:40px;height:7px;background:#c98a2e;border-radius:4px;margin:1px auto 0;border:1.5px solid #a86c1d}",
    ".cartfx-scooter{position:fixed;left:0;top:0;z-index:2997;pointer-events:none;will-change:transform}",
    ".cartfx-scooter .cartfx-bike{font-size:42px;display:inline-block;transform:scaleX(-1);line-height:1}",
    ".cartfx-scooter .cartfx-box{position:absolute;top:-12px;left:2px;font-size:20px}",
    ".cartfx-puff{position:fixed;z-index:2996;width:12px;height:12px;border-radius:50%;background:rgba(120,120,120,.5);filter:blur(3px);pointer-events:none;animation:cartfxPuff .7s ease-out forwards}",
    "@keyframes cartfxPuff{to{transform:translate(-22px,-10px) scale(2);opacity:0}}",
    ".cartfx-mitt{position:fixed;left:0;top:0;z-index:2997;pointer-events:none;will-change:transform;text-align:center}",
    ".cartfx-mitt .cartfx-glove{font-size:44px;display:block;line-height:1;transform:rotate(90deg)}",
    ".cartfx-mitt .cartfx-held{position:absolute;font-size:22px;left:50%;transform:translateX(-50%);bottom:-14px}",
    "@media (prefers-reduced-motion: reduce){.cartfx-piece,.cartfx-steam,.cartfx-chef,.cartfx-belt,.cartfx-tray,.cartfx-scooter,.cartfx-puff,.cartfx-mitt,.cartfx-door{display:none!important;animation:none!important}}"
  ].join("\n");

  function ensureCss(){
    if(document.getElementById("cartfx-styles")) return;
    var s = document.createElement("style");
    s.id = "cartfx-styles";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function reduceMotion(){
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function center(el){
    var r = el.getBoundingClientRect();
    return {x: r.left + r.width/2, y: r.top + r.height/2};
  }
  function floorY(){ return window.innerHeight - 50; }
  function easeInOut(t){ return t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }

  function ding(){
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      var ac = ding.ac || (ding.ac = new AC());
      [880, 1320].forEach(function(f, i){
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.12, ac.currentTime + i*0.12);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i*0.12 + 0.35);
        o.connect(g); g.connect(ac.destination);
        o.start(ac.currentTime + i*0.12); o.stop(ac.currentTime + i*0.12 + 0.4);
      });
    }catch(err){}
  }

  /* per-run context: tracks created nodes + guarantees cleanup even if
     the tab is hidden mid-animation and rAF freezes */
  function makeRun(target, onLand, releaseBusy){
    var nodes = [], landed = false, finished = false;
    var run = {
      add: function(el){ nodes.push(el); document.body.appendChild(el); return el; },
      land: function(withSteam){
        if(landed) return;
        landed = true;
        target.classList.remove("cartfx-bounce"); void target.offsetWidth; target.classList.add("cartfx-bounce");
        if(withSteam && !reduceMotion()){
          var r = target.getBoundingClientRect();
          for(var i=0;i<2;i++){
            var s = document.createElement("div");
            s.className = "cartfx-steam";
            s.style.left = (r.left + r.width/2 - 5 + (i? 9:-9)) + "px";
            s.style.top = (r.top - 8) + "px";
            s.style.animationDelay = (i*0.12)+"s";
            document.body.appendChild(s);
            setTimeout(function(el){ return function(){ el.remove(); }; }(s), 1100);
          }
        }
        if(onLand) onLand();
      },
      finish: function(){
        if(finished) return;
        finished = true;
        nodes.forEach(function(n){ if(n.parentNode) n.parentNode.removeChild(n); });
        if(!landed) run.land(false);
        releaseBusy();
      }
    };
    setTimeout(run.finish, 6000);   // failsafe: never leave debris or a locked button
    return run;
  }

  function arcFly(run, sx, sy, ex, ey, dur, opts, done){
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "cartfx-piece";
    el.textContent = opts.emoji || "🥐";
    if(opts.size) el.style.fontSize = opts.size + "px";
    run.add(el);
    var cx = (sx+ex)/2, cy = Math.min(sy,ey) - (opts.arc==null ? 120 : opts.arc);
    var t0 = null;
    function step(ts){
      if(!t0) t0 = ts;
      var t = Math.min(1, (ts-t0)/dur), u = 1-t;
      var x = u*u*sx + 2*u*t*cx + t*t*ex;
      var y = u*u*sy + 2*u*t*cy + t*t*ey;
      el.style.transform = "translate("+(x-14)+"px,"+(y-14)+"px) rotate("+((opts.spin||0)*t)+"deg) scale("+(1+((opts.scaleEnd||1)-1)*t)+")";
      if(t<1){ requestAnimationFrame(step); }
      else { el.remove(); if(done) done(); }
    }
    requestAnimationFrame(step);
  }

  /* ── chef: oven ding, then a chef runs the croissant to the cart ── */
  function runChef(btn, target, run){
    ding();
    btn.classList.add("cartfx-oven");
    var door = document.createElement("div");
    door.className = "cartfx-door";
    if(getComputedStyle(btn).position === "static") btn.style.position = "relative";
    btn.appendChild(door);
    setTimeout(function(){ btn.classList.remove("cartfx-oven"); door.remove(); }, 950);

    var b = center(btn), cartC = center(target);
    var chefX = Math.max(60, Math.min(b.x, window.innerWidth - 160));
    var chefY = floorY() - 44;
    setTimeout(function(){
      arcFly(run, b.x, b.y, chefX + 16, chefY + 18, 550, {spin:220}, function(){
        var chef = document.createElement("div");
        chef.className = "cartfx-chef";
        chef.innerHTML = '<span class="cartfx-speech">Coming up! 🥐</span><span class="cartfx-chef-emoji">👨‍🍳</span><span class="cartfx-chef-carry">🥐</span>';
        run.add(chef);
        var endX = cartC.x - 64;
        var t0 = null, DUR = 1250;
        function go(ts){
          if(!t0) t0 = ts;
          var t = Math.min(1, (ts-t0)/DUR);
          var x = chefX + (endX-chefX)*easeInOut(t);
          var bob = Math.abs(Math.sin(t*16))*5;
          chef.style.transform = "translate("+x+"px,"+(chefY-bob)+"px)";
          if(t<1){ requestAnimationFrame(go); }
          else {
            var cc = chef.querySelector(".cartfx-chef-carry");
            if(cc) cc.style.visibility = "hidden";
            var sp = chef.querySelector(".cartfx-speech");
            if(sp) sp.textContent = "Bon appétit!";
            arcFly(run, endX+44, chefY+16, cartC.x, cartC.y, 380, {arc:70, spin:180}, function(){
              run.land(true);
            });
            var t1 = null, DUR2 = 850;
            function back(ts2){
              if(!t1) t1 = ts2;
              var t2 = Math.min(1, (ts2-t1)/DUR2);
              var x2 = endX + (-120-endX)*easeInOut(t2);
              var bob2 = Math.abs(Math.sin(t2*14))*5;
              chef.style.transform = "translate("+x2+"px,"+(chefY-bob2)+"px) scaleX(-1)";
              chef.style.opacity = String(1 - t2*0.4);
              if(t2<1){ requestAnimationFrame(back); }
              else { run.finish(); }
            }
            setTimeout(function(){ requestAnimationFrame(back); }, 260);
          }
        }
        requestAnimationFrame(go);
      });
    }, 430);
  }

  /* ── belt: a conveyor slides up and rolls the croissant over ── */
  function runBelt(btn, target, run){
    var belt = document.createElement("div");
    belt.className = "cartfx-belt";
    run.add(belt);
    requestAnimationFrame(function(){ belt.classList.add("cartfx-on","cartfx-rolling"); });
    var b = center(btn), cartC = center(target);
    var trayY = window.innerHeight - 70;
    var startX = Math.max(30, Math.min(b.x, window.innerWidth - 120));
    arcFly(run, b.x, b.y, startX, trayY + 6, 500, {spin:180}, function(){
      var tray = document.createElement("div");
      tray.className = "cartfx-tray";
      tray.innerHTML = '<span class="cartfx-food">🥐</span><span class="cartfx-plate"></span>';
      run.add(tray);
      var endX = cartC.x - 20;
      var t0 = null, DUR = 1150;
      function roll(ts){
        if(!t0) t0 = ts;
        var t = Math.min(1, (ts-t0)/DUR);
        var x = startX + (endX-startX)*t;
        tray.style.transform = "translate("+(x-20)+"px,"+(trayY+Math.sin(t*40)*1.4)+"px)";
        if(t<1){ requestAnimationFrame(roll); }
        else {
          tray.remove();
          arcFly(run, endX, trayY, cartC.x, cartC.y, 300, {arc:60}, function(){
            run.land(true);
            belt.classList.remove("cartfx-on","cartfx-rolling");
            setTimeout(run.finish, 350);
          });
        }
      }
      requestAnimationFrame(roll);
    });
  }

  /* ── scooter: delivery bike scoops it up and races past the cart ── */
  function runScooter(btn, target, run){
    var b = center(btn), cartC = center(target);
    var groundY = floorY() - 30;
    var pickupX = Math.max(80, Math.min(b.x, window.innerWidth - 200));
    var waiting = null;
    arcFly(run, b.x, b.y, pickupX, groundY + 8, 450, {spin:200}, function(){
      waiting = document.createElement("div");
      waiting.className = "cartfx-piece";
      waiting.textContent = "🥐";
      waiting.style.transform = "translate("+(pickupX-14)+"px,"+(groundY-6)+"px)";
      run.add(waiting);
    });
    setTimeout(function(){
      var sc = document.createElement("div");
      sc.className = "cartfx-scooter";
      sc.innerHTML = '<span class="cartfx-bike">🛵</span><span class="cartfx-box" style="visibility:hidden">🥐</span>';
      run.add(sc);
      var startX = -90, endX = window.innerWidth + 90;
      var dropX = cartC.x - 26;
      var picked = false, dropped = false;
      var t0 = null, DUR = 1900, lastPuff = 0;
      function drive(ts){
        if(!t0) t0 = ts;
        var t = Math.min(1, (ts-t0)/DUR);
        var x = startX + (endX-startX)*easeInOut(t);
        sc.style.transform = "translate("+x+"px,"+groundY+"px)";
        if(ts - lastPuff > 130 && t>0.03 && t<0.95){
          lastPuff = ts;
          var p = document.createElement("div");
          p.className = "cartfx-puff";
          p.style.left = (x-6)+"px"; p.style.top = (groundY+26)+"px";
          document.body.appendChild(p);
          setTimeout(function(el){return function(){el.remove();};}(p), 800);
        }
        if(!picked && x >= pickupX - 10){
          picked = true;
          if(waiting && waiting.parentNode) waiting.remove();
          sc.querySelector(".cartfx-box").style.visibility = "visible";
        }
        if(!dropped && x >= dropX){
          dropped = true;
          sc.querySelector(".cartfx-box").style.visibility = "hidden";
          arcFly(run, dropX, groundY-6, cartC.x, cartC.y, 300, {arc:60}, function(){ run.land(true); });
        }
        if(t<1){ requestAnimationFrame(drive); }
        else { run.finish(); }
      }
      requestAnimationFrame(drive);
    }, 480);
  }

  /* ── mitt: giant oven mitt grabs it off the card ── */
  function runMitt(btn, target, run){
    var b = center(btn), cartC = center(target);
    var mitt = document.createElement("div");
    mitt.className = "cartfx-mitt";
    mitt.innerHTML = '<span class="cartfx-glove">🧤</span><span class="cartfx-held" style="visibility:hidden">🥐</span>';
    run.add(mitt);
    var startX = window.innerWidth + 60, startY = b.y - 30;
    var grabX = b.x - 20, grabY = b.y - 34;
    var t0 = null, DUR = 480;
    function reachIn(ts){
      if(!t0) t0 = ts;
      var t = Math.min(1, (ts-t0)/DUR);
      var e = 1-Math.pow(1-t,3);
      mitt.style.transform = "translate("+(startX+(grabX-startX)*e)+"px,"+(startY+(grabY-startY)*e)+"px)";
      if(t<1){ requestAnimationFrame(reachIn); }
      else {
        mitt.querySelector(".cartfx-held").style.visibility = "visible";
        mitt.style.transition = "transform .12s";
        mitt.style.transform = "translate("+grabX+"px,"+grabY+"px) scale(1.15)";
        setTimeout(function(){
          mitt.style.transition = "";
          var t1 = null, DUR2 = 750;
          var midX = (grabX+cartC.x)/2, midY = Math.min(grabY, cartC.y) - 130;
          function carry(ts2){
            if(!t1) t1 = ts2;
            var t2 = Math.min(1, (ts2-t1)/DUR2), u = 1-t2;
            var x2 = u*u*grabX + 2*u*t2*midX + t2*t2*(cartC.x-18);
            var y2 = u*u*grabY + 2*u*t2*midY + t2*t2*(cartC.y-52);
            mitt.style.transform = "translate("+x2+"px,"+y2+"px)";
            if(t2<1){ requestAnimationFrame(carry); }
            else {
              mitt.querySelector(".cartfx-held").style.visibility = "hidden";
              arcFly(run, cartC.x, cartC.y-40, cartC.x, cartC.y, 200, {arc:10}, function(){ run.land(true); });
              var t3 = null, DUR3 = 450;
              function retreat(ts3){
                if(!t3) t3 = ts3;
                var tt = Math.min(1, (ts3-t3)/DUR3);
                mitt.style.transform = "translate("+((cartC.x-18)+(startX-(cartC.x-18))*tt)+"px,"+(cartC.y-52)+"px)";
                mitt.style.opacity = String(1-tt*0.5);
                if(tt<1){ requestAnimationFrame(retreat); }
                else { run.finish(); }
              }
              requestAnimationFrame(retreat);
            }
          }
          requestAnimationFrame(carry);
        }, 150);
      }
    }
    requestAnimationFrame(reachIn);
  }

  var RUNNERS = {chef: runChef, belt: runBelt, scooter: runScooter, mitt: runMitt};

  function play(sourceEl, opts){
    opts = opts || {};
    ensureCss();
    var target = opts.target
      || document.querySelector(".floating-cart-btn")
      || document.querySelector("#cart");
    if(!sourceEl || !target) { if(opts.onLand) opts.onLand(); return; }
    if(sourceEl.dataset.cartfxBusy) return;
    sourceEl.dataset.cartfxBusy = "1";
    var releaseBusy = function(){ delete sourceEl.dataset.cartfxBusy; };
    if(reduceMotion() || document.visibilityState === "hidden"){
      if(opts.onLand) opts.onLand();
      releaseBusy();
      return;
    }
    var variant = opts.variant && RUNNERS[opts.variant]
      ? opts.variant
      : VARIANTS[Math.floor(Math.random()*VARIANTS.length)];
    var run = makeRun(target, opts.onLand, releaseBusy);
    RUNNERS[variant](sourceEl, target, run);
  }

  return { play: play, variants: VARIANTS.slice() };
})();
