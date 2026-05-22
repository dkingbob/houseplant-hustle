// ══════════════════════════════════════════════════
// GRAIN — animated texture, 12fps
// ══════════════════════════════════════════════════
(function(){
  const c=document.getElementById('grain'),x=c.getContext('2d');
  let W,H,last=0;
  function rs(){c.width=W=innerWidth;c.height=H=innerHeight}
  function frame(t){
    requestAnimationFrame(frame);
    if(t-last<80)return;last=t;
    const d=x.createImageData(W,H),b=d.data;
    for(let i=0;i<b.length;i+=4){const v=Math.random()*255|0;b[i]=b[i+1]=b[i+2]=v;b[i+3]=28}
    x.putImageData(d,0,0);
  }
  rs();requestAnimationFrame(frame);
  addEventListener('resize',rs);
})();

// ══════════════════════════════════════════════════
// CURSOR
// ══════════════════════════════════════════════════
(function(){
  const dot=document.getElementById('c-dot'),ring=document.getElementById('c-ring');
  let mx=0,my=0,rx=0,ry=0;
  addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';
  });
  (function tick(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(tick)})();
  document.querySelectorAll('a,button,input,label,.suc-chip,.bcard,.feat,.stat-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
  });
  // Cursor trail particles
  let lastTrail=0;
  addEventListener('mousemove',e=>{
    const now=Date.now();if(now-lastTrail<55)return;lastTrail=now;
    const p=document.createElement('span');
    p.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:3px;height:3px;border-radius:50%;background:var(--orange);pointer-events:none;z-index:9990;transform:translate(-50%,-50%);opacity:.55;transition:opacity .6s,transform .6s`;
    document.body.appendChild(p);
    requestAnimationFrame(()=>{p.style.opacity='0';p.style.transform='translate(-50%,-50%) scale(0)'});
    setTimeout(()=>p.remove(),650);
  });
})();

// ══════════════════════════════════════════════════
// HERO CANVAS — organic pollen / spore particles
// ══════════════════════════════════════════════════
(function(){
  const cv=document.getElementById('hero-canvas'),ctx=cv.getContext('2d');
  let W,H,pts=[],mx=innerWidth/2,my=innerHeight/2;

  function rs(){W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight;mk()}

  function mk(){
    pts=[];
    const count=Math.floor(W*H/7000);
    for(let i=0;i<count;i++){
      // Random spore type: 0=round pollen, 1=elongated spore, 2=tiny dust
      const type=Math.random()<.55?0:Math.random()<.65?1:2;
      pts.push({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.14-0.04,
        r: type===0?(Math.random()*3+2) : type===1?(Math.random()*1.5+.8) : (Math.random()*.7+.3),
        ar: type===1?(Math.random()*2.5+1.5):1, // aspect ratio for spores
        rot: Math.random()*Math.PI*2,
        spin: (Math.random()-.5)*.018,
        a: type===2?(Math.random()*.12+.04):(Math.random()*.22+.06),
        glow: type===0 && Math.random()<.35, // some pollen glow
        hue: Math.random()<.75?'88,240,102':'224,120,48', // mostly green, some orange
        wobble: Math.random()*Math.PI*2,
        wobbleSpeed: .008+Math.random()*.012,
        type
      });
    }
  }

  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});

  function draw(){
    ctx.clearRect(0,0,W,H);
    const ox=(mx/W-.5)*18,oy=(my/H-.5)*10;

    for(let i=0;i<pts.length;i++){
      const p=pts[i];
      // Mouse proximity repulsion
      const dx=p.x-mx,dy=p.y-my,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<160){
        const force=(160-dist)/160;
        p.vx+=dx/dist*force*.22;
        p.vy+=dy/dist*force*.22;
      }
      // Velocity damping + drift
      p.vx*=.985;p.vy*=.985;
      p.wobble+=p.wobbleSpeed;
      p.x+=p.vx+Math.sin(p.wobble)*.12;
      p.y+=p.vy+Math.cos(p.wobble*.7)*.08;
      p.rot+=p.spin;

      // Wrap
      if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;
      if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20;

      const px=p.x+ox,py=p.y+oy;

      ctx.save();
      ctx.translate(px,py);
      ctx.rotate(p.rot);

      if(p.type===0){
        // Round pollen — soft radial glow
        if(p.glow){
          const g=ctx.createRadialGradient(0,0,0,0,0,p.r*3.5);
          g.addColorStop(0,`rgba(${p.hue},${p.a*.9})`);
          g.addColorStop(.5,`rgba(${p.hue},${p.a*.3})`);
          g.addColorStop(1,`rgba(${p.hue},0)`);
          ctx.beginPath();ctx.arc(0,0,p.r*3.5,0,6.28);
          ctx.fillStyle=g;ctx.fill();
        }
        ctx.beginPath();ctx.arc(0,0,p.r,0,6.28);
        ctx.fillStyle=`rgba(${p.hue},${p.a})`;ctx.fill();
      } else if(p.type===1){
        // Elongated spore — oval
        ctx.beginPath();
        ctx.ellipse(0,0,p.r*p.ar,p.r,0,0,6.28);
        ctx.fillStyle=`rgba(${p.hue},${p.a})`;ctx.fill();
      } else {
        // Tiny dust mote
        ctx.beginPath();ctx.arc(0,0,p.r,0,6.28);
        ctx.fillStyle=`rgba(${p.hue},${p.a})`;ctx.fill();
      }
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }
  rs();draw();addEventListener('resize',rs);
})();

// ══════════════════════════════════════════════════
// SCRUB CANVAS — persistent plant layer
// ══════════════════════════════════════════════════
(function(){
  const cv=document.getElementById('plant-cv');
  const ctx=cv.getContext('2d',{alpha:true});
  window.plantCtx=ctx;
  let W,H;
  Object.assign(cv.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'3',opacity:'0',transition:'opacity .6s ease'});

  function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight}

  // opts: { ambient, pctX, pctY, scale, alpha, targetCtx, targetW, targetH }
  window.drawPlant=function(p, opts){
    const o=Object.assign({ambient:false,pctX:.5,pctY:.5,scale:1,alpha:1},opts||{});
    const c=o.targetCtx||ctx;
    const dW=o.targetW||W, dH=o.targetH||H;
    const pm=(window._PLANT_MODES&&window._PLANT_MODES[window._plantMode||'standard'])||window._PLANT_MODES&&window._PLANT_MODES.standard||{stem0:'rgba(32,80,38,.9)',stemT:'rgba(70,200,80,.95)',l0:'rgba(35,95,42,',l1:'rgba(55,155,62,',l2:'rgba(75,200,85,',root:'rgba(88,240,102,',wire:false};
    c.clearRect(0,0,dW,dH);
    if(p<=0||(p>=1&&!o.ambient))return;
    if(o.alpha<=0)return;

    c.save();
    c.globalAlpha=o.alpha;

    const cx=dW*o.pctX;
    const base=o.ambient ? dH*o.pctY : dH*.82;
    const maxH=dH*.62*o.scale;
    const stemH=maxH*Math.min(1,p*1.4);

    // Background only in live scrub (not pre-rendering to offscreen, not ambient)
    if(!o.ambient&&!o.targetCtx){
      const vg=c.createRadialGradient(cx,dH*.6,0,cx,dH*.6,Math.max(dW,dH)*.7);
      vg.addColorStop(0,`rgba(17,31,19,${.7*p})`);
      vg.addColorStop(1,'rgba(7,14,8,.98)');
      c.fillStyle=vg;c.fillRect(0,0,dW,dH);
    }

    // ── Roots ──
    if(p>.04){
      const rp=Math.min(1,(p-.04)/.3);
      c.save();c.globalAlpha=o.alpha*(o.ambient?.2:.35)*rp;
      for(let r=0;r<7;r++){
        const ang=Math.PI*(r/6)+Math.PI*.05;
        const len=(50+r*12)*rp*o.scale;
        const cp1x=cx+Math.cos(ang)*len*.3,cp1y=base+Math.sin(ang)*len*.2;
        const ex=cx+Math.cos(ang)*len,ey=base+Math.sin(ang)*len*.6;
        c.beginPath();c.moveTo(cx,base);
        c.quadraticCurveTo(cp1x,cp1y,ex,ey);
        c.strokeStyle=pm.root+'.62)';c.lineWidth=o.scale;c.lineCap='round';c.stroke();
        c.beginPath();c.arc(ex,ey,2*rp*o.scale,0,6.28);c.fillStyle=pm.root+'.62)';c.fill();
      }
      c.restore();
    }

    // ── Soil line ──
    if(!o.ambient&&!o.targetCtx){
      const soilY=base+4;
      const sg=c.createLinearGradient(cx-120,soilY,cx+120,soilY);
      sg.addColorStop(0,'rgba(60,40,20,0)');sg.addColorStop(.5,`rgba(90,60,30,${Math.min(1,p*3)*.4})`);sg.addColorStop(1,'rgba(60,40,20,0)');
      c.fillStyle=sg;c.fillRect(cx-200,soilY,400,8);
    }

    // ── Stem ──
    if(stemH>0){
      const stemTop=base-stemH;
      const wave=Math.sin(p*Math.PI*1.5)*.5;
      c.beginPath();c.moveTo(cx,base);
      const segs=12;
      for(let i=1;i<=segs;i++){
        const t=i/segs;
        const sx=cx+Math.sin(t*Math.PI*2+wave)*14*(1-t)*p*o.scale;
        const sy=base-stemH*t;
        c.lineTo(sx,sy);
      }
      if(!pm.wire){
        const stg=c.createLinearGradient(cx,base,cx,stemTop);
        stg.addColorStop(0,pm.stem0);stg.addColorStop(1,pm.stemT);
        c.strokeStyle=stg;c.lineWidth=(4+p*5)*o.scale;
      } else {c.strokeStyle=pm.stemT;c.lineWidth=1.8*o.scale;}
      c.lineCap='round';c.lineJoin='round';c.stroke();
    }

    // ── Leaves ──
    if(p>.12){
      const lp=(p-.12)/.88;
      const maxLeaves=6;
      for(let i=0;i<maxLeaves;i++){
        const threshold=i/maxLeaves;
        if(lp<threshold)continue;
        const lf=Math.min(1,(lp-threshold)*maxLeaves);
        const lt=.15+(i/maxLeaves)*.75;
        const stemX=cx+Math.sin(lt*Math.PI*2)*14*(1-lt)*p*o.scale;
        const stemY=base-stemH*lt;
        const side=i%2===0?1:-1;
        const leafSz=(35+i*18)*lf*o.scale;
        const angle=side*(Math.PI*.32+lt*.15);
        c.save();c.translate(stemX,stemY);c.rotate(angle);
        c.beginPath();
        c.moveTo(0,0);
        c.bezierCurveTo(side*leafSz*.6,-leafSz*.25,side*leafSz*.9,-leafSz*.55,side*leafSz*.5,-leafSz*.9);
        c.bezierCurveTo(side*leafSz*.8,-leafSz*1.1,side*leafSz*1.05,-leafSz*.85,side*leafSz,-leafSz*.5);
        c.bezierCurveTo(side*leafSz*.75,-leafSz*.25,side*leafSz*.4,-leafSz*.05,0,0);
        const leafAlpha=.5+lf*.4;
        const g=c.createLinearGradient(0,0,side*leafSz,-leafSz);
        g.addColorStop(0,pm.l0+leafAlpha+')');
        g.addColorStop(.5,pm.l1+leafAlpha+')');
        g.addColorStop(1,pm.l2+(leafAlpha*.8)+')');
        if(!pm.wire){c.fillStyle=g;c.fill();}
        else{c.strokeStyle=pm.l0+'.55)';c.lineWidth=.85*o.scale;c.stroke();}
        c.beginPath();c.moveTo(0,0);c.lineTo(side*leafSz*.5,-leafSz*.88);
        c.strokeStyle=pm.l2+(lf*.35)+')';c.lineWidth=.8*o.scale;c.stroke();
        c.restore();
      }
    }

    c.restore();
  };

  // Ambient animation loop — draws the plant in non-scrub sections
  let ambT=0;
  window._plantScrubMode=false;
  window._plantAmbient=null;
  window._plantMode='standard';
  window._PLANT_MODES={
    standard:{stem0:'rgba(32,80,38,.9)',stemT:'rgba(70,200,80,.95)',l0:'rgba(35,95,42,',l1:'rgba(55,155,62,',l2:'rgba(75,200,85,',root:'rgba(88,240,102,',wire:false},
    thermal: {stem0:'rgba(165,42,5,.9)',stemT:'rgba(255,150,0,.9)',l0:'rgba(205,55,15,',l1:'rgba(245,112,0,',l2:'rgba(255,198,60,',root:'rgba(255,100,0,',wire:false},
    xray:    {stem0:'rgba(175,210,255,.75)',stemT:'rgba(232,248,255,.9)',l0:'rgba(165,208,255,',l1:'rgba(205,232,255,',l2:'rgba(238,250,255,',root:'rgba(150,200,255,',wire:false},
    wireframe:{stem0:'rgba(88,240,102,.55)',stemT:'rgba(88,240,102,.82)',l0:'rgba(88,240,102,',l1:'rgba(88,240,102,',l2:'rgba(120,255,130,',root:'rgba(88,240,102,',wire:true},
  };
  (function ambLoop(){
    ambT+=.007;
    if(window._plantAmbient&&!window._plantScrubMode){
      const a=window._plantAmbient;
      if(a.alpha>0){
        cv.style.opacity='1';
        const p=0.62+Math.sin(ambT)*.09;
        window.drawPlant(p,{ambient:true,pctX:a.pctX,pctY:a.pctY,scale:a.scale,alpha:a.alpha});
      } else {
        cv.style.opacity='0';
      }
    } else if(!window._plantScrubMode){
      cv.style.opacity='0';
    }
    requestAnimationFrame(ambLoop);
  })();

  rs();addEventListener('resize',rs);
})();

// ══════════════════════════════════════════════════
// SKETCH LAYER SYSTEM — drafting table concept art
// Behind the plant: 3 offset semi-transparent pencil sketches.
// Hover proximity: fuses to green + glow.
// GROUP 4: apply same effect to the .glb 3D plant viewer when added.
// ══════════════════════════════════════════════════
(function(){
  const configs=[
    {id:'sk0',offX:-28,offY:18, scale:.94,alpha:.085,seed:31},
    {id:'sk1',offX:22, offY:-24,scale:.97,alpha:.065,seed:77},
    {id:'sk2',offX:9,  offY:36, scale:.89,alpha:.052,seed:19},
  ];

  // Create canvas elements behind plant canvas (z:2)
  const skCvs=configs.map(cfg=>{
    const cv=document.createElement('canvas');
    cv.id=cfg.id;cv.className='sketch-cv';
    cv._cfg=cfg;cv._shown=false;
    document.body.appendChild(cv);
    return cv;
  });
  window._sketchCvs=skCvs;

  function drawSketch(cv){
    const cfg=cv._cfg;
    const W=cv.width=innerWidth, H=cv.height=innerHeight;
    const ctx=cv.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const CX=W*.5+cfg.offX, BASE=H*.82+cfg.offY, MAXH=H*.62*cfg.scale;
    const A=cfg.alpha;
    let s=cfg.seed;
    function jr(mag){s=((s*1664525)+1013904223)>>>0;return((s/0xffffffff)-.5)*2*mag;}
    ctx.lineCap='round';ctx.lineJoin='round';

    // ── Stem (3 rough passes) ──
    for(let pass=0;pass<3;pass++){
      ctx.beginPath();ctx.moveTo(CX+jr(5),BASE);
      for(let i=1;i<=16;i++){
        const t=i/16;
        ctx.lineTo(CX+Math.sin(t*Math.PI*2)*13*(1-t)+jr(8),BASE-MAXH*t+jr(5));
      }
      ctx.strokeStyle=`rgba(162,120,68,${A*.88})`;
      ctx.lineWidth=.6+(s&3)*.18;ctx.stroke();
    }

    // ── Leaves (rough bezier outlines, 2 passes each) ──
    for(let i=0;i<6;i++){
      const lt=.15+(i/6)*.73;
      const sX=CX+Math.sin(lt*Math.PI*2)*13*(1-lt), sY=BASE-MAXH*lt;
      const side=i%2===0?1:-1, sz=(24+i*14)*cfg.scale;
      const ang=side*(Math.PI*.32+lt*.14);
      ctx.save();ctx.translate(sX+jr(8),sY+jr(8));ctx.rotate(ang+jr(.09));
      for(let pass=0;pass<2;pass++){
        ctx.beginPath();ctx.moveTo(jr(3),jr(3));
        ctx.bezierCurveTo(side*sz*.6+jr(8),-sz*.26+jr(7),side*sz*.9+jr(7),-sz*.56+jr(7),side*sz*.5+jr(6),-sz*.9+jr(6));
        ctx.bezierCurveTo(side*sz*.82+jr(7),-sz*1.1+jr(6),side*sz*1.04+jr(6),-sz*.84+jr(6),side*sz+jr(5),-sz*.5+jr(5));
        ctx.bezierCurveTo(side*sz*.74+jr(5),-sz*.24+jr(5),side*sz*.38+jr(4),jr(4),jr(3),jr(3));
        ctx.strokeStyle=`rgba(162,120,68,${A*.62})`;
        ctx.lineWidth=.5+(s&3)*.13;ctx.stroke();
      }
      // Midrib
      ctx.beginPath();ctx.moveTo(jr(2),jr(2));ctx.lineTo(side*sz*.5+jr(3),-sz*.86+jr(3));
      ctx.strokeStyle=`rgba(162,120,68,${A*.42})`;ctx.lineWidth=.32;ctx.stroke();
      // Hatching on every 3rd leaf for texture
      if(i%3===0){
        for(let h=1;h<5;h++){
          const ht=h/6;
          ctx.beginPath();ctx.moveTo(jr(2),-sz*ht+jr(2));ctx.lineTo(side*sz*(.3+ht*.5)+jr(4),-sz*ht*1.05+jr(4));
          ctx.strokeStyle=`rgba(162,120,68,${A*.26})`;ctx.lineWidth=.28;ctx.stroke();
        }
      }
      ctx.restore();
    }

    // ── Pot outline ──
    const pW=36*cfg.scale, pH=52*cfg.scale;
    ctx.beginPath();
    ctx.moveTo(CX-pW+jr(5),BASE+jr(3));
    ctx.bezierCurveTo(CX-pW*1.2+jr(5),BASE+pH*.5+jr(4),CX-pW*.8+jr(4),BASE+pH*.9+jr(4),CX-pW*.65+jr(4),BASE+pH+jr(3));
    ctx.lineTo(CX+pW*.65+jr(4),BASE+pH+jr(3));
    ctx.bezierCurveTo(CX+pW*.8+jr(4),BASE+pH*.9+jr(4),CX+pW*1.2+jr(5),BASE+pH*.5+jr(4),CX+pW+jr(5),BASE+jr(3));
    ctx.strokeStyle=`rgba(162,120,68,${A*.55})`;ctx.lineWidth=.82;ctx.stroke();
    // Rim ellipse
    ctx.beginPath();ctx.ellipse(CX+jr(4),BASE+jr(3),pW+jr(3),7*cfg.scale+jr(2),jr(.04),0,Math.PI*2);
    ctx.strokeStyle=`rgba(162,120,68,${A*.38})`;ctx.lineWidth=.55;ctx.stroke();

    // ── Dimension annotations (first sketch only — drafting table feel) ──
    if(cfg.id==='sk0'){
      ctx.setLineDash([3,6]);ctx.lineWidth=.42;
      ctx.strokeStyle=`rgba(162,120,68,${A*.36})`;
      // Vertical height dimension
      ctx.beginPath();ctx.moveTo(CX+94,BASE-MAXH+jr(4));ctx.lineTo(CX+94,BASE+jr(4));ctx.stroke();
      ctx.beginPath();ctx.moveTo(CX+88,BASE-MAXH+jr(4));ctx.lineTo(CX+66,BASE-MAXH+jr(4));ctx.stroke();
      ctx.beginPath();ctx.moveTo(CX+88,BASE+jr(4));ctx.lineTo(CX+66,BASE+jr(4));ctx.stroke();
      // Horizontal callout
      ctx.beginPath();ctx.moveTo(CX-82,H*.34+jr(3));ctx.lineTo(CX-56,H*.34+jr(3));ctx.stroke();
      ctx.setLineDash([]);
      ctx.font=`italic 8px "DM Mono",monospace`;
      ctx.fillStyle=`rgba(162,120,68,${A*.4})`;
      ctx.fillText('h max',CX+98,BASE-MAXH*.5);
      ctx.fillText('Ø stem',CX-116,H*.343);
    }
  }

  // Draw all sketches initially
  skCvs.forEach(drawSketch);
  // Redraw on resize
  addEventListener('resize',()=>{clearTimeout(window._skRT);window._skRT=setTimeout(()=>skCvs.forEach(drawSketch),220);});

  // ── Hover: mouse proximity → fuse to green + glow ──
  let _hov=false;
  document.addEventListener('mousemove',e=>{
    if(!window._plantScrubMode)return;
    const dist=Math.hypot(e.clientX-innerWidth*.5,e.clientY-innerHeight*.5);
    const near=dist<Math.min(innerWidth,innerHeight)*.38;
    if(near===_hov)return;
    _hov=near;
    skCvs.forEach((cv,i)=>{
      if(near){
        cv.classList.add('sk-glow');
        gsap.to(cv,{y:-(5+i*3),duration:.65,ease:'power2.out'});
      } else {
        cv.classList.remove('sk-glow');
        gsap.to(cv,{y:0,duration:1.1,ease:'elastic.out(1,.38)'});
      }
    });
  });
})();

// Pre-render 120 plant frames at 65% resolution for frame-perfect scrub
function preRenderPlantFrames(){
  const FRAMES=120;
  const RW=Math.round(innerWidth*.65);
  const RH=Math.round(innerHeight*.65);
  window._plantFrames=[];
  let i=0;
  function batch(){
    const end=Math.min(i+10,FRAMES);
    while(i<end){
      const p=(i+1)/FRAMES;
      const offCv=document.createElement('canvas');
      offCv.width=RW;offCv.height=RH;
      const offCtx=offCv.getContext('2d',{alpha:true});
      window.drawPlant(p,{targetCtx:offCtx,targetW:RW,targetH:RH,ambient:false,pctX:.5,pctY:.82,scale:1,alpha:1});
      window._plantFrames.push(offCv);
      i++;
    }
    if(i<FRAMES)requestAnimationFrame(batch);
  }
  requestAnimationFrame(batch);
  // Invalidate on resize so frames match new viewport
  addEventListener('resize',function onR(){
    removeEventListener('resize',onR);
    window._plantFrames=null;
    setTimeout(preRenderPlantFrames,220);
  });
}

// ══════════════════════════════════════════════════
// AI CANVAS — neural node network
// ══════════════════════════════════════════════════
(function(){
  const cv=document.getElementById('ai-cv'),ctx=cv.getContext('2d');
  let W,H,nodes=[],t=0;
  function rs(){W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight;mk()}
  function mk(){
    nodes=[];
    for(let i=0;i<22;i++)
      nodes.push({ox:Math.random()*W,oy:Math.random()*H,x:0,y:0,r:Math.random()*3.5+1.5,ph:Math.random()*6.28,sp:Math.random()*.016+.007,amp:Math.random()*20+8});
  }
  function draw(){
    ctx.clearRect(0,0,W,H);t+=.016;
    nodes.forEach(n=>{n.x=n.ox+Math.sin(t*n.sp+n.ph)*n.amp;n.y=n.oy+Math.cos(t*n.sp*.72+n.ph)*n.amp});
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<155){const al=(1-d/155)*.25,pu=(Math.sin(t*1.8+i*.5)+1)*.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(88,240,102,${al*(0.45+pu*.55)})`;ctx.lineWidth=.7;ctx.stroke()}
    }
    nodes.forEach((n,i)=>{
      const pu=(Math.sin(t*1.8+i*.7)+1)*.5;
      const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*7);
      g.addColorStop(0,`rgba(88,240,102,${.14*pu})`);g.addColorStop(1,'rgba(88,240,102,0)');
      ctx.beginPath();ctx.arc(n.x,n.y,n.r*7,0,6.28);ctx.fillStyle=g;ctx.fill();
      ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,6.28);
      ctx.fillStyle=`rgba(88,240,102,${.55+pu*.45})`;ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  rs();draw();addEventListener('resize',rs);
})();

