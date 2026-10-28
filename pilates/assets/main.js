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

  /* ---------- Schedule data (example) ---------- */
  // One list feeds the week grid (wide screens), the day tabs (phones) and "my bookings".
  // left = seats still open before this visitor books (example numbers, same every week).
  var SLOTS = [
    ['월', '07:00', '1:1 프라이빗', '서윤', 1], ['화', '07:00', '기구 그룹', '도현', 3], ['수', '07:00', '1:1 프라이빗', '서윤', 0], ['목', '07:00', '기구 그룹', '하린', 2], ['금', '07:00', '1:1 프라이빗', '도현', 1],
    ['월', '10:00', '기구 그룹', '하린', 2], ['수', '10:00', '2:1 듀엣', '도현', 2], ['금', '10:00', '기구 그룹', '서윤', 1], ['토', '10:00', '기구 그룹', '하린', 1],
    ['화', '12:00', '1:1 프라이빗', '하린', 1], ['목', '12:00', '1:1 프라이빗', '서윤', 1], ['토', '12:00', '2:1 듀엣', '도현', 2],
    ['토', '14:00', '1:1 프라이빗', '서윤', 0],
    ['월', '19:00', '2:1 듀엣', '서윤', 1], ['화', '19:00', '기구 그룹', '하린', 1], ['수', '19:00', '기구 그룹', '서윤', 4], ['목', '19:00', '2:1 듀엣', '하린', 1], ['금', '19:00', '기구 그룹', '서윤', 3],
    ['월', '20:30', '기구 그룹', '도현', 0], ['화', '20:30', '1:1 프라이빗', '도현', 1], ['수', '20:30', '1:1 프라이빗', '도현', 0], ['목', '20:30', '기구 그룹', '도현', 2]
  ].map(function (r) { return { day: r[0], time: r[1], cls: r[2], who: r[3], left: r[4] }; });
  var DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  var OPEN_DAYS = ['월', '화', '수', '목', '금', '토'];
  var CANCEL_HOURS = 12;
  var todayName = DAYS[new Date().getDay()];

  /* ---------- Demo account (saved in this browser only) ---------- */
  // Nothing leaves the browser. Passwords are stored as a hash, never as typed.
  var STORE_KEY = 'form08-demo';
  function loadStore() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
    d = d && typeof d === 'object' ? d : {};
    d.users = Array.isArray(d.users) ? d.users : [];
    d.bookings = Array.isArray(d.bookings) ? d.bookings : [];
    return d;
  }
  var store = loadStore();
  function saveStore() { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); return true; } catch (e) { return false; } }
  function me() { return store.users.filter(function (u) { return u.phone === store.session; })[0] || null; }
  function digits(v) { return String(v || '').replace(/\D/g, ''); }
  function prettyPhone(d) { return d.length === 11 ? d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7) : d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6); }
  function hashPw(phone, pw) {
    var text = 'form08|' + phone + '|' + pw;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
    }
    var h = 5381; for (var i = 0; i < text.length; i++) h = (h * 33 + text.charCodeAt(i)) >>> 0;
    return Promise.resolve('d' + h.toString(16));
  }
  function refreshAccountLinks() {
    var u = me();
    document.querySelectorAll('[data-account-link]').forEach(function (a) { a.textContent = u ? '내 예약' : '로그인'; });
  }
  refreshAccountLinks();

  // Account page
  var authBox = document.getElementById('auth');
  if (authBox) {
    var meBox = document.getElementById('me');
    var next = new URLSearchParams(location.search).get('next');
    if (!/^[a-z]+\.html(#[a-z-]+)?$/.test(next || '')) next = null; // only our own pages
    function fail(el, text, focusEl) { el.textContent = text; el.className = 'form-msg err'; if (focusEl) focusEl.focus(); }
    function showMe(focus) {
      var u = me();
      authBox.hidden = !!u; meBox.hidden = !u;
      document.getElementById('account-title').textContent = u ? '내 예약' : '로그인';
      document.title = (u ? '내 예약' : '로그인') + ' | FORM 08';
      document.getElementById('account-lede').hidden = !!u;
      refreshAccountLinks();
      if (!u) return;
      meBox.querySelector('[data-me-name]').textContent = u.name;
      meBox.querySelector('[data-me-phone]').textContent = prettyPhone(u.phone);
      renderMyBookings();
      if (focus) meBox.querySelector('.me-hello').focus();
    }
    function backToLogin() {
      showMe(false);
      var t = document.getElementById('t-login'); t.click(); t.focus();
    }
    function signedIn() {
      if (next) { location.href = next; return; }
      showMe(true);
    }
    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('login-msg');
      var phoneEl = document.getElementById('l-phone'), pwEl = document.getElementById('l-pw');
      var phone = digits(phoneEl.value);
      if (!phone) return fail(msg, '휴대폰 번호를 입력해 주세요.', phoneEl);
      if (!pwEl.value) return fail(msg, '비밀번호를 입력해 주세요.', pwEl);
      var user = store.users.filter(function (u) { return u.phone === phone; })[0];
      hashPw(phone, pwEl.value).then(function (h) {
        if (!user || user.pw !== h) return fail(msg, '휴대폰 번호나 비밀번호가 맞지 않아요.', pwEl);
        store.session = phone; saveStore(); signedIn();
      });
    });
    document.getElementById('signup-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('signup-msg');
      var nameEl = document.getElementById('s-name'), phoneEl = document.getElementById('s-phone'), pwEl = document.getElementById('s-pw'), agree = document.getElementById('s-agree');
      var name = nameEl.value.trim(), phone = digits(phoneEl.value);
      if (!name) return fail(msg, '이름을 입력해 주세요.', nameEl);
      if (!/^01\d{8,9}$/.test(phone)) return fail(msg, '휴대폰 번호를 010-0000-0000처럼 입력해 주세요.', phoneEl);
      if (pwEl.value.length < 6) return fail(msg, '비밀번호는 6자 이상으로 정해 주세요.', pwEl);
      if (!agree.checked) return fail(msg, '이름과 휴대폰 번호 사용에 동의해 주세요.', agree);
      if (store.users.some(function (u) { return u.phone === phone; })) return fail(msg, '이미 가입한 번호예요. 로그인 탭에서 들어와 주세요.', phoneEl);
      hashPw(phone, pwEl.value).then(function (h) {
        store.users.push({ name: name, phone: phone, pw: h });
        store.session = phone;
        if (!saveStore()) return fail(msg, '이 브라우저에서는 저장할 수 없어요. 개인정보 보호 모드라면 일반 창에서 열어 주세요.');
        signedIn();
      });
    });
    document.getElementById('logout').addEventListener('click', function () {
      delete store.session; saveStore(); backToLogin();
    });
    document.getElementById('reset-demo').addEventListener('click', function () {
      if (!window.confirm('이 브라우저에 저장된 데모 가입 정보와 예약을 모두 지울까요?')) return;
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      store = loadStore(); backToLogin();
    });
    if (location.hash === '#signup') document.getElementById('t-signup').click();
    showMe(false);
  }
  function renderMyBookings() {
    var box = document.getElementById('my-bookings');
    if (!box) return;
    var mine = store.bookings.filter(function (b) { return b.phone === store.session; });
    var now = new Date();
    var upcoming = mine.filter(function (b) { return startOf(b.date, b.time) > now; });
    if (!upcoming.length) { box.innerHTML = '<p class="empty">다가오는 예약이 없어요. 시간표에서 듣고 싶은 수업을 골라 보세요.</p>'; return; }
    upcoming.sort(function (a, b) { return startOf(a.date, a.time) - startOf(b.date, b.time); });
    box.innerHTML = '<ul class="my-list">' + upcoming.map(function (b, i) {
      var ok = canCancel(b);
      return '<li><div><p class="my-when">' + longDate(b.date, b.time) + '</p><p class="my-what">' + b.cls + '<span>' + b.who + ' 강사</span></p></div>' +
        (ok ? '<button type="button" class="link link-btn" data-cancel="' + i + '">취소</button>' : '<span class="muted my-lock">취소 기한이 지났어요</span>') + '</li>';
    }).join('') + '</ul>';
    box.querySelectorAll('[data-cancel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var b = upcoming[Number(btn.dataset.cancel)];
        if (!window.confirm(longDate(b.date, b.time) + ' ' + b.cls + ' 예약을 취소할까요?')) return;
        cancelBooking(b); renderMyBookings();
        var h = document.querySelector('.me-sub'); if (h) { h.tabIndex = -1; h.focus(); }
      });
    });
  }

  /* ---------- Timetable and booking (example data) ---------- */

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function weekMonday(offset) {
    // Sunday is closed, so on a Sunday "this week" means the week starting tomorrow.
    var d = new Date(); d.setHours(0, 0, 0, 0);
    var back = d.getDay() === 0 ? -1 : d.getDay() - 1;
    d.setDate(d.getDate() - back + offset * 7);
    return d;
  }
  function dateOf(monday, day) { var d = new Date(monday); d.setDate(d.getDate() + OPEN_DAYS.indexOf(day)); return d; }
  function startOf(date, time) { var d = new Date(date + 'T00:00'); d.setHours(Number(time.slice(0, 2)), Number(time.slice(3, 5))); return d; }
  function longDate(date, time) { var d = new Date(date + 'T00:00'); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + DAYS[d.getDay()] + ')' + (time ? ' ' + time : ''); }
  function shortDate(d) { return (d.getMonth() + 1) + '/' + d.getDate(); }
  function myBooking(date, time) {
    return store.bookings.filter(function (b) { return b.phone === store.session && b.date === date && b.time === time; })[0] || null;
  }
  function canCancel(b) { return startOf(b.date, b.time) - new Date() > CANCEL_HOURS * 3600 * 1000; }
  function cancelBooking(b) {
    store.bookings = store.bookings.filter(function (x) { return x !== b; });
    saveStore();
  }
  // What a slot looks like for this visitor on a given date.
  function slotState(slot, date) {
    var mine = myBooking(date, slot.time);
    if (startOf(date, slot.time) <= new Date()) return { key: 'past', text: '지난 수업' };
    if (mine) return { key: 'mine', text: '예약했어요', booking: mine };
    if (slot.left === 0) return { key: 'full', text: '마감' };
    return { key: 'open', text: slot.left + '자리 남음', few: slot.left === 1 };
  }

  var schedule = document.getElementById('schedule');
  if (schedule) {
    var weekOffset = 0;
    var grid = document.getElementById('week-grid');
    var tt = document.getElementById('timetable');
    var dayList = document.getElementById('days');
    var status = document.getElementById('booking-status');
    var dlg = document.getElementById('booking-dialog');
    var currentDay = todayName === '일' ? '월' : todayName;
    var times = SLOTS.map(function (x) { return x.time; }).filter(function (t, i, a) { return a.indexOf(t) === i; }).sort();

    function slotButton(slot, date, st, extraClass) {
      var label = longDate(date, slot.time) + ' ' + slot.cls + ', ' + slot.who + ' 강사, ' + st.text;
      var inner = '<span class="cell-cls">' + slot.cls + '</span><span class="cell-who">' + slot.who + ' 강사</span>' +
        '<span class="left' + (st.few ? ' few' : '') + (st.key === 'full' ? ' full' : '') + '">' + st.text + '</span>';
      var cls = extraClass + ' is-' + st.key;
      if (st.key === 'past' || st.key === 'full') return '<div class="' + cls + '">' + inner + '</div>';
      return '<button type="button" class="' + cls + '" data-date="' + date + '" data-time="' + slot.time + '" aria-label="' + label + '">' + inner + '</button>';
    }

    function renderGrid() {
      var monday = weekMonday(weekOffset);
      var head = '<thead><tr><th scope="col"><span class="sr-only">시간</span></th>' + OPEN_DAYS.map(function (d) {
        var isToday = weekOffset === 0 && d === todayName;
        return '<th scope="col"' + (isToday ? ' class="is-today"' : '') + '>' + d + ' <span class="th-date">' + shortDate(dateOf(monday, d)) + '</span>' + (isToday ? '<span class="today-tag">오늘</span>' : '') + '</th>';
      }).join('') + '</tr></thead>';
      var rows = times.map(function (t) {
        return '<tr><th scope="row">' + t + '</th>' + OPEN_DAYS.map(function (d) {
          var slot = SLOTS.filter(function (s) { return s.day === d && s.time === t; })[0];
          var td = weekOffset === 0 && d === todayName ? '<td class="is-today">' : '<td>';
          if (!slot) return td + '<span class="sr-only">수업 없음</span></td>';
          var date = isoDate(dateOf(monday, d));
          return td + slotButton(slot, date, slotState(slot, date), 'cell') + '</td>';
        }).join('') + '</tr>';
      }).join('');
      grid.querySelectorAll('thead, tbody').forEach(function (el) { el.remove(); });
      grid.insertAdjacentHTML('beforeend', head + '<tbody>' + rows + '</tbody>');
    }

    function renderDay(animate) {
      var monday = weekMonday(weekOffset);
      var date = isoDate(dateOf(monday, currentDay));
      var rows = SLOTS.filter(function (s) { return s.day === currentDay; }).sort(function (a, b) { return a.time < b.time ? -1 : 1; });
      var headline = '<p class="day-date">' + longDate(date) + '</p>';
      if (currentDay === '일' || !rows.length) { tt.innerHTML = '<p class="empty">일요일은 쉬어요. 월요일 아침 7시에 첫 수업이 있어요.</p>'; return; }
      tt.innerHTML = headline + rows.map(function (r) {
        return '<div class="slot"><time>' + r.time + '</time>' + slotButton(r, date, slotState(r, date), 'slot-body') + '</div>';
      }).join('');
      if (animate) { tt.classList.remove('switched'); void tt.offsetWidth; tt.classList.add('switched'); }
    }

    function renderAll() {
      var monday = weekMonday(weekOffset), sat = dateOf(monday, '토');
      document.getElementById('week-range').textContent = (monday.getMonth() + 1) + '월 ' + monday.getDate() + '일 – ' + (sat.getMonth() + 1) + '월 ' + sat.getDate() + '일';
      schedule.querySelectorAll('[data-week]').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.week) === weekOffset)); });
      renderGrid(); renderDay(false);
      dayList.querySelectorAll('.today-mark').forEach(function (m) { m.hidden = !(weekOffset === 0 && m.parentNode.dataset.day === todayName); });
    }

    schedule.querySelector('.week-seg').addEventListener('click', function (e) {
      var b = e.target.closest('[data-week]'); if (!b) return;
      weekOffset = Number(b.dataset.week); renderAll();
    });
    dayList.addEventListener('tabchange', function (e) { currentDay = e.detail.dataset.day; renderDay(true); });

    // Booking dialog
    var lastTrigger = null;
    function openDialog(html) {
      dlg.querySelector('.dlg-body').innerHTML = html;
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      var first = dlg.querySelector('[data-autofocus]') || dlg.querySelector('button, a');
      if (first) first.focus();
    }
    function closeDialog() {
      if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    }
    dlg.addEventListener('close', function () { if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus(); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) return closeDialog(); // click on the dim background
      var act = e.target.closest('[data-act]'); if (!act) return;
      var date = dlg.dataset.date, time = dlg.dataset.time;
      var slot = SLOTS.filter(function (s) { return s.day === DAYS[new Date(date + 'T00:00').getDay()] && s.time === time; })[0];
      if (act.dataset.act === 'close') return closeDialog();
      if (act.dataset.act === 'book') {
        store.bookings.push({ phone: store.session, date: date, time: time, cls: slot.cls, who: slot.who, at: Date.now() });
        saveStore();
        status.textContent = longDate(date, time) + ' ' + slot.cls + ' 수업을 예약했어요.';
      }
      if (act.dataset.act === 'cancel') {
        cancelBooking(myBooking(date, time));
        status.textContent = longDate(date, time) + ' ' + slot.cls + ' 예약을 취소했어요.';
      }
      renderAll();
      lastTrigger = Array.prototype.filter.call(schedule.querySelectorAll('[data-date="' + date + '"][data-time="' + time + '"]'), function (el) { return el.offsetParent !== null; })[0] || lastTrigger;
      closeDialog();
    });

    schedule.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-date]'); if (!btn) return;
      lastTrigger = btn;
      var date = btn.dataset.date, time = btn.dataset.time;
      var slot = SLOTS.filter(function (s) { return s.day === DAYS[new Date(date + 'T00:00').getDay()] && s.time === time; })[0];
      var st = slotState(slot, date);
      dlg.dataset.date = date; dlg.dataset.time = time;
      var what = '<p class="dlg-when">' + longDate(date, time) + ', 50분</p><h2 id="dlg-title">' + slot.cls + '</h2><p class="dlg-who">' + slot.who + ' 강사</p>';
      var user = me();
      if (!user) {
        var back = encodeURIComponent('classes.html#schedule');
        openDialog(what + '<p class="dlg-text">예약하려면 로그인이 필요해요. 처음이라면 1분 만에 가입할 수 있어요.</p>' +
          '<div class="dlg-actions"><a class="btn btn-solid" data-autofocus href="account.html?next=' + back + '">로그인</a><a class="btn btn-line" href="account.html?next=' + back + '#signup">회원가입</a><button type="button" class="link link-btn" data-act="close">닫기</button></div>');
        return;
      }
      if (st.key === 'mine') {
        var ok = canCancel(st.booking);
        openDialog(what + '<p class="dlg-text">' + (ok ? '예약한 수업이에요. 취소하면 자리가 다른 분께 돌아가요.' : '수업 ' + CANCEL_HOURS + '시간 전이 지나서 취소할 수 없어요. 스튜디오로 연락해 주세요.') + '</p>' +
          '<div class="dlg-actions">' + (ok ? '<button type="button" class="btn btn-line" data-act="cancel">예약 취소하기</button>' : '') + '<button type="button" class="link link-btn" data-act="close" data-autofocus>닫기</button></div>');
        return;
      }
      openDialog(what + '<p class="dlg-text">' + user.name + '님 이름으로 예약할까요? 지금 ' + slot.left + '자리 남았어요. 취소는 수업 ' + CANCEL_HOURS + '시간 전까지 할 수 있어요.</p>' +
        '<div class="dlg-actions"><button type="button" class="btn btn-solid" data-act="book" data-autofocus>예약하기</button><button type="button" class="link link-btn" data-act="close">닫기</button></div>');
    });

    renderAll();
    var startTab = dayList.querySelector('[data-day="' + currentDay + '"]');
    if (startTab) startTab.click();
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
  var seg = document.getElementById('price-body') && document.querySelector('.seg');
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
      var first = null; // first empty field, in screen order, gets the focus
      function miss(label, el) { missing.push(label); if (!first) first = el; }
      form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
      if (!form.querySelector('input[name="class"]:checked')) miss('수업', form.querySelector('input[name="class"]'));
      var day = date.value ? new Date(date.value + 'T00:00').getDay() : null;
      if (!date.value) { miss('날짜', date); date.setAttribute('aria-invalid', 'true'); }
      else if (day === 0) { msg.textContent = '일요일은 쉬어요. 다른 날을 골라 주세요.'; msg.className = 'form-msg err'; date.setAttribute('aria-invalid', 'true'); date.focus(); return; }
      var timeEl = form.querySelector('input[name="time"]:checked');
      if (!timeEl) miss('시간대', form.querySelector('input[name="time"]'));
      else if (day === 6 && timeEl.value === '저녁') { msg.textContent = '토요일은 17시까지 열어요. 오전이나 오후를 골라 주세요.'; msg.className = 'form-msg err'; timeEl.focus(); return; }
      ['t-name', 't-phone'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el.value.trim()) { miss(el.dataset.label, el); el.setAttribute('aria-invalid', 'true'); }
      });
      if (!document.getElementById('t-agree').checked) miss('개인정보 동의', document.getElementById('t-agree'));
      if (missing.length) {
        msg.textContent = '아직 비어 있는 항목이 있어요: ' + missing.join(', ');
        msg.className = 'form-msg err';
        first.focus();
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
