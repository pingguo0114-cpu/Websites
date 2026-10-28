// Highlight today's opening hours and handle the demo reservation form.
(function () {
  var day = new Date().getDay(); // 0 = Sunday
  var rows = document.querySelectorAll('.hours tr[data-days]');
  rows.forEach(function (row) {
    if (row.dataset.days.split(',').indexOf(String(day)) !== -1) row.classList.add('is-today');
  });
  var status = document.getElementById('today-status');
  if (status && day === 1) {
    status.textContent = '오늘은 정기 휴무예요. 내일 아침 9시에 만나요.';
    status.hidden = false;
  }

  var form = document.getElementById('reserve-form');
  if (!form) return;
  var dateInput = document.getElementById('r-date');
  var today = new Date();
  dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var error = document.getElementById('form-error');
    var done = document.getElementById('form-done');
    var missing = [];
    form.querySelectorAll('[required]').forEach(function (el) {
      var empty = !el.value.trim();
      el.setAttribute('aria-invalid', empty ? 'true' : 'false');
      if (empty) missing.push(form.querySelector('label[for="' + el.id + '"]').textContent);
    });
    if (!missing.length && dateInput.value && new Date(dateInput.value + 'T00:00').getDay() === 1) {
      dateInput.setAttribute('aria-invalid', 'true');
      error.textContent = '월요일은 정기 휴무예요. 다른 날을 골라 주세요.';
      error.hidden = false; done.hidden = true;
      return;
    }
    if (missing.length) {
      error.textContent = '비어 있는 칸이 있어요: ' + missing.join(', ');
      error.hidden = false; done.hidden = true;
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    error.hidden = true;
    done.textContent = '예약 요청을 받았어요. (컨셉 사이트라 실제로 전송되지는 않아요)';
    done.hidden = false;
  });
})();