// ══════════════════════════════════════════════════
// BLUEPRINT — holographic schematic drawing engine
// ══════════════════════════════════════════════════
function drawBlueprint(c,W,H,sY,t){
  c.clearRect(0,0,W,H);
  c.fillStyle='#020c18';c.fillRect(0,0,W,H);

  // ── Minor grid ──
  c.save();c.strokeStyle='rgba(0,150,210,.028)';c.lineWidth=.4;
  for(let x=0;x<W;x+=24){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
  for(let y=0;y<H;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  // ── Major grid ──
  c.strokeStyle='rgba(0,170,220,.055)';c.lineWidth=.6;
  for(let x=0;x<W;x+=120){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
  for(let y=0;y<H;y+=120){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  c.restore();

  // ── Corner brackets ──
  const bL=52;
  [[24,24,1,1],[W-24,24,-1,1],[24,H-24,1,-1],[W-24,H-24,-1,-1]].forEach(([x,y,sx,sy])=>{
    c.strokeStyle='rgba(0,220,255,.38)';c.lineWidth=1.4;
    c.beginPath();c.moveTo(x+sx*bL,y);c.lineTo(x,y);c.lineTo(x,y+sy*bL);c.stroke();
    // Small corner dot
    c.beginPath();c.arc(x,y,2.5,0,6.28);c.fillStyle='rgba(0,220,255,.5)';c.fill();
  });

  const cx=W*.5,base=H*.78,maxH=H*.55,stemTop=base-maxH;
  const rev=(py)=>sY>=py;
  const fade=(py,span=60)=>Math.min(1,Math.max(0,(sY-py)/span));

  // ── Centerline ──
  c.save();c.globalAlpha=rev(base-maxH*.2)?fade(base-maxH*.2)*.25:.0;
  c.strokeStyle='rgba(0,220,255,.18)';c.lineWidth=.6;c.setLineDash([6,10]);
  c.beginPath();c.moveTo(cx,base+10);c.lineTo(cx,stemTop-28);c.stroke();
  c.setLineDash([]);c.restore();

  // ── Roots ──
  c.save();c.strokeStyle='rgba(0,200,255,.55)';c.lineWidth=.7;c.setLineDash([3,5]);c.lineCap='round';
  for(let r=0;r<7;r++){
    const ang=Math.PI*(r/6)+Math.PI*.05,len=46+r*9;
    const ex=cx+Math.cos(ang)*len,ey=base+Math.sin(ang)*len*.55;
    if(rev(ey)){
      c.globalAlpha=fade(ey);
      c.beginPath();c.moveTo(cx,base);c.quadraticCurveTo(cx+Math.cos(ang)*len*.3,base+Math.sin(ang)*len*.22,ex,ey);c.stroke();
      c.setLineDash([]);c.beginPath();c.arc(ex,ey,2.5,0,6.28);c.strokeStyle='rgba(0,220,255,.6)';c.stroke();c.setLineDash([3,5]);
    }
  }
  c.restore();

  // ── Soil line ──
  if(rev(base+5)){
    const a=fade(base+5);
    c.strokeStyle=`rgba(0,200,255,${.3*a})`;c.lineWidth=.8;c.setLineDash([10,5]);
    c.beginPath();c.moveTo(cx-200,base+8);c.lineTo(cx+200,base+8);c.stroke();c.setLineDash([]);
    c.font='300 9px "DM Mono",monospace';c.fillStyle=`rgba(0,220,255,${.5*a})`;
    c.fillText('─── SOIL INTERFACE / Y:0.000 ───',cx-140,base+22);
  }

  // ── Stem ──
  c.beginPath();c.moveTo(cx,base);
  for(let i=1;i<=18;i++){const tt=i/18;c.lineTo(cx+Math.sin(tt*Math.PI*2)*7*(1-tt),base-maxH*tt)}
  const stemReveal=rev(stemTop)?1:rev(base)?fade(base,maxH):0;
  c.save();c.globalAlpha=stemReveal*.92;
  c.strokeStyle='rgba(0,220,255,.82)';c.lineWidth=1.4;c.lineCap='round';c.lineJoin='round';c.stroke();
  c.restore();

  // ── Leaves ──
  for(let i=0;i<6;i++){
    const lt=.15+(i/6)*.75;
    const sX=cx+Math.sin(lt*Math.PI*2)*7*(1-lt),sY2=base-maxH*lt;
    const side=i%2===0?1:-1,sz=27+i*14;
    const ang=side*(Math.PI*.32+lt*.14);
    if(!rev(sY2))continue;
    const la=fade(sY2);
    const pulse=(Math.sin(t*1.8+i*.9)+1)*.5;
    c.save();c.translate(sX,sY2);c.rotate(ang);c.globalAlpha=la;
    c.strokeStyle='rgba(0,220,255,.72)';c.lineWidth=.9;
    c.beginPath();c.moveTo(0,0);
    c.bezierCurveTo(side*sz*.6,-sz*.25,side*sz*.9,-sz*.55,side*sz*.5,-sz*.9);
    c.bezierCurveTo(side*sz*.8,-sz*1.1,side*sz*1.05,-sz*.85,side*sz,-sz*.5);
    c.bezierCurveTo(side*sz*.75,-sz*.25,side*sz*.4,-sz*.05,0,0);
    c.stroke();
    // Midrib
    c.strokeStyle='rgba(0,220,255,.28)';c.lineWidth=.5;
    c.beginPath();c.moveTo(0,0);c.lineTo(side*sz*.5,-sz*.87);c.stroke();
    // Vein lines
    for(let v=1;v<=3;v++){
      const vt=v*.22;
      const vx=side*sz*vt*.9,vy=-sz*vt*.88;
      c.strokeStyle='rgba(0,220,255,.12)';c.lineWidth=.4;
      c.beginPath();c.moveTo(vx,vy);c.lineTo(vx+side*sz*.14,vy-sz*.12);c.stroke();
    }
    c.restore();
    // Node marker
    const nr=3.5,np=4+pulse*4.5;
    c.beginPath();c.arc(sX,sY2,nr,0,6.28);
    c.strokeStyle=`rgba(0,220,255,${.85*la})`;c.lineWidth=1;c.stroke();
    c.beginPath();c.arc(sX,sY2,np,0,6.28);
    c.strokeStyle=`rgba(0,220,255,${.2*pulse*la})`;c.lineWidth=.8;c.stroke();
    c.beginPath();c.arc(sX,sY2,1.5,0,6.28);c.fillStyle=`rgba(0,220,255,${.9*la})`;c.fill();
  }

  // ── Apex marker ──
  if(rev(stemTop+10)){
    const a=fade(stemTop+10);const pulse=(Math.sin(t*2.4)+1)*.5;
    c.beginPath();c.arc(cx,stemTop,5,0,6.28);c.strokeStyle=`rgba(0,220,255,${.9*a})`;c.lineWidth=1.2;c.stroke();
    c.beginPath();c.arc(cx,stemTop,9+pulse*6,0,6.28);c.strokeStyle=`rgba(0,220,255,${.22*pulse*a})`;c.lineWidth=.8;c.stroke();
    c.font='300 9px "DM Mono",monospace';c.fillStyle=`rgba(0,220,255,${.5*a})`;
    c.textAlign='center';c.fillText('APEX',cx,stemTop-18);c.textAlign='left';
  }

  // ── Height dimension (right) ──
  if(rev(stemTop)){
    const a=fade(stemTop);const dx=cx+Math.min(W*.38,140);
    c.strokeStyle=`rgba(0,200,255,${.38*a})`;c.lineWidth=.7;
    c.beginPath();c.moveTo(dx,base);c.lineTo(dx,stemTop);c.stroke();
    [[dx,base,1],[dx,stemTop,-1]].forEach(([x,y,d])=>{
      c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y-d*9);c.moveTo(x,y);c.lineTo(x+5,y-d*9);c.stroke();
    });
    c.save();c.translate(dx+14,(base+stemTop)*.5);c.rotate(Math.PI/2);
    c.font='300 9px "DM Mono",monospace';c.fillStyle=`rgba(0,220,255,${.52*a})`;c.textAlign='center';
    c.fillText('248 mm',0,0);c.textAlign='left';c.restore();
    c.strokeStyle=`rgba(0,200,255,${.2*a})`;c.lineWidth=.5;c.setLineDash([4,6]);
    c.beginPath();c.moveTo(cx,base);c.lineTo(dx,base);
    c.moveTo(cx,stemTop);c.lineTo(dx,stemTop);c.stroke();c.setLineDash([]);
  }

  // ── Width dimension (top) ──
  if(rev(stemTop+30)){
    const a=fade(stemTop+30);
    const rx=cx+28+6*14,lx=cx-28-6*14,dy=stemTop-36;
    c.strokeStyle=`rgba(0,200,255,${.32*a})`;c.lineWidth=.7;
    c.beginPath();c.moveTo(lx,dy);c.lineTo(rx,dy);c.stroke();
    [[lx,dy,-1],[rx,dy,1]].forEach(([x,y,d])=>{
      c.beginPath();c.moveTo(x,y);c.lineTo(x+d*9,y-5);c.moveTo(x,y);c.lineTo(x+d*9,y+5);c.stroke();
    });
    c.font='300 9px "DM Mono",monospace';c.fillStyle=`rgba(0,220,255,${.5*a})`;
    c.textAlign='center';c.fillText('142 mm',cx,dy-10);c.textAlign='left';
  }

  // ── Data annotations ──
  const anns=[
    {x:cx+90, y:base-maxH*.6, lx:cx+32, ly:base-maxH*.6,  txt:'STEM Ø 14.3mm',  at:base-maxH*.55},
    {x:cx+90, y:base-maxH*.35,lx:cx+28, ly:base-maxH*.35, txt:'NODE ANGLE 32°',  at:base-maxH*.3},
    {x:cx-130,y:base-maxH*.72,lx:cx-26, ly:base-maxH*.72, txt:'APEX +0.24mm/h',  at:base-maxH*.68},
    {x:cx-130,y:base+35,      lx:cx-45, ly:base+20,        txt:'ROOT Δ 89mm',    at:base+30},
    {x:cx+90, y:base-maxH*.85,lx:cx+18, ly:base-maxH*.85, txt:'CHLOROPHYLL 98.1%',at:base-maxH*.82},
  ];
  c.font='300 9.5px "DM Mono",monospace';
  anns.forEach(({x,y,lx,ly,txt,at})=>{
    if(!rev(at))return;
    const a=fade(at)*0.8;
    c.fillStyle=`rgba(0,220,255,${.44*a})`;c.fillText(txt,x,y);
    c.strokeStyle=`rgba(0,220,255,${.15*a})`;c.lineWidth=.5;c.setLineDash([2,4]);
    c.beginPath();c.moveTo(x-4,y-3);c.lineTo(lx,ly);c.stroke();c.setLineDash([]);
    c.beginPath();c.arc(lx,ly,2,0,6.28);c.fillStyle=`rgba(0,220,255,${.35*a})`;c.fill();
  });

  // ── Cross-hair markers (random structural points) ──
  [[cx,base-maxH*.22],[cx-18,base-maxH*.5],[cx+15,base-maxH*.72]].forEach(([px,py])=>{
    if(!rev(py))return;
    const a=fade(py)*.6;const hs=8;
    c.strokeStyle=`rgba(0,220,255,${.35*a})`;c.lineWidth=.6;
    c.beginPath();c.moveTo(px-hs,py);c.lineTo(px+hs,py);c.moveTo(px,py-hs);c.lineTo(px,py+hs);c.stroke();
    c.beginPath();c.arc(px,py,hs*.6,0,6.28);c.stroke();
  });

  // ── Coordinate label ──
  if(rev(H*.2)){
    c.font='300 8px "DM Mono",monospace';
    c.fillStyle=`rgba(0,220,255,${.18*fade(H*.2)})`;
    c.fillText(`X:${(cx/W*100).toFixed(1)}  Y:${((base/H)*100).toFixed(1)}  Z:0.000`,cx-80,H*.5);
  }

  // ── Scan glow ──
  if(sY>0&&sY<H){
    const sg=c.createLinearGradient(0,sY-60,0,sY+60);
    sg.addColorStop(0,'rgba(0,220,255,0)');
    sg.addColorStop(.5,'rgba(0,220,255,.07)');
    sg.addColorStop(1,'rgba(0,220,255,0)');
    c.fillStyle=sg;c.fillRect(0,sY-60,W,120);
  }

  // ── Perimeter hash marks ──
  c.save();c.strokeStyle='rgba(0,200,255,.14)';c.lineWidth=.5;
  for(let x=60;x<W-60;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,6);c.moveTo(x,H);c.lineTo(x,H-6);c.stroke()}
  for(let y=60;y<H-60;y+=60){c.beginPath();c.moveTo(0,y);c.lineTo(6,y);c.moveTo(W,y);c.lineTo(W-6,y);c.stroke()}
  c.restore();
}

function initBlueprint(loco){
  const bpWrap=document.getElementById('bp-wrap');
  const bpCv=document.getElementById('bp-cv');
  if(!bpCv||!bpWrap)return;
  const bpCtx=bpCv.getContext('2d');
  let bpW=0,bpH=0,scanY=0,bpT=0;
  function bpRs(){bpW=bpCv.width=innerWidth;bpH=bpCv.height=innerHeight}
  bpRs();addEventListener('resize',bpRs);
  (function bpLoop(){bpT+=.014;if(bpW)drawBlueprint(bpCtx,bpW,bpH,scanY,bpT);requestAnimationFrame(bpLoop)})();
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#bp-sec',start:'top top',end:'bottom bottom',scrub:1.8,
    onUpdate:(self)=>{
      scanY=self.progress*bpH;
      const b=document.getElementById('bp-bar');if(b)b.style.top=scanY+'px';
      loco.update();
    },
    onEnter:()=>bpWrap.classList.add('vis'),
    onLeave:()=>bpWrap.classList.remove('vis'),
    onEnterBack:()=>bpWrap.classList.add('vis'),
    onLeaveBack:()=>bpWrap.classList.remove('vis'),
  });
  (function bpClock(){
    const e=document.getElementById('bp-time');
    if(e){const n=new Date;e.textContent=`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`}
    setTimeout(bpClock,1000);
  })();
}

