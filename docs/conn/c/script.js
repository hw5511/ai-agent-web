import * as THREE from 'three';

document.documentElement.classList.add('js');

const spark_reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   온돌 바닥 · 정점 변위(Vertex Shader Noise) 데워지는 표면
   구체/디스크가 아닌, 화면 하단에서 데워져 일렁이는 바닥 면.
   ========================================================= */
function spark_initOndol(){
  const canvas = document.getElementById('ondol-floor');
  if(!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 2.4, 5.2);
  camera.lookAt(0, -0.6, 0);

  const geo = new THREE.PlaneGeometry(16, 16, 180, 180);

  const uniforms = {
    u_time:   { value: 0 },
    u_warm:   { value: 0 },   // 스크롤 깊이 → 온기(0 표층 ~ 1 심층)
    u_cold:   { value: new THREE.Color(0x2a3550) },
    u_ember:  { value: new THREE.Color(0xff7a3c) },
    u_glow:   { value: new THREE.Color(0xffc27a) },
  };

  const vert = `
    uniform float u_time; uniform float u_warm;
    varying float v_h; varying vec2 v_uv;
    // 3D simplex-ish 노이즈 (펄린 변형)
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
    void main(){
      v_uv = uv;
      vec3 pos = position;
      float amp = 0.35 + u_warm * 0.95;        // 데워질수록 크게 일렁
      float spd = 0.18 + u_warm * 0.42;        // 데워질수록 빠르게
      float n = snoise(vec3(pos.x*0.32, pos.y*0.32, u_time*spd));
      n += 0.5 * snoise(vec3(pos.x*0.8, pos.y*0.8, u_time*spd*1.4));
      pos.z += n * amp;
      v_h = n;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
    }
  `;
  const frag = `
    precision mediump float;
    uniform float u_warm; uniform vec3 u_cold; uniform vec3 u_ember; uniform vec3 u_glow;
    varying float v_h; varying vec2 v_uv;
    void main(){
      float heat = clamp((v_h*0.5+0.5)*0.6 + u_warm*0.7, 0.0, 1.0);
      vec3 col = mix(u_cold, u_ember, smoothstep(0.15,0.85,heat));
      col = mix(col, u_glow, smoothstep(0.6,1.0,heat) * (0.3 + u_warm*0.6));
      // 아래(가까운) 부분이 더 뜨겁게
      float depth = smoothstep(0.0, 1.0, v_uv.y);
      col = mix(col*1.15, col*0.6, depth);
      float a = 0.55 * (0.4 + u_warm*0.6);
      gl_FragColor = vec4(col, a);
    }
  `;

  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader:vert, fragmentShader:frag,
    transparent:true, depthWrite:false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI * 0.62;   // 바닥처럼 눕힘
  mesh.position.y = -1.4;
  scene.add(mesh);

  function resize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let app_targetWarm = 0;
  // 스크롤 깊이를 온기로 환산
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    app_targetWarm = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }, { passive:true });

  function render(){
    const t = clock.getElapsedTime();
    uniforms.u_time.value = spark_reduce ? 0 : t;
    uniforms.u_warm.value += (app_targetWarm - uniforms.u_warm.value) * 0.05;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
}

/* =========================================================
   Lenis + GSAP · Kinetic Identity: 온기가 아래에서 위로 차오르듯
   reveal 이 stagger 로 솟아오른다.
   ========================================================= */
function spark_initMotion(){
  if(spark_reduce){
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
    spark_bindGauge(null);
    return;
  }
  if(typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // 마스트헤드: 브랜드가 묵직하게 솟아오름 (신뢰의 페르소나)
  gsap.from('.brand', { y:70, opacity:0, duration:1.3, ease:'power3.out', delay:.15 });
  gsap.from('.kicker', { y:24, opacity:0, duration:.9, ease:'power2.out', delay:.1 });
  gsap.from('.brand-sub', { y:30, opacity:0, duration:1, ease:'power2.out', delay:.5 });

  // 지층별 reveal · 아래에서 차오르는 stagger
  document.querySelectorAll('.stratum').forEach(sec => {
    const bits = sec.querySelectorAll('.reveal');
    if(!bits.length) return;
    gsap.to(bits, {
      y:0, opacity:1, duration:1, ease:'power2.out', stagger:.09,
      scrollTrigger:{ trigger:sec, start:'top 78%' }
    });
  });

  // 푸터 등 지층 밖 reveal
  document.querySelectorAll('.reveal').forEach(el => {
    if(el.closest('.stratum')) return;
    gsap.to(el, { y:0, opacity:1, duration:1, ease:'power2.out',
      scrollTrigger:{ trigger:el, start:'top 88%' } });
  });

  spark_bindGauge(lenis);
}

/* 지층 게이지 · 현재 위치 표시 + 온도 readout (아침→데워짐) */
function spark_bindGauge(lenis){
  const links = Array.from(document.querySelectorAll('.strata-gauge a'));
  const temp = document.getElementById('gauge-temp');
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      if(!lenis) return; // Lenis 없으면 기본 앵커 점프 사용
      const target = document.querySelector(a.getAttribute('href'));
      if(!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset:-40 });
    });
  });

  function update(){
    const mid = window.scrollY + window.innerHeight * 0.4;
    let idx = 0;
    sections.forEach((s, i) => { if(s.offsetTop <= mid) idx = i; });
    links.forEach((a, i) => a.classList.toggle('is-active', i === idx));
    if(temp){
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      const val = (22 + p * 4).toFixed(1);   // 22.0° → 26.0° (온돌 유지 온도)
      temp.textContent = val + '°';
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* reveal 대상 마킹 (DOM 은 완성형 유지, 클래스만 추가) */
function spark_markReveal(){
  const sel = '.stratum-rim,.lead-title,.intro-lead p,.intro-facts,.stratum-head,.stratum-sub,'
    + '.scale,.warm-copy,.warm-photo,.stock-row,.stock-legend,.visit-info,.visit-aside,.floor-foot';
  document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
}

spark_markReveal();
spark_initOndol();
window.addEventListener('load', spark_initMotion);
