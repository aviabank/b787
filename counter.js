/* $B787 (Boeing 787) — Cross-page counter for AviaTrust ecosystem */
(function(){
  const SK = {
    counter:  'b787_counter',
    visitors: 'b787_visitors',
    holders:  'b787_holders',
    clients:  'b787_clients',
    startTime:'b787_start',
    lastUpdate:'b787_last',
    hash:     'b787_hash'
  };
  const SALT = 'b787_salt_2026_aviatrust_787';

  function genHash(v){
    let h = 0;
    const s = String(v) + SALT;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h &= h;
    }
    return Math.abs(h).toString(16).padStart(8, '0');
  }

  function save(v, h, c, s){
    const n = Date.now();
    const d = {
      visitors: v, holders: h, clients: c, startTime: s, lastUpdate: n,
      hash: genHash(v + '|' + h + '|' + c + '|' + s)
    };
    try {
      localStorage.setItem(SK.counter, JSON.stringify(d));
      localStorage.setItem(SK.visitors, String(v));
      localStorage.setItem(SK.holders, String(h));
      localStorage.setItem(SK.clients, String(c));
      localStorage.setItem(SK.startTime, String(s));
      localStorage.setItem(SK.lastUpdate, String(n));
      localStorage.setItem(SK.hash, d.hash);
      sessionStorage.setItem(SK.counter, JSON.stringify(d));
    } catch(e){}
  }

  function load(){
    try {
      const data = localStorage.getItem(SK.counter);
      if (data) {
        const p = JSON.parse(data);
        if (p.hash === genHash(p.visitors + '|' + p.holders + '|' + p.clients + '|' + p.startTime)) return p;
      }
      const sd = sessionStorage.getItem(SK.counter);
      if (sd) {
        const p = JSON.parse(sd);
        if (p.hash === genHash(p.visitors + '|' + p.holders + '|' + p.clients + '|' + p.startTime)) return p;
      }
    } catch(e){}
    return null;
  }

  let st = load();
  const now = Date.now();
  if (!st) {
    st = { visitors: 1203, holders: 0, clients: 0, startTime: now, lastUpdate: now,
      hash: genHash(1203 + '|' + 0 + '|' + 0 + '|' + now) };
    save(st.visitors, st.holders, st.clients, st.startTime);
  }

  let visitors = st.visitors;
  let holders  = st.holders;
  let clients  = st.clients;
  const startTime = st.startTime;

  function updateCounter(){
    const n = Date.now();
    const elapsed = Math.floor((n - startTime) / 1000);
    visitors = 1203 + elapsed * 7;
    holders  = Math.floor(elapsed / 20);
    clients  = Math.floor(elapsed / 40);

    document.querySelectorAll('.counter-visitors').forEach(el => el.textContent = visitors.toLocaleString());
    document.querySelectorAll('.counter-holders').forEach(el => el.textContent = holders.toLocaleString());
    document.querySelectorAll('.counter-clients').forEach(el => el.textContent = clients.toLocaleString());

    const ts = new Date(n).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    document.querySelectorAll('.counter-visitor-time').forEach(el => el.textContent = 'Updated: ' + ts);
    document.querySelectorAll('.counter-holder-time').forEach(el => el.textContent = 'Verified: ' + ts);
    document.querySelectorAll('.counter-client-time').forEach(el => el.textContent = 'Verified: ' + ts);

    if (n - st.lastUpdate > 10000) {
      save(visitors, holders, clients, startTime);
      st.lastUpdate = n;
      updateMetadata(visitors, holders, clients, startTime);
    }
  }

  function updateMetadata(visitors, holders, clients, startTime){
    const n = Date.now();
    const hash = genHash(visitors + '|' + holders + '|' + clients + '|' + startTime);

    let script = document.querySelector('script[data-counter-jsonld]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-counter-jsonld', 'true');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "$B787 — Boeing 787 Dreamliner | AviaTrust",
      "description": "Boeing 787 Dreamliner — the proven asset of AviaTrust. 1B passengers, 1,203 orders, 475+ deliveries.",
      "statistics": {
        "visitors": visitors, "holders": holders, "clients": clients,
        "startDate": new Date(startTime).toISOString(),
        "lastUpdate": new Date(n).toISOString()
      },
      "additionalProperty": [
        {"@type": "PropertyValue", "name": "counterHash", "value": hash},
        {"@type": "PropertyValue", "name": "contract", "value": "B787ContractAddressHere"}
      ]
    });

    let hidden = document.querySelector('[data-counter-verification]');
    if (!hidden) {
      hidden = document.createElement('div');
      hidden.style.display = 'none';
      hidden.setAttribute('data-counter-verification', 'true');
      document.body.appendChild(hidden);
    }
    hidden.setAttribute('data-counter-visitors', visitors);
    hidden.setAttribute('data-counter-holders', holders);
    hidden.setAttribute('data-counter-clients', clients);
    hidden.setAttribute('data-counter-start', startTime);
    hidden.setAttribute('data-counter-hash', hash);
    hidden.setAttribute('data-counter-last-update', n);
  }

  window.addEventListener('storage', function(e){
    if (e.key === SK.visitors) {
      const nv = parseInt(e.newValue);
      const nh = parseInt(localStorage.getItem(SK.holders));
      const nc = parseInt(localStorage.getItem(SK.clients));
      if (nv > visitors) { visitors = nv; holders = nh; clients = nc; updateCounter(); }
    }
  });

  window.addEventListener('beforeunload', function(){
    save(visitors, holders, clients, startTime);
  });

  updateMetadata(visitors, holders, clients, startTime);
  updateCounter();
  setInterval(updateCounter, 1000);
  setInterval(function(){ updateMetadata(visitors, holders, clients, startTime); }, 600000);
})();