// ══════════════════════════════════════════════════
// STACK CARDS — five-mode plant renderings
// ══════════════════════════════════════════════════
window.addEventListener('load',function(){
  const PAL={
    sc0:{bg:'#060d07',stem:'rgba(32,80,38,.9)',stemT:'rgba(70,200,80,.95)',l0:'rgba(35,95,42,',l1:'rgba(55,155,62,',l2:'rgba(75,200,85,',glow:'rgba(88,240,102,',wire:false,grid:false,scan:false},
    sc1:{bg:'#0d0400',stem:'rgba(165,42,5,.9)',stemT:'rgba(255,150,0,.9)',l0:'rgba(205,55,15,',l1:'rgba(245,112,0,',l2:'rgba(255,198,60,',glow:'rgba(255,100,0,',wire:false,grid:false,scan:false},
    sc2:{bg:'#040710',stem:'rgba(175,210,255,.75)',stemT:'rgba(232,248,255,.9)',l0:'rgba(165,208,255,',l1:'rgba(205,232,255,',l2:'rgba(238,250,255,',glow:'rgba(150,200,255,',wire:false,grid:false,scan:false},
    sc3:{bg:'#050a06',stem:'rgba(88,240,102,.6)',stemT:'rgba(88,240,102,.85)',l0:'rgba(88,240,102,',l1:'rgba(88,240,102,',l2:'rgba(120,255,130,',glow:'rgba(88,240,102,',wire:true,grid:true,scan:false},
    sc4:{bg:'#020b12',stem:'rgba(0,195,255,.7)',stemT:'rgba(115,255,255,.9)',l0:'rgba(0,182,255,',l1:'rgba(48,218,255,',l2:'rgba(158,255,255,',glow:'rgba(0,200,255,',wire:false,grid:false,scan:true},
  };
  function drawCard(cv,p){
    const W=cv.width=480,H=cv.height=560;
    const c=cv.getContext('2d');
    c.fillStyle=p.bg;c.fillRect(0,0,W,H);
    if(p.grid){
      c.save();c.strokeStyle='rgba(88,240,102,.04)';c.lineWidth=.5;
      for(let x=0;x<W;x+=38){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
      for(let y=0;y<H;y+=38){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
      c.restore();
    }
    if(p.scan){
      c.save();c.globalAlpha=.10;
      for(let y=0;y<H;y+=3){c.fillStyle='rgba(0,0,0,1)';c.fillRect(0,y,W,1.4)}
      c.restore();
    }
    const cx=W*.5,base=H*.79,maxH=H*.57,stemTop=base-maxH;
    const gl=c.createRadialGradient(cx,base+18,0,cx,base+18,W*.42);
    gl.addColorStop(0,p.glow+'.11)');gl.addColorStop(1,p.glow+'0)');
    c.fillStyle=gl;c.fillRect(0,0,W,H);
    // Roots
    c.save();c.globalAlpha=.18;
    for(let r=0;r<7;r++){
      const ang=Math.PI*(r/6)+Math.PI*.05,len=44+r*9;
      c.beginPath();c.moveTo(cx,base);
      c.quadraticCurveTo(cx+Math.cos(ang)*len*.3,base+Math.sin(ang)*len*.22,cx+Math.cos(ang)*len,base+Math.sin(ang)*len*.54);
      c.strokeStyle=p.glow+'.72)';c.lineWidth=p.wire?.65:1;c.lineCap='round';c.stroke();
    }
    c.restore();
    // Stem
    c.beginPath();c.moveTo(cx,base);
    for(let i=1;i<=12;i++){const t=i/12;c.lineTo(cx+Math.sin(t*Math.PI*2)*8*(1-t),base-maxH*t)}
    if(p.wire){c.strokeStyle=p.stemT;c.lineWidth=1.2;}
    else{const sg=c.createLinearGradient(cx,base,cx,stemTop);sg.addColorStop(0,p.stem);sg.addColorStop(1,p.stemT);c.strokeStyle=sg;c.lineWidth=4.5;}
    c.lineCap='round';c.lineJoin='round';c.stroke();
    // Leaves
    for(let i=0;i<6;i++){
      const lt=.15+(i/6)*.75;
      const sX=cx+Math.sin(lt*Math.PI*2)*8*(1-lt),sY=base-maxH*lt;
      const side=i%2===0?1:-1,sz=29+i*15;
      const ang=side*(Math.PI*.32+lt*.14);
      c.save();c.translate(sX,sY);c.rotate(ang);
      c.beginPath();c.moveTo(0,0);
      c.bezierCurveTo(side*sz*.6,-sz*.25,side*sz*.9,-sz*.55,side*sz*.5,-sz*.9);
      c.bezierCurveTo(side*sz*.8,-sz*1.1,side*sz*1.05,-sz*.85,side*sz,-sz*.5);
      c.bezierCurveTo(side*sz*.75,-sz*.25,side*sz*.4,-sz*.05,0,0);
      if(p.wire){c.strokeStyle=p.l0+'.6)';c.lineWidth=.85;c.stroke();}
      else{const lg=c.createLinearGradient(0,0,side*sz,-sz);lg.addColorStop(0,p.l0+'.82)');lg.addColorStop(.55,p.l1+'.88)');lg.addColorStop(1,p.l2+'.72)');c.fillStyle=lg;c.fill();}
      c.beginPath();c.moveTo(0,0);c.lineTo(side*sz*.5,-sz*.87);
      c.strokeStyle=p.l2+(p.wire?'.45)':'.32)');c.lineWidth=p.wire?.5:.42;c.stroke();
      c.restore();
    }
    if(p.scan){
      c.save();c.font='300 9px "DM Mono",monospace';c.fillStyle='rgba(0,200,255,.28)';
      ['SPECTRAL: 470nm','ΔT: +2.3°C','COHERENCE: 98.1%','PHASE: LOCKED'].forEach((l,i)=>c.fillText(l,14,18+i*14));
      c.restore();
    }
  }
  Object.keys(PAL).forEach(id=>{
    const cv=document.querySelector('#'+id+' .scard-cv');
    if(cv)drawCard(cv,PAL[id]);
  });
});

// ══════════════════════════════════════════════════
// PRELOADER — cinematic system boot
// ══════════════════════════════════════════════════
(function(){
  const numEl=document.getElementById('pl-num');
  const pctEl=document.getElementById('pl-pct');
  const barEl=document.getElementById('pl-bar');
  const statusEl=document.getElementById('pl-status');
  const clockEl=document.getElementById('pl-clock');
  const statuses=[
    'BOOTING CHLOROPHYLL ENGINE',
    'CALIBRATING LEAF SENTIMENT',
    'LOADING ROOT CAUSE ANALYSIS',
    'SYNCING PHOTOSYNTHESIS MODELS',
    'VERIFYING BOTANICAL DATASET',
    'INITIALIZING FOLIAGE METRICS',
    'PARSING Q4 PLANT PROJECTIONS',
    'ENCRYPTING DROOP DETECTION™',
    'LOADING NEURAL FROND MAPS',
    'COMPILING STOIC SUCCULENT INDEX',
  ];
  let n=0,sIdx=0;
  // Live clock
  const t0=Date.now();
  (function tick(){
    const ms=Date.now()-t0,s=Math.floor(ms/1000)%60,m=Math.floor(ms/60000)%60,msec=ms%1000;
    if(clockEl)clockEl.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(msec).padStart(3,'0')}`;
    requestAnimationFrame(tick);
  })();
  // Status rotation
  const rotateSt=setInterval(()=>{
    sIdx=(sIdx+1)%statuses.length;
    if(statusEl)statusEl.textContent=statuses[sIdx];
  },300);
  // Count up with slight randomness
  const ti=setInterval(()=>{
    n+=Math.floor(Math.random()*9)+2;
    if(n>=100){n=100;clearInterval(ti);clearInterval(rotateSt);if(statusEl)statusEl.textContent='SYSTEM READY — ALL FRONDS NOMINAL';}
    if(numEl)numEl.textContent=n;
    if(pctEl)pctEl.textContent=`ANALYZING FOLIAGE — ${n}%`;
    if(barEl)barEl.style.width=n+'%';
  },42);
})();

// ══════════════════════════════════════════════════
// LOCOMOTIVE SCROLL + GSAP INIT
// ══════════════════════════════════════════════════
window.addEventListener('load',function(){
  gsap.registerPlugin(ScrollTrigger);

  // ── Cinematic preloader exit (clip-path wipe up) ──
  const pl=document.getElementById('pl');
  setTimeout(()=>{
    pl.classList.add('out');
    setTimeout(()=>{
      pl.style.display='none';
      document.documentElement.style.overflow='';
      document.body.style.overflow='';
      startSite();
    },1050);
  },2000);
});

function startSite(){
  // ── Locomotive Scroll ──
  const locoEl=document.querySelector('[data-scroll-container]');
  const loco=new LocomotiveScroll({el:locoEl,smooth:true,lerp:.065,multiplier:.65,getDirection:true,getSpeed:true,tablet:{smooth:true},smartphone:{smooth:false}});
  window._loco=loco;

  // Proxy ScrollTrigger → Locomotive
  loco.on('scroll',ScrollTrigger.update);
  ScrollTrigger.scrollerProxy('[data-scroll-container]',{
    scrollTop(v){return arguments.length?loco.scrollTo(v,{duration:0,disableLerp:true}):loco.scroll.instance.scroll.y},
    getBoundingClientRect(){return{top:0,left:0,width:innerWidth,height:innerHeight}},
    pinType:locoEl.style.transform?'transform':'fixed'
  });
  ScrollTrigger.addEventListener('refresh',()=>loco.update());
  ScrollTrigger.refresh();

  // ── Hero reveal — cinematic stagger ──
  gsap.to('.hero-h1 .lw span',{y:0,duration:1.6,ease:'power3.out',stagger:.2,delay:.2});
  gsap.to('.hero-desc',{opacity:.68,y:0,duration:1.2,delay:.9,ease:'power2.out'});
  gsap.to('.hero-scroll-txt',{opacity:.38,duration:1,delay:1.1,ease:'power2.out'});
  gsap.to('.hero-cta',{opacity:1,y:0,duration:1,delay:1.2,ease:'power2.out'});

  // Counter
  const so={v:0};gsap.to(so,{v:847,duration:2.4,delay:1,ease:'power2.out',onUpdate:()=>document.getElementById('hs1').textContent=Math.floor(so.v)+'%'});

  // ── Hero 3D tilt + deep parallax ──
  let px=0,py=0;
  gsap.set('#hero',{perspective:1400,transformStyle:'preserve-3d'});
  addEventListener('mousemove',e=>{
    const xp=(e.clientX/innerWidth-.5),yp=(e.clientY/innerHeight-.5);
    px+=(xp-px)*.055;py+=(yp-py)*.055;
    gsap.set('.hero-inner',{rotateX:-py*7,rotateY:px*10,transformStyle:'preserve-3d'});
    gsap.set('.hero-h1',{x:px*30,y:py*18,z:80,transformStyle:'preserve-3d'});
    gsap.set('.hero-desc',{x:px*18,y:py*12,z:15});
    gsap.set('.hero-cta',{x:px*22,y:py*14,z:25});
    gsap.set('#hero-canvas',{x:px*-10,y:py*-6});
  });

  // ── Tagline text reveal ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#tagline',start:'top 80%',end:'top 20%',
    onEnter:()=>{
      gsap.to('#tagline .tl-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.1});
      gsap.to('.tl-top',{opacity:1,y:0,duration:1,ease:'power2.out'});
    },
    onLeaveBack:()=>{
      gsap.to('#tagline .tl-h .lw span',{y:'105%',duration:.55,ease:'power2.in',stagger:.04});
      gsap.to('.tl-top',{opacity:0,y:10,duration:.4,ease:'power2.in'});
    }
  });

  // ── Stats counter ──
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=+el.getAttribute('data-count');
    const item=el.closest('.stat-item');
    ScrollTrigger.create({
      scroller:'[data-scroll-container]',
      trigger:item,start:'top 65%',end:'top 30%',
      onEnter:()=>{
        const o={v:0};gsap.to(o,{v:target,duration:2,ease:'power2.out',
          onUpdate:()=>el.textContent=Math.floor(o.v)});
        gsap.fromTo(item,{opacity:0,y:40},{opacity:1,y:0,duration:1,ease:'power3.out'});
      },
      onLeaveBack:()=>{
        el.textContent='0';
        gsap.to(item,{opacity:0,y:30,duration:.45,ease:'power2.in'});
      }
    });
  });

  // ── Scroll scrub plant canvas ──
  const plantCv=document.getElementById('plant-cv');
  const scrubOv=document.getElementById('scrub-overlay');
  const scMeter=document.getElementById('sc-meter');
  const scFill=document.getElementById('sc-fill');
  const scPct=document.getElementById('sc-pct');
  const scrubSec=document.getElementById('scrub-section');
  const scrubStages=[
    {at:.05,eye:'GERMINATION PHASE',h:'Watch Your<br>Business<br>Bloom',p:'Our ChloroML™ processes 14,000 leaf data points per millisecond — insights no boardroom flipchart could replicate.'},
    {at:.38,eye:'GROWTH ACCELERATION',h:'Chlorophyll<br>Is Your<br>North Star',p:'At 40% photosynthesis efficiency, your revenue potential exceeds Fortune 500 benchmarks. The data is flawless.'},
    {at:.68,eye:'PEAK FOLIAGE YIELD',h:'The Market<br>Is Just<br>A Garden',p:'Mature plants correlate with Q4 outperformance at r=0.94. Gerald the orchid reviewed these numbers personally.'},
  ];

  let lastNavY=0;
  loco.on('scroll',({scroll})=>{
    const y=scroll.y;
    // scroll progress bar
    const sp=document.getElementById('scroll-progress');
    const navEl=document.getElementById('nav');
    if(sp){const totalH=locoEl.scrollHeight-innerHeight;sp.style.width=totalH>0?Math.min(100,y/totalH*100)+'%':'0%'}
    // nav: blur when scrolled, hide when scrolling down past 120px, show when scrolling up
    if(navEl){
      navEl.classList.toggle('scrolled',y>80);
      if(y>120){
        navEl.classList.toggle('nav-hidden',y>lastNavY+2);
      } else {
        navEl.classList.remove('nav-hidden');
      }
    }
    lastNavY=y;
    if(window._secDotsUpdate)window._secDotsUpdate(y);
    const bttEl=document.getElementById('btt');
    if(bttEl)bttEl.classList.toggle('vis',y>600);
    const vH=innerHeight;
    const st=scrubSec.offsetTop;
    const sh=scrubSec.offsetHeight;
    const raw=(y-st)/(sh-vH);
    const inScrub=raw>-0.06&&raw<1.06;
    const progress=Math.max(0,Math.min(1,raw));

    if(inScrub&&progress>0&&progress<1){
      // ── Full scrub takeover ──
      window._plantScrubMode=true;window._plantAmbient=null;
      plantCv.style.opacity='1';
      scrubOv.style.opacity='1';scMeter.style.opacity='1';

      const frames=window._plantFrames;
      if(frames&&frames.length>0){
        const idx=Math.min(frames.length-1,Math.round(progress*(frames.length-1)));
        const pCtx=window.plantCtx;
        const pW=plantCv.width,pH=plantCv.height;
        pCtx.clearRect(0,0,pW,pH);
        // Background composite
        const bgX=pW*.5;
        const bg=pCtx.createRadialGradient(bgX,pH*.6,0,bgX,pH*.6,Math.max(pW,pH)*.7);
        bg.addColorStop(0,`rgba(17,31,19,${.7*progress})`);
        bg.addColorStop(1,'rgba(7,14,8,.98)');
        pCtx.fillStyle=bg;pCtx.fillRect(0,0,pW,pH);
        // Soil line composite
        const soilY=pH*.82+4;
        const sg=pCtx.createLinearGradient(bgX-120,soilY,bgX+120,soilY);
        sg.addColorStop(0,'rgba(60,40,20,0)');
        sg.addColorStop(.5,`rgba(90,60,30,${Math.min(1,progress*3)*.4})`);
        sg.addColorStop(1,'rgba(60,40,20,0)');
        pCtx.fillStyle=sg;pCtx.fillRect(bgX-200,soilY,400,8);
        // Blit pre-rendered plant frame scaled to full viewport
        pCtx.drawImage(frames[idx],0,0,pW,pH);
      } else {
        window.drawPlant(progress);
      }

      scFill.style.width=(progress*100)+'%';
      scPct.textContent=Math.floor(progress*100)+'%';
      let activeStage=scrubStages[0];
      scrubStages.forEach(s=>{if(progress>=s.at)activeStage=s});
      document.getElementById('sc-eye').textContent=activeStage.eye;
      document.getElementById('sc-h').innerHTML=activeStage.h;
      document.getElementById('sc-p').textContent=activeStage.p;
      // Show sketch layers during scrub
      window._sketchCvs?.forEach((cv,i)=>{if(!cv._shown){cv._shown=true;gsap.to(cv,{opacity:1,delay:i*.14,duration:.95,ease:'power2.out'});}});
    } else {
      window._plantScrubMode=false;
      scrubOv.style.opacity='0';scMeter.style.opacity='0';
      // Hide sketch layers outside scrub
      window._sketchCvs?.forEach(cv=>{cv._shown=false;cv.classList.remove('sk-glow');gsap.to(cv,{opacity:0,duration:.6,ease:'power2.in'});});

      if(raw<=-0.06){
        // ── Before scrub: hero + tagline ──
        const heroH=(document.getElementById('hero')||{offsetHeight:vH}).offsetHeight;
        const t=Math.min(1,Math.max(0,y/(heroH*.85)));
        window._plantAmbient={
          pctX:0.86-t*0.15,
          pctY:0.42,
          scale:0.22+t*0.08,
          alpha:t*0.36
        };
      } else {
        // ── After scrub: right side, very slow fade ──
        const dist=y-(st+sh);
        const fadeOut=Math.max(0,1-(dist/(vH*9)));
        window._plantAmbient={
          pctX:0.88,
          pctY:0.38,
          scale:0.18,
          alpha:fadeOut*0.28+0.04
        };
      }
    }
  });

  initBlueprint(loco);

  // ── Stack reveal — driven by Locomotive scroll position ──
  (function(){
    const cards=gsap.utils.toArray('#stack-cards .scard');
    if(!cards.length)return;
    cards.forEach((c,i)=>{
      const depth=cards.length-1-i;
      gsap.set(c,{y:`${depth*2.2}%`,scale:1-depth*.022,zIndex:i+1,transformOrigin:'center 90%'});
    });
    const toFly=[...cards].reverse().slice(0,-1);
    const sec=document.getElementById('stack-sec');
    let lastProg=-1;
    loco.on('scroll',({scroll})=>{
      if(!sec)return;
      const secTop=sec.offsetTop;
      const secScrollable=sec.offsetHeight-innerHeight;
      if(secScrollable<=0)return;
      const prog=Math.max(0,Math.min(1,(scroll.y-secTop)/secScrollable));
      if(Math.abs(prog-lastProg)<0.001)return;
      lastProg=prog;
      const n=document.getElementById('sp-n');
      if(n)n.textContent=Math.min(5,Math.ceil(prog*4.2)+1);
      toFly.forEach((card,i)=>{
        const cardProg=Math.max(0,Math.min(1,(prog-(i/toFly.length))*toFly.length));
        const dir=i%2===0?-1:1;
        const eased=cardProg<0.5?2*cardProg*cardProg:(1-Math.pow(-2*cardProg+2,2)/2);
        const initY=i*2.2; // matches gsap.set depth offset above
        gsap.set(card,{
          y:`${initY+(-128-initY)*eased}%`,x:`${dir*16*eased}%`,
          rotation:dir*13*eased,opacity:1-eased
        });
      });
    });
  })();

  // ── Generic reveal ──
  document.querySelectorAll('.rv').forEach(el=>{
    ScrollTrigger.create({
      scroller:'[data-scroll-container]',
      trigger:el,start:'top 88%',end:'top 25%',
      onEnter:()=>gsap.to(el,{opacity:1,y:0,duration:1,ease:'power3.out'}),
      onLeaveBack:()=>gsap.to(el,{opacity:0,y:40,duration:.45,ease:'power2.in'})
    });
  });
  document.querySelectorAll('.rf').forEach(el=>{
    ScrollTrigger.create({
      scroller:'[data-scroll-container]',
      trigger:el,start:'top 88%',end:'top 25%',
      onEnter:()=>gsap.to(el,{opacity:1,duration:.9,ease:'power2.out'}),
      onLeaveBack:()=>gsap.to(el,{opacity:0,duration:.35,ease:'power2.in'})
    });
  });

  // ── AI section reveals ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#ai-sec',start:'top 75%',end:'top 20%',
    onEnter:()=>{
      gsap.to('.ai-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.1});
      gsap.to('.feat',{opacity:1,y:0,duration:.9,ease:'power3.out',stagger:.1,delay:.25});
    },
    onLeaveBack:()=>{
      gsap.to('.ai-h .lw span',{y:'105%',duration:.55,ease:'power2.in',stagger:.04});
      gsap.to('.feat',{opacity:0,y:20,duration:.4,ease:'power2.in',stagger:.05});
    }
  });

  // ── CTA sold-out heading reveal ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#cta-sec',start:'top 78%',end:'top 20%',
    onEnter:()=>gsap.to('.cta-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.13}),
    onLeaveBack:()=>gsap.to('.cta-h .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04})
  });

  // ── ROI calc reveals ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#roi-sec',start:'top 75%',end:'top 20%',
    onEnter:()=>{
      gsap.to('.roi-head h2 .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.1});
      setTimeout(()=>{if(typeof calc==='function')calc();},600);
    },
    onLeaveBack:()=>gsap.to('.roi-head h2 .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04})
  });

  // ── FAQ reveals ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#faq-sec',start:'top 75%',end:'top 20%',
    onEnter:()=>gsap.to('.faq-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.1}),
    onLeaveBack:()=>gsap.to('.faq-h .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04})
  });

  // ── Team section reveals ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#team-sec',start:'top 75%',end:'top 20%',
    onEnter:()=>{
      gsap.to('.team-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.1});
      gsap.fromTo('.team-card',{opacity:0,y:24},{opacity:1,y:0,duration:.9,stagger:.1,ease:'power2.out',delay:.25});
    },
    onLeaveBack:()=>{
      gsap.to('.team-h .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04});
      gsap.to('.team-card',{opacity:0,y:20,duration:.4,stagger:.06,ease:'power2.in'});
    }
  });

  // ── Pricing section reveals ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#pricing-sec',start:'top 75%',end:'top 20%',
    onEnter:()=>{
      gsap.to('.pricing-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.1});
      gsap.fromTo('.price-card',{opacity:0,y:30},{opacity:1,y:0,duration:.9,stagger:.13,ease:'power2.out',delay:.25});
      setTimeout(()=>gsap.fromTo('.price-feats li',{x:-8},{x:0,duration:.35,stagger:.03,ease:'power2.out'}),600);
    },
    onLeaveBack:()=>{
      gsap.to('.pricing-h .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04});
      gsap.to('.price-card',{opacity:0,y:20,duration:.4,stagger:.07,ease:'power2.in'});
    }
  });

  // ── Comparison table reveals ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#comp-sec',start:'top 75%',end:'top 20%',
    onEnter:()=>{
      gsap.to('.comp-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.1});
      gsap.fromTo('.comp-row',{opacity:0,y:16},{opacity:1,y:0,duration:.7,stagger:.07,ease:'power2.out',delay:.3});
    },
    onLeaveBack:()=>{
      gsap.to('.comp-h .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04});
      gsap.to('.comp-row',{opacity:0,y:10,duration:.35,stagger:.04,ease:'power2.in'});
    }
  });

  // ── Gotcha section entry burst ──
  let gotchaFired=false;
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#gotcha',start:'top 65%',end:'top 20%',
    onEnter:()=>{
      gsap.to('.gotcha-h .lw span',{y:0,duration:1.1,ease:'power3.out',stagger:.09});
      if(!gotchaFired){
        gotchaFired=true;
        const emojis=['🌿','🌵','✦','🌱','🍃','💚','🎉'];
        for(let i=0;i<22;i++){
          const p=document.createElement('span');
          p.textContent=emojis[Math.random()*emojis.length|0];
          p.style.cssText=`position:fixed;left:50%;top:50%;font-size:${.8+Math.random()*.8}rem;pointer-events:none;z-index:9999;user-select:none;`;
          document.body.appendChild(p);
          const a=Math.random()*Math.PI*2,d=100+Math.random()*180;
          gsap.to(p,{x:Math.cos(a)*d,y:Math.sin(a)*d-120,opacity:0,duration:1.1+Math.random()*.5,ease:'power2.out',onComplete:()=>p.remove()});
        }
      }
    },
    onLeaveBack:()=>gsap.to('.gotcha-h .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04})
  });

  // ── Testimonial carousel reveal ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#tes-sec',start:'top 78%',end:'top 20%',
    onEnter:()=>{
      gsap.to('.tes-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.1});
      gsap.to('.tes-tag',{opacity:1,duration:.9,ease:'power2.out'});
    },
    onLeaveBack:()=>{
      gsap.to('.tes-h .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04});
      gsap.to('.tes-tag',{opacity:0,duration:.3,ease:'power2.in'});
    }
  });

  // ── Newsletter ──
  ScrollTrigger.create({
    scroller:'[data-scroll-container]',
    trigger:'#nl-sec',start:'top 75%',end:'top 20%',
    onEnter:()=>gsap.to('.nl-h .lw span',{y:0,duration:1.4,ease:'power3.out',stagger:.11}),
    onLeaveBack:()=>gsap.to('.nl-h .lw span',{y:'105%',duration:.5,ease:'power2.in',stagger:.04})
  });

  // ── Blog horizontal scroll (Locomotive-driven, no GSAP pin) ──
  const btrk=document.getElementById('btrk');
  if(btrk&&window.innerWidth>600){
    const blogSec=document.getElementById('blog-sec');
    setTimeout(()=>{
      // Measure actual px padding from a DOM element
      const tmpEl=document.createElement('div');
      tmpEl.style.cssText='position:absolute;width:var(--px);visibility:hidden';
      document.body.appendChild(tmpEl);
      const px=tmpEl.offsetWidth||80;
      document.body.removeChild(tmpEl);
      const trackW=btrk.scrollWidth;
      const extraScroll=Math.max(0,trackW-innerWidth+px*2);
      if(extraScroll<=0)return;
      // Expand section to give scroll room
      blogSec.style.height=`calc(100vh + ${extraScroll}px)`;
      loco.update();
      loco.on('scroll',({scroll})=>{
        const secTop=blogSec.offsetTop;
        const secH=blogSec.offsetHeight;
        const scrollRoom=secH-innerHeight;
        if(scrollRoom<=0)return;
        const prog=Math.max(0,Math.min(1,(scroll.y-secTop)/scrollRoom));
        gsap.set(btrk,{x:-prog*extraScroll});
        const pf=document.getElementById('blog-prog-fill');
        if(pf)pf.style.width=(prog*100)+'%';
      });
    },700);
  }

  // ── 3D Storyboard scroll driver ──
  (function(){
    const storySec=document.getElementById('story-sec');
    if(!storySec)return;

    let _stPhase=0;
    let _wordRevealed=false;
    const scanVals=[
      {id:'sv1',v:'94.7%',   t:0.18},
      {id:'sv2',v:'88.3 mg/L',t:0.34},
      {id:'sv3',v:'12.4 g',  t:0.52},
      {id:'sv4',v:'0.82 cm', t:0.68},
      {id:'sv5',v:'+3.2 mm/d',t:0.84},
    ];

    function tickScanData(pct){
      scanVals.forEach(({id,v,t})=>{
        const el=document.getElementById(id);
        if(el&&pct>=t)el.textContent=v;
        else if(el&&pct<t)el.textContent='—';
      });
      const st=document.getElementById('st-scan-status');
      if(!st)return;
      if(pct<0.2)st.textContent='INITIALIZING…';
      else if(pct<0.65)st.textContent='SCANNING…';
      else if(pct<0.9)st.textContent='ANALYZING DATA…';
      else st.textContent='COMPLETE — 97.3% CONFIDENCE';
    }

    function updateStoryPhase(phase,prog){
      if(phase!==_stPhase){
        _stPhase=phase;
        document.querySelectorAll('.stp').forEach(el=>el.classList.remove('active'));
        const el=document.getElementById('stp'+phase);
        if(el)el.classList.add('active');
        const pn=document.getElementById('st-pnum-n');
        if(pn)pn.textContent=String(phase).padStart(2,'0');

        // Word reveal stagger on entering phase 7
        if(phase===7&&!_wordRevealed){
          _wordRevealed=true;
          document.querySelectorAll('.st-word-line').forEach((el,i)=>{
            setTimeout(()=>el.classList.add('st-word-in'),i*260+80);
          });
        }
        if(phase!==7){
          _wordRevealed=false;
          document.querySelectorAll('.st-word-line').forEach(el=>el.classList.remove('st-word-in'));
        }

        // Reset scan values when leaving phase 6
        if(phase!==6){
          scanVals.forEach(({id})=>{
            const el=document.getElementById(id);
            if(el)el.textContent='—';
          });
        }
      }

      // Live scan data during phase 6
      if(phase===6){
        const zone={s:0.62,e:0.74};
        const pct=Math.max(0,Math.min(1,(prog-zone.s)/(zone.e-zone.s)));
        tickScanData(pct);
      }

      // Progress bar
      const fill=document.getElementById('story-prog-fill');
      if(fill)fill.style.width=(prog*100)+'%';
    }

    function attachStoryScroll(){
      if(!window._viewer3d)return;
      loco.on('scroll',({scroll})=>{
        const secTop=storySec.offsetTop;
        const secH=storySec.offsetHeight;
        const scrollRoom=secH-innerHeight;
        if(scrollRoom<=0||scroll.y<secTop-innerHeight||scroll.y>secTop+secH+innerHeight)return;
        const prog=Math.max(0,Math.min(1,(scroll.y-secTop)/scrollRoom));
        const phase=window._viewer3d.setScrollProgress(prog);
        updateStoryPhase(phase,prog);
      });
    }

    // Attach once viewer3d is ready (module script fires custom event)
    window.addEventListener('viewer3d-ready',attachStoryScroll);
    // Fallback if event already fired before this code ran
    if(window._viewer3d)attachStoryScroll();

    // Mode button interactions (Phase 8)
    document.querySelectorAll('.st-mode-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const mode=btn.dataset.mode;
        window._viewer3d?.setMaterialMode(mode);
        document.querySelectorAll('.st-mode-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const descs={
          thermal:'Heat signature analysis. Your plant is running hot.',
          xray:'Structural scan complete. Root architecture is impeccable.',
          wireframe:'Geometric skeleton. Pure botanical architecture.',
        };
        const desc=document.getElementById('st-mode-desc');
        if(desc)desc.textContent=descs[mode]||'';
      });
    });
  })();

  // ── Section parallax ──
  document.querySelectorAll('[data-scroll-section]').forEach(s=>{
    if(s.id==='scrub-section'||s.id==='story-sec')return;
    ScrollTrigger.create({
      scroller:'[data-scroll-container]',
      trigger:s,start:'top bottom',end:'bottom top',scrub:true,
      onUpdate:self=>{
        const y=self.progress*-25;
        s.style.setProperty('--py-offset',y+'px');
      }
    });
  });

  // ── Blog card 3D tilt ──
  document.querySelectorAll('.bcard').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const dx=(e.clientX-r.left)/r.width-.5;
      const dy=(e.clientY-r.top)/r.height-.5;
      gsap.to(card,{rotateX:-dy*10,rotateY:dx*10,scale:1.025,duration:.35,ease:'power2.out',transformPerspective:700});
    });
    card.addEventListener('mouseleave',()=>{
      gsap.to(card,{rotateX:0,rotateY:0,scale:1,duration:.6,ease:'elastic.out(1,.6)',transformPerspective:700});
    });
  });

  // ── Team card 3D tilt ──
  document.querySelectorAll('.team-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const dx=(e.clientX-r.left)/r.width-.5;
      const dy=(e.clientY-r.top)/r.height-.5;
      gsap.to(card,{rotateX:-dy*6,rotateY:dx*8,duration:.3,ease:'power2.out',transformPerspective:600});
    });
    card.addEventListener('mouseleave',()=>{
      gsap.to(card,{rotateX:0,rotateY:0,duration:.7,ease:'elastic.out(1,.5)',transformPerspective:600});
    });
  });

  // ── Magnetic buttons ──
  document.querySelectorAll('.btn:not(.ol)').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const dx=e.clientX-(r.left+r.width/2);
      const dy=e.clientY-(r.top+r.height/2);
      gsap.to(btn,{x:dx*.28,y:dy*.28,duration:.35,ease:'power2.out'});
    });
    btn.addEventListener('mouseleave',()=>{
      gsap.to(btn,{x:0,y:0,duration:.6,ease:'elastic.out(1,.55)'});
    });
  });

  // ── Text scramble on eyebrow labels ──
  const CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  function scrambleTxt(el){
    const orig=el.textContent;
    let frame=0;const total=18;
    const id=setInterval(()=>{
      el.textContent=orig.split('').map((c,i)=>
        c===' '?' ':frame/total>i/orig.length?c:CHARS[Math.floor(Math.random()*CHARS.length)]
      ).join('');
      if(++frame>total){el.textContent=orig;clearInterval(id)}
    },38);
  }
  document.querySelectorAll('.eyb').forEach(el=>{
    ScrollTrigger.create({
      scroller:'[data-scroll-container]',
      trigger:el,start:'top 88%',
      onEnter:()=>scrambleTxt(el),
      onLeaveBack:()=>scrambleTxt(el)
    });
  });

  ScrollTrigger.refresh();
  setTimeout(()=>loco.update(),500);
  preRenderPlantFrames();
}


// ══════════════════════════════════════════════════
// ROI CALCULATOR
// ══════════════════════════════════════════════════
const ML=['Never','Sometimes','Daily','Constantly'];
function calc(){
  const S=+document.getElementById('sS').value,W=+document.getElementById('sW').value,
        P=+document.getElementById('sP').value,M=+document.getElementById('sM').value;
  document.getElementById('vS').textContent=S+'h';
  document.getElementById('vW').textContent=W+'×/wk';
  document.getElementById('vP').textContent=P+'"';
  document.getElementById('vM').textContent=ML[M];
  const pi=Math.round(S*28.4+W*67.2+P*12.1+M*143.7);
  const notes=['Seedling-tier insights','Sprout-level intelligence','Mature plant wisdom','Peak foliar consciousness'];
  document.getElementById('rPI').textContent=pi.toLocaleString();
  document.getElementById('rPI-n').textContent=notes[Math.min(3,pi/300|0)];
  const rv=pi*1247+43000;
  const sp=(pi*.31+12).toFixed(1);
  const cf=Math.min(99,60+S*2+W*3+M*4).toFixed(1);
  document.getElementById('rRV-n').textContent=W>5?'⚠️ Overwatering — diluting projections':'Based on current leaf-shed velocity';
  // Animated value updates
  const flash=el=>{gsap.fromTo(el,{color:'var(--orange)'},{color:'var(--white)',duration:.55,ease:'power2.out'})};
  ['rPI','rRV','rSP','rCF'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    const target=id==='rPI'?pi:id==='rRV'?rv:id==='rSP'?null:null;
    if(target!==null){
      const cur=parseFloat(el.textContent.replace(/[^0-9.]/g,''))||0;
      if(Math.abs((id==='rRV'?rv:pi)-cur)>10){
        const obj={v:cur};
        gsap.to(obj,{v:target,duration:.55,ease:'power2.out',onUpdate:()=>{
          el.textContent=id==='rPI'?Math.round(obj.v).toLocaleString():'$'+Math.round(obj.v).toLocaleString();
        }});
      } else {
        el.textContent=id==='rPI'?pi.toLocaleString():'$'+rv.toLocaleString();
      }
    } else {
      el.textContent=id==='rSP'?`+${sp}×`:`${cf}%`;
    }
    flash(el);
  });
}
// Gerald Approval
(function updateGerald(){
  const fill=document.getElementById('rGA-fill');
  const pct=document.getElementById('rGA-pct');
  const verdict=document.getElementById('rGA-v');
  if(!fill)return;
  const S=+document.getElementById('sS').value,
        W=+document.getElementById('sW').value,
        P=+document.getElementById('sP').value,
        M=+document.getElementById('sM').value;
  const score=Math.min(100,Math.round(S*8+W*12+P*3+M*22));
  fill.style.width=score+'%';
  if(pct)pct.textContent=score+'%';
  const verdicts=[
    'Gerald is neutral. Gerald is always neutral. He\'s a fern.',
    'Gerald unfurled a frond. This is encouragement.',
    'Gerald is cautiously optimistic. Gerald\'s leaves are vibrating.',
    'Gerald approves. Gerald is photosynthesising aggressively.',
    'Gerald is ecstatic. Gerald has never been this green. This is a record.'
  ];
  if(verdict)verdict.textContent=verdicts[Math.min(4,score/22|0)];
})();
let _roiCmpT;
document.querySelectorAll('input[type=range]').forEach(s=>s.addEventListener('input',()=>{
  const roiOut=document.querySelector('.roi-output');
  if(roiOut){roiOut.classList.add('computing');clearTimeout(_roiCmpT);_roiCmpT=setTimeout(()=>roiOut.classList.remove('computing'),700);}
  calc();
  (function updateGerald(){
    const fill=document.getElementById('rGA-fill');
    const pct=document.getElementById('rGA-pct');
    const verdict=document.getElementById('rGA-v');
    if(!fill)return;
    const S=+document.getElementById('sS').value,
          W=+document.getElementById('sW').value,
          P=+document.getElementById('sP').value,
          M=+document.getElementById('sM').value;
    const score=Math.min(100,Math.round(S*8+W*12+P*3+M*22));
    fill.style.width=score+'%';
    if(pct)pct.textContent=score+'%';
    const verdicts=[
      'Gerald is neutral. Gerald is always neutral. He\'s a fern.',
      'Gerald unfurled a frond. This is encouragement.',
      'Gerald is cautiously optimistic. Gerald\'s leaves are vibrating.',
      'Gerald approves. Gerald is photosynthesising aggressively.',
      'Gerald is ecstatic. Gerald has never been this green. This is a record.'
    ];
    if(verdict)verdict.textContent=verdicts[Math.min(4,score/22|0)];
  })();
}));
calc();


// SMOOTH FAQ DETAILS ANIMATION
(function(){
  document.querySelectorAll('.faq-item').forEach(det=>{
    const content=det.querySelector('.faq-a');
    if(!content)return;
    content.style.overflow='hidden';
    content.style.transition='max-height .38s cubic-bezier(.16,1,.3,1), opacity .28s';
    content.style.maxHeight='0';content.style.opacity='0';
    det.addEventListener('toggle',()=>{
      if(det.open){
        content.style.maxHeight=content.scrollHeight+'px';
        content.style.opacity='1';
      } else {
        content.style.maxHeight='0';
        content.style.opacity='0';
      }
    });
  });
})();

// BACK TO TOP
document.getElementById('btt').addEventListener('click',()=>{
  if(window._loco)window._loco.scrollTo(0,{duration:1200,easing:[.16,1,.3,1]});
  else window.scrollTo({top:0,behavior:'smooth'});
});

// ══════════════════════════════════════════════════
// TESTIMONIALS CAROUSEL
// ══════════════════════════════════════════════════
(function(){
  const track=document.getElementById('tes-track');
  const dots=document.querySelectorAll('.tes-dot');
  if(!track||!dots.length)return;
  let cur=0,n=track.children.length,auto;
  function goTo(i){
    cur=(i+n)%n;
    track.style.transform=`translateX(-${cur*100}%)`;
    dots.forEach((d,j)=>d.classList.toggle('active',j===cur));
  }
  const next=()=>goTo(cur+1),prev=()=>goTo(cur-1);
  function startAuto(){auto=setInterval(next,5200)}
  function stopAuto(){clearInterval(auto)}
  dots.forEach(d=>d.addEventListener('click',()=>{stopAuto();goTo(+d.dataset.i);startAuto()}));
  document.getElementById('tes-next')?.addEventListener('click',()=>{stopAuto();next();startAuto()});
  document.getElementById('tes-prev')?.addEventListener('click',()=>{stopAuto();prev();startAuto()});
  track.parentElement.addEventListener('mouseenter',stopAuto);
  track.parentElement.addEventListener('mouseleave',startAuto);
  startAuto();
})();

// ══════════════════════════════════════════════════
// AMBIENT AUDIO
// ══════════════════════════════════════════════════
(function(){
  const btn=document.getElementById('audio-btn');
  if(!btn)return;
  let ctx=null,master=null,on=false;
  function init(){
    ctx=new(window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
    [[55,'sine',.06],[110,'sine',.03],[165,'triangle',.016],[82.5,'sine',.022]].forEach(([f,t,g])=>{
      const o=ctx.createOscillator(),gn=ctx.createGain();
      o.type=t;o.frequency.value=f;gn.gain.value=g;
      o.connect(gn);gn.connect(master);o.start();
    });
    const lfo=ctx.createOscillator(),lG=ctx.createGain();
    lfo.frequency.value=.055;lG.gain.value=.02;
    lfo.connect(lG);lG.connect(master.gain);lfo.start();
  }
  btn.addEventListener('click',()=>{
    if(!ctx)init();
    on=!on;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(on?1:0,ctx.currentTime+1.4);
    btn.classList.toggle('on',on);
    document.getElementById('audio-ic').textContent=on?'♪':'♩';
    document.getElementById('audio-lbl').textContent=on?'Sound On':'Ambient';
  });
})();

// ══════════════════════════════════════════════════
// KONAMI CODE: ↑↑↓↓←→←→BA
// ══════════════════════════════════════════════════
(function(){
  const seq=[38,38,40,40,37,39,37,39,66,65];
  let i=0;
  let hintShown=false;
  addEventListener('keydown',e=>{
    if(e.keyCode===seq[i])i++;else i=e.keyCode===seq[0]?1:0;
    if(i===seq.length){i=0;document.getElementById('konami-overlay').classList.add('on');return}
    // Show hint after first correct key press
    if(i===1&&!hintShown){
      hintShown=true;
      const hint=document.createElement('div');
      hint.style.cssText='position:fixed;bottom:4rem;left:50%;transform:translateX(-50%);z-index:2000;font-family:var(--mf);font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;color:var(--orange);opacity:.7;background:rgba(5,12,6,.8);padding:.5em 1.2em;border-radius:100px;pointer-events:none;transition:opacity .5s';
      hint.textContent='↑↑↓↓←→←→BA — keep going...';
      document.body.appendChild(hint);
      setTimeout(()=>{hint.style.opacity='0';setTimeout(()=>hint.remove(),550)},2200);
    }
  });
})();

// ══════════════════════════════════════════════════
// WAITLIST BUTTON
// ══════════════════════════════════════════════════
(function(){
  let n=47238,joined=false;
  const btn=document.getElementById('wl-btn');
  const txt=document.getElementById('wl-btn-txt');
  const cnt=document.getElementById('wl-count');
  if(!btn)return;
  // Organic counter tick — fires always (others joining constantly)
  setInterval(()=>{
    n+=Math.floor(Math.random()*3)+1;
    if(cnt){
      cnt.textContent=n.toLocaleString();
      gsap.fromTo(cnt,{scale:1.16,color:'#f7d060'},{scale:1,color:'',duration:.45,ease:'elastic.out(1,.55)'});
    }
  },5500);
  // Live viewers fluctuation
  const liveEl=document.getElementById('cta-live-n');
  if(liveEl){
    let lv=9+Math.floor(Math.random()*8);
    liveEl.textContent=lv;
    setInterval(()=>{lv=Math.max(6,lv+(Math.random()>.5?1:-1)*(Math.floor(Math.random()*3)+1));liveEl.textContent=lv},4800);
  }
  btn.addEventListener('click',()=>{
    if(joined)return;
    joined=true;n++;
    btn.classList.add('joined');
    const refCode='PLANT-'+Math.random().toString(36).slice(2,8).toUpperCase();
    if(txt)txt.innerHTML=`&#10003; &nbsp;You\'re on the list. The fern will contact you. Code: <strong>${refCode}</strong>`;
    if(cnt)cnt.textContent=n.toLocaleString();
    // confetti burst
    const emojis=['🌿','🌵','🌱','🍃','🌸','✦','✧'];
    const rect=btn.getBoundingClientRect();
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    for(let i=0;i<38;i++){
      const p=document.createElement('span');
      const angle=Math.random()*Math.PI*2;
      const vel=120+Math.random()*180;
      const dx=Math.cos(angle)*vel,dy=Math.sin(angle)*vel-60;
      const rot=(Math.random()-0.5)*720;
      const sz=0.7+Math.random()*0.8;
      p.textContent=emojis[i%emojis.length];
      p.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;font-size:${sz}rem;pointer-events:none;z-index:9500;transform:translate(-50%,-50%);will-change:transform`;
      document.body.appendChild(p);
      gsap.to(p,{x:dx,y:dy,rotation:rot,opacity:0,duration:0.9+Math.random()*0.5,ease:'power2.out',onComplete:()=>p.remove()});
    }
  });
})();

// LIVE REVENUE COUNTER
(function(){
  const el=document.getElementById('cta-rev');
  if(!el)return;
  // Start from a plausible "amount so far today"
  let rev=Math.floor(Date.now()/86400000%1)*2400000+Math.random()*800000;
  rev=Math.round(847000+Math.random()*400000);
  el.textContent=rev.toLocaleString();
  setInterval(()=>{
    rev+=Math.round(Math.random()*847+100);
    el.textContent=rev.toLocaleString();
  },2300);
})();

// CTA COUNTDOWN — counts down from a random ~4-6h window
(function(){
  const hEl=document.getElementById('cd-h');
  const mEl=document.getElementById('cd-m');
  const sEl=document.getElementById('cd-s');
  if(!hEl)return;
  // Random seed: 3-5 hours + random minutes, resets every session
  let total=(3+Math.floor(Math.random()*2))*3600+(Math.floor(Math.random()*50)+5)*60+Math.floor(Math.random()*59);
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    if(total<=0){hEl.textContent='00';mEl.textContent='00';sEl.textContent='00';return}
    total--;
    hEl.textContent=pad(Math.floor(total/3600));
    mEl.textContent=pad(Math.floor((total%3600)/60));
    sEl.textContent=pad(total%60);
  }
  tick();setInterval(tick,1000);
})();

// ══════════════════════════════════════════════════
// NEWSLETTER
// ══════════════════════════════════════════════════
function copyLink(){
  navigator.clipboard.writeText('https://houseplant-hustle.vercel.app').then(()=>{
    const el=document.getElementById('share-link');
    if(el){const orig=el.textContent;el.textContent='Copied! ✓';el.style.opacity='0.8';setTimeout(()=>{el.textContent=orig;el.style.opacity=''},2000)}
  }).catch(()=>{});
}
function nlSub(){
  const inp=document.getElementById('nl-in'),btn=inp.nextElementSibling;
  if(!inp.value.includes('@')){gsap.fromTo(inp,{x:-4},{x:4,duration:.08,repeat:5,yoyo:true,onComplete:()=>gsap.set(inp,{x:0})});return}
  btn.textContent='Growing… 🌱';btn.style.pointerEvents='none';
  setTimeout(()=>{
    btn.textContent='Rooted! ✓';btn.style.background='#58f066';btn.style.color='#0d1a0f';inp.value='';
    // newsletter confetti
    const emojis=['🌿','🌱','🍃','🌸','✦'];
    const rect=btn.getBoundingClientRect();
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    for(let i=0;i<24;i++){
      const p=document.createElement('span');
      const angle=Math.random()*Math.PI*2;
      const vel=80+Math.random()*120;
      p.textContent=emojis[i%emojis.length];
      p.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;font-size:${0.6+Math.random()*0.6}rem;pointer-events:none;z-index:9500;transform:translate(-50%,-50%)`;
      document.body.appendChild(p);
      gsap.to(p,{x:Math.cos(angle)*vel,y:Math.sin(angle)*vel-50,opacity:0,duration:0.8+Math.random()*0.4,ease:'power2.out',onComplete:()=>p.remove()});
    }
  },1300);
}


// ══════════════════════════════════════════════════
// SECTION DOTS NAV
// ══════════════════════════════════════════════════
(function(){
  const dots=document.querySelectorAll('.sec-dot');
  const nav=document.getElementById('sec-dots');
  if(!nav)return;
  setTimeout(()=>nav.classList.add('vis'),3000);
  dots.forEach(d=>{
    d.addEventListener('click',()=>{
      const t=document.querySelector(d.dataset.target);
      if(t&&window._loco)window._loco.scrollTo(t,{offset:-80,duration:1400});
    });
  });
  // Update active dot based on scroll
  const sections=['#hero','#tagline','#ai-sec','#roi-sec','#cta-sec','#tes-sec'].map(s=>document.querySelector(s));
  const navSectionMap=[null,'#tagline',null,'#roi-sec',null,null];
  const navLinks=document.querySelectorAll('.nav-links a');
  window._secDotsUpdate=function(y){
    let active=0;
    sections.forEach((s,i)=>{if(s&&s.offsetTop-200<=y)active=i});
    dots.forEach((d,i)=>d.classList.toggle('active',i===active));
    // Sync nav link highlight
    const activeTarget=navSectionMap[active];
    navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===activeTarget));
  };
})();


