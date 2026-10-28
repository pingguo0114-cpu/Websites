// FORM 08 — shared behaviour for every page.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var sheet = document.getElementById('sheet');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-label').textContent = open ? '닫기' : '메뉴';
    sheet.inert = !open;
    if (open) sheet.querySelector('a').focus();
  }
  if (menuBtn && sheet) {
    sheet.inert = true;
    menuBtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ---------- Page fade between internal pages ---------- */
  if (!reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(function () { location.href = a.href; }, 220);
    });
    window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });
  }

  /* ---------- Curtain reveal for photos ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- The drifting 08 on the home hero ---------- */
  var big = document.querySelector('.hero-08');
  if (big && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        big.style.transform = 'translate3d(' + (-y * 0.06) + 'px,' + (y * 0.28) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Bottom booking bar on phones ---------- */
  var bar = document.querySelector('.book-bar');
  if (bar) {
    document.body.classList.add('has-bar');
    var showBar = function () { bar.classList.toggle('show', window.scrollY > 320); };
    window.addEventListener('scroll', showBar, { passive: true });
    showBar();
  }

  /* ---------- Tabs ---------- */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !on;
          if (on) { panel.classList.remove('switched'); void panel.offsetWidth; panel.classList.add('switched'); }
        }
      });
      if (focus) tab.focus();
      list.dispatchEvent(new CustomEvent('tabchange', { detail: tab }));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (n === null) return;
        e.preventDefault();
        select(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
    var fromHash = location.hash && tabs.filter(function (t) { return t.getAttribute('aria-controls') === 'p-' + location.hash.slice(1); })[0];
    var start = fromHash || (list.dataset.start ? tabs[Number(list.dataset.start)] : tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]);
    if (start) select(start, false);
  });

  /* ---------- Timetable (example data) ---------- */
  var tt = document.getElementById('timetable');
  if (tt) {
    var week = {
      월: [['07:00', '1:1 프라이빗', '서윤', 1], ['10:00', '기구 그룹', '하린', 2], ['19:30', '2:1 듀엣', '서윤', 1], ['21:00', '기구 그룹', '도현', 0]],
      화: [['07:00', '기구 그룹', '도현', 3], ['12:10', '1:1 프라이빗', '하린', 1], ['20:00', '기구 그룹', '하린', 1]],
      수: [['07:00', '1:1 프라이빗', '서윤', 1], ['10:00', '2:1 듀엣', '도현', 2], ['19:30', '기구 그룹', '서윤', 4], ['21:00', '1:1 프라이빗', '도현', 0]],
      목: [['07:00', '기구 그룹', '하린', 2], ['12:10', '1:1 프라이빗', '서윤', 1], ['20:00', '2:1 듀엣', '하린', 1]],
      금: [['07:00', '1:1 프라이빗', '도현', 1], ['19:00', '기구 그룹', '서윤', 3]],
      토: [['09:00', '기구 그룹', '하린', 1], ['10:30', '2:1 듀엣', '도현', 2], ['12:00', '1:1 프라이빗', '서윤', 0]],
      일: []
    };
    var days = ['일', '월', '화', '수', '목', '금', '토'];
    var list = document.querySelector('#days');
    function render(day) {
      var rows = week[day] || [];
      if (!rows.length) { tt.innerHTML = '<p class="empty">일요일은 쉬어요. 월요일 아침 7시에 첫 수업이 있어요.</p>'; return; }
      tt.innerHTML = rows.map(function (r) {
        var left = r[3] === 0 ? '<span class="left full">마감</span>' : '<span class="left' + (r[3] === 1 ? ' few' : '') + '">' + r[3] + '자리 남음</span>';
        return '<div class="slot"><time>' + r[0] + '</time><span>' + r[1] + ' <span class="who">· ' + r[2] + '</span></span>' + left + '</div>';
      }).join('');
      tt.classList.remove('switched'); void tt.offsetWidth; tt.classList.add('switched');
    }
    list.addEventListener('tabchange', function (e) { render(e.detail.dataset.day); });
    var today = days[new Date().getDay()];
    var todayTab = list.querySelector('[data-day="' + today + '"]');
    if (todayTab) { todayTab.querySelector('.today-mark').hidden = false; todayTab.click(); }
  }

  /* ---------- Instructor details ---------- */
  document.querySelectorAll('.more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.more-label').textContent = open ? '접기' : '자격과 경력 보기';
      document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('open', open);
    });
  });

  /* ---------- Pricing switch ---------- */
  var seg = document.querySelector('.seg');
  if (seg) {
    var plans = {
      solo: { name: '1:1 프라이빗', rows: [['체험 1회', 50000, 1], ['10회', 800000, 10], ['20회', 1500000, 20, true], ['30회', 2100000, 30]] },
      duet: { name: '2:1 듀엣', rows: [['체험 1회', 35000, 1], ['10회', 500000, 10], ['20회', 900000, 20, true], ['30회', 1260000, 30]] },
      group: { name: '기구 그룹 (최대 4명)', rows: [['체험 1회', 25000, 1], ['10회', 300000, 10, true], ['20회', 540000, 20], ['30회', 750000, 30]] }
    };
    var body = document.getElementById('price-body');
    var cap = document.getElementById('price-caption');
    var won = function (n) { return n.toLocaleString('ko-KR') + '원'; };
    var show = function (key) {
      var p = plans[key];
      cap.textContent = p.name + ' 이용권 가격 (예시)';
      body.innerHTML = p.rows.map(function (r) {
        return '<tr' + (r[3] ? ' class="pick"' : '') + '><th scope="row">' + r[0] + '</th><td>' + won(r[1]) + '</td><td class="per">' + (r[2] > 1 ? '회당 ' + won(Math.round(r[1] / r[2])) : '첫 방문 1회') + '</td></tr>';
      }).join('');
      seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.plan === key)); });
    };
    seg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(b.dataset.plan); });
    show('solo');
  }

  /* ---------- Today's hours ---------- */
  var d = new Date().getDay();
  document.querySelectorAll('.hours tr[data-days]').forEach(function (tr) {
    if (tr.dataset.days.split(',').indexOf(String(d)) !== -1) tr.classList.add('today');
  });

  /* ---------- Trial booking form (demo, nothing is sent) ---------- */
  var form = document.getElementById('trial-form');
  if (form) {
    var date = document.getElementById('t-date');
    var now = new Date();
    date.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    var msg = document.getElementById('form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = [];
      form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
      if (!form.querySelector('input[name="class"]:checked')) missing.push('수업');
      if (!date.value) { missing.push('날짜'); date.setAttribute('aria-invalid', 'true'); }
      else if (new Date(date.value + 'T00:00').getDay() === 0) { msg.textContent = '일요일은 쉬어요. 다른 날을 골라 주세요.'; msg.className = 'form-msg err'; date.setAttribute('aria-invalid', 'true'); date.focus(); return; }
      if (!form.querySelector('input[name="time"]:checked')) missing.push('시간대');
      ['t-name', 't-phone'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el.value.trim()) { missing.push(el.dataset.label); el.setAttribute('aria-invalid', 'true'); }
      });
      if (!document.getElementById('t-agree').checked) missing.push('개인정보 동의');
      if (missing.length) {
        msg.textContent = '아직 비어 있는 항목이 있어요: ' + missing.join(', ');
        msg.className = 'form-msg err';
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }
      var cls = form.querySelector('input[name="class"]:checked').value;
      var time = form.querySelector('input[name="time"]:checked').value;
      var done = document.getElementById('done');
      done.querySelector('[data-summary]').textContent =
        date.value.replace(/-/g, '. ') + ' ' + time + ', ' + cls + ' 체험으로 요청을 받았어요. 스튜디오에서 하루 안에 문자로 확정 시간을 보내드려요.';
      form.hidden = true;
      done.hidden = false;
      done.querySelector('h2').focus();
    });
  }
})();