// ══════════════════════════════════════════════════
// COOKIE BANNER
// ══════════════════════════════════════════════════
(function(){
  const banner=document.getElementById('cookie-banner');
  if(!banner)return;
  const dismiss=()=>banner.classList.add('out');
  document.getElementById('cookie-accept')?.addEventListener('click',dismiss);
  document.getElementById('cookie-deny')?.addEventListener('click',()=>{
    const deny=document.getElementById('cookie-deny');
    if(deny){deny.textContent='Brenda is disappointed.';deny.style.color='var(--orange)';deny.style.opacity='0.6';}
    setTimeout(dismiss,1800);
  });
  setTimeout(()=>banner.style.display='flex',2800);
})();

// ══════════════════════════════════════════════════
// HERO LIVE METRIC ROTATOR
// ══════════════════════════════════════════════════
(function(){
  const el=document.getElementById('hero-metric');
  if(!el)return;
  const metrics=[
    ()=>`Chlorophyll: ${(90+Math.random()*9).toFixed(1)}%`,
    ()=>`Stem Velocity: ${(1.8+Math.random()*.9).toFixed(2)} mm/h`,
    ()=>`Leaf Sentiment: BULLISH 🌿`,
    ()=>`Neural Syncs: ${(14200+Math.floor(Math.random()*800)).toLocaleString()}/ms`,
    ()=>`Frond Index: ${(Math.random()>.3?'▲ ':'▼ ')}${(Math.random()*4+1).toFixed(2)}`,
    ()=>`Photosynthesis: ${(3.2+Math.random()*1.2).toFixed(2)} mol/day`,
    ()=>`Gerald Sentiment: WATCHFUL`,
    ()=>`Root Depth: ${(42+Math.floor(Math.random()*18))}mm (strategic)`,
    ()=>`Branch ROI: ▲ ${(8+Math.random()*4).toFixed(1)}%`,
  ];
  let mi=0;
  setInterval(()=>{
    mi=(mi+1)%metrics.length;
    el.style.opacity='0';
    setTimeout(()=>{el.textContent=metrics[mi]();el.style.opacity='1'},200);
  },2800);
  el.style.transition='opacity .2s';
})();

// ══════════════════════════════════════════════════
// PAGE TITLE ROTATION
// ══════════════════════════════════════════════════
(function(){
  const titles=[
    'HOUSEPLANT HUSTLE — Your Ficus Sees Q4',
    'HOUSEPLANT HUSTLE — 847% ROI (Source: Gerald)',
    'HOUSEPLANT HUSTLE — Chlorophyll is the new crypto',
    'HOUSEPLANT HUSTLE — The plant said buy.',
    'HOUSEPLANT HUSTLE — Brenda approved this title.',
    'HOUSEPLANT HUSTLE — Made for Leaves. Built for Business.',
    'HOUSEPLANT HUSTLE — Plants are the new VCs',
    'HOUSEPLANT HUSTLE — Brenda reviewed this tab',
    'HOUSEPLANT HUSTLE — Gerald is watching (and thriving)',
    'HOUSEPLANT HUSTLE — Your succulent called. It’s bullish.',
    'HOUSEPLANT HUSTLE — Nasdaq Greenhouse Exchange ▲ 847%',
  ];
  let ti=0;
  const defaultTitle='HOUSEPLANT HUSTLE — Your Ficus Sees Q4';
  setInterval(()=>{ti=(ti+1)%titles.length;document.title=titles[ti]},5500);
  // Tab visibility: show a different title when user leaves
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      document.title='🌿 Come back! Gerald is concerned.';
    } else {
      document.title=titles[ti]||defaultTitle;
    }
  });
})();

// ══════════════════════════════════════════════════
// HERO WORD ROTATION
// ══════════════════════════════════════════════════
(function(){
  const el=document.getElementById('hero-rotate');
  if(!el)return;
  const words=['BUSINESS.','MARKETS.','SYNERGY.','GROWTH.','STRATEGY.','Q4.','CHAOS.'];
  let idx=0;
  setInterval(()=>{
    idx=(idx+1)%words.length;
    gsap.to(el,{opacity:0,y:-18,duration:.28,ease:'power2.in',onComplete:()=>{
      el.textContent=words[idx];
      gsap.fromTo(el,{opacity:0,y:18},{opacity:1,y:0,duration:.38,ease:'power2.out'});
    }});
  },2600);
})();

// KEYBOARD SHORTCUTS
(function(){
  addEventListener('keydown',e=>{
    const tag=document.activeElement.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA')return;
    // '?' → show keyboard shortcuts overlay
    if(e.key==='?'){
      e.preventDefault();
      document.getElementById('kb-overlay').classList.toggle('on');
    }
    // 't' → back to top
    if(e.key==='t'){
      if(window._loco)window._loco.scrollTo(0,{duration:1200,easing:[.16,1,.3,1]});
      else window.scrollTo({top:0,behavior:'smooth'});
    }
    // 'p' → go to pricing
    if(e.key==='p'){
      if(window._loco)window._loco.scrollTo('#pricing-sec',{duration:900,easing:[.16,1,.3,1]});
    }
    // 'n' → newsletter
    if(e.key==='n'){
      if(window._loco)window._loco.scrollTo('#nl-sec',{duration:900,easing:[.16,1,.3,1]});
    }
    // 'f' → FAQ
    if(e.key==='f'){
      if(window._loco)window._loco.scrollTo('#faq-sec',{duration:900,easing:[.16,1,.3,1]});
    }
    // Escape → close overlays
    if(e.key==='Escape'){
      document.getElementById('legal-overlay').classList.remove('on');
      document.getElementById('gerald-cert')?.classList.remove('on');
      document.getElementById('kb-overlay')?.classList.remove('on');
    }
  });
})();


// PLANT OF THE DAY (footer)
(function(){
  const plants=[
    {icon:'🌿',name:'The Golden Pothos',bio:'Trails indefinitely. Surpassed its KPIs in Q2 2024. Currently managing a small team of cuttings.'},
    {icon:'🌵',name:'The Desert Barrel Cactus',bio:'Cash-flow positive since 1987. Has not required watering since the last board meeting. Thriving.'},
    {icon:'🪴',name:'The Monstera Deliciosa',bio:'Certified fiduciary. Fenestrated leaves indicate exceptional risk appetite. Raised $2.3M on vibes.'},
    {icon:'🌱',name:'The Snake Plant',bio:'Works nights. Never complains. Air quality improved 340% since joining the team. Ask about equity.'},
    {icon:'🌺',name:'The Peace Lily',bio:'Chief Morale Officer. Droops visibly when budgets are cut. Considered a leading indicator.'},
    {icon:'🍃',name:'The Fiddle Leaf Fig',bio:'High-maintenance. Difficult to relocate. Used to a corner office. Will not accept a cubicle.'},
    {icon:'🌾',name:'The Bamboo Palm',bio:'Grew 847% in 14 months. Refused acquisition offer from IKEA. Currently in stealth mode.'},
  ];
  const day=new Date().getDay();
  const p=plants[day%plants.length];
  const icon=document.getElementById('f-potd-icon');
  const name=document.getElementById('f-potd-name');
  const bio=document.getElementById('f-potd-bio');
  if(icon)icon.textContent=p.icon;
  if(name)name.textContent=p.name;
  if(bio)bio.textContent=p.bio;
})();

// MOBILE HAMBURGER MENU
(function(){
  const ham=document.getElementById('ham');
  const menu=document.getElementById('mob-menu');
  if(!ham||!menu)return;
  ham.addEventListener('click',()=>{
    ham.classList.toggle('on');
    menu.classList.toggle('on');
    document.body.style.overflow=menu.classList.contains('on')?'hidden':'';
  });
})();
function closeMob(){
  const ham=document.getElementById('ham');
  const menu=document.getElementById('mob-menu');
  if(ham)ham.classList.remove('on');
  if(menu)menu.classList.remove('on');
  document.body.style.overflow='';
}

// FOOTER ONLINE COUNT
(function(){
  const el=document.getElementById('f-online');
  if(!el)return;
  let n=Math.floor(Math.random()*8)+5;
  el.textContent=n;
  setInterval(()=>{
    n=Math.max(4,n+(Math.random()>.5?1:-1)*(Math.random()>.7?2:1));
    el.textContent=n;
  },6200);
})();


// HERO CLICK PARTICLE BURST
(function(){
  const hero=document.getElementById('hero');
  if(!hero)return;
  const emojis=['🌿','🌱','🍃','🌵','✦'];
  hero.addEventListener('click',e=>{
    for(let i=0;i<10;i++){
      const p=document.createElement('span');
      p.textContent=emojis[Math.random()*emojis.length|0];
      p.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;font-size:${.9+Math.random()*.6}rem;pointer-events:none;z-index:9999;user-select:none;`;
      document.body.appendChild(p);
      const angle=Math.random()*Math.PI*2;
      const dist=60+Math.random()*80;
      gsap.to(p,{x:Math.cos(angle)*dist,y:Math.sin(angle)*dist-70,opacity:0,duration:.9+Math.random()*.5,ease:'power2.out',onComplete:()=>p.remove()});
    }
  });
})();

// SECTION NUMBER LABELS (editorial big faint numbers)
(function(){
  const map=[
    ['#tagline','01'],['#ai-sec','02'],['#roi-sec','03'],
    ['#pricing-sec','04'],['#team-sec','05'],['#tes-sec','06'],
    ['#blog-sec','07'],['#faq-sec','08']
  ];
  map.forEach(([sel,num])=>{
    const el=document.querySelector(sel);
    if(!el)return;
    const s=document.createElement('span');
    s.className='sec-num';s.textContent=num;
    el.style.overflow='hidden';
    el.appendChild(s);
  });
})();

// ══════════════════════════════════════════════════
// WORD HOVER EFFECTS
// — Global orange trail: every .lw span turns orange on touch, fades 1.3s
// — Section effects: one effect per heading group (water/rubber/glitch/invert/paint)
// ══════════════════════════════════════════════════
(function(){
  // ── Global orange trail (replaces glow, no blur) ──
  document.querySelectorAll('.lw span').forEach(span=>{
    span.addEventListener('mouseenter',()=>{
      span.classList.add('hx-trail');
      clearTimeout(span._tt);
    });
    span.addEventListener('mouseleave',()=>{
      clearTimeout(span._tt);
      span._tt=setTimeout(()=>span.classList.remove('hx-trail'),80);
    });
  });

  // ── Per-section heading effects — one effect per heading, all words share it ──
  const map=[
    {sel:'.hero-h1',   fx:'water'},
    {sel:'.tl-h',      fx:'rubber'},
    {sel:'.stack-h',   fx:'glitch'},
    {sel:'.scrub-h',   fx:'water'},
    {sel:'.ai-h',      fx:'paint'},
    {sel:'.roi-head h2',fx:'rubber'},
    {sel:'.pricing-h', fx:'invert'},
    {sel:'.comp-h',    fx:'glitch'},
    {sel:'.gotcha-h',  fx:'paint'},
    {sel:'.team-h',    fx:'water'},
    {sel:'.cta-h',     fx:'rubber'},
    {sel:'.tes-h',     fx:'glitch'},
    {sel:'.faq-h',     fx:'paint'},
    {sel:'.nl-h',      fx:'invert'},
  ];

  map.forEach(({sel,fx})=>{
    const heading=document.querySelector(sel);
    if(!heading)return;
    const spans=Array.from(heading.querySelectorAll('.lw span'));
    if(!spans.length)return;

    if(fx==='water'){
      // Word-level wave: staggered scaleY pulse — no clipping issues
      spans.forEach(span=>{
        span.addEventListener('mouseenter',()=>{
          gsap.to(spans,{
            scaleX:1.08,scaleY:1.12,
            duration:.2,ease:'sine.out',stagger:.08,
            transformOrigin:'center center',
            onComplete(){
              gsap.to(spans,{scaleX:1,scaleY:1,duration:.75,ease:'elastic.out(1,.38)',stagger:.05,transformOrigin:'center center'});
            }
          });
        });
      });
    }

    if(fx==='rubber'){
      let _rbActive=null;
      spans.forEach(span=>{
        span.style.transformOrigin='center center';
        span.style.cursor='grab';
        // Hover: light skew based on mouse position
        span.addEventListener('mousemove',e=>{
          if(_rbActive&&_rbActive.span!==span)return;
          if(_rbActive)return; // dragging — skip hover
          const r=span.getBoundingClientRect();
          const rel=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width*.5)));
          gsap.to(span,{skewX:rel*14,scaleX:1+Math.abs(rel)*.22,duration:.18,ease:'power2.out'});
        });
        span.addEventListener('mouseleave',()=>{
          if(_rbActive&&_rbActive.span===span)return;
          gsap.to(span,{skewX:0,scaleX:1,duration:.9,ease:'elastic.out(1,.32)'});
        });
        // Drag: mousedown starts drag
        span.addEventListener('mousedown',e=>{
          e.preventDefault();
          span.style.cursor='grabbing';
          _rbActive={span,startX:e.clientX};
        });
      });
      // Global drag tracking for rubber spans
      window.addEventListener('mousemove',e=>{
        if(!_rbActive)return;
        const dx=e.clientX-_rbActive.startX;
        const rel=Math.max(-2.2,Math.min(2.2,dx/55));
        gsap.to(_rbActive.span,{skewX:rel*26,scaleX:1+Math.abs(rel)*.45,duration:.05,ease:'none'});
      });
      window.addEventListener('mouseup',()=>{
        if(!_rbActive)return;
        _rbActive.span.style.cursor='grab';
        gsap.to(_rbActive.span,{skewX:0,scaleX:1,duration:1.2,ease:'elastic.out(1,.26)'});
        _rbActive=null;
      });
    }

    if(fx==='glitch'){
      spans.forEach(span=>{
        span.addEventListener('mouseenter',()=>{
          span.classList.remove('hx-glitch');
          void span.offsetWidth; // reflow to restart animation
          span.classList.add('hx-glitch');
          setTimeout(()=>span.classList.remove('hx-glitch'),500);
        });
      });
    }

    if(fx==='invert'){
      spans.forEach(span=>{
        span.addEventListener('mouseenter',()=>{
          span.classList.remove('hx-invert');
          void span.offsetWidth;
          span.classList.add('hx-invert');
          setTimeout(()=>span.classList.remove('hx-invert'),600);
        });
      });
    }

    if(fx==='paint'){
      spans.forEach(span=>{
        span.addEventListener('mouseenter',()=>{
          span.classList.remove('hx-paint');
          void span.offsetWidth; // force reflow so re-enter always triggers
          span.classList.add('hx-paint');
          clearTimeout(span._pt);
          span._pt=setTimeout(()=>span.classList.remove('hx-paint'),1400);
        });
      });
    }

    // Inject hint label below heading
    const hintLabels={water:'↑ hover — wave',rubber:'↑ hover & drag — stretch',glitch:'↑ hover — glitch',invert:'↑ hover — invert',paint:'↑ hover — paint'};
    const hint=document.createElement('span');
    hint.className='fx-hint';
    hint.textContent=hintLabels[fx]||'↑ hover to interact';
    heading.after(hint);
  });

  // ── Invert flash on hero exit ──
  (function(){
    const flash=document.getElementById('inv-flash');
    if(!flash)return;
    let fired=false;
    ScrollTrigger.create({
      scroller:'[data-scroll-container]',
      trigger:'#hero',
      start:'bottom 60%',
      onEnter:()=>{
        if(fired)return;
        fired=true;
        flash.style.animation='none';
        flash.style.opacity='0';
        void flash.offsetWidth;
        flash.style.animation='invFlash .55s ease-out forwards';
        setTimeout(()=>{fired=false;},2200);
      }
    });
  })();
})();
