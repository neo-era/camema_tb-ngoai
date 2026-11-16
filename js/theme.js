// Áp giao diện sáng/tối trước khi vẽ để không nháy màu.
(function () {
  var p = 'auto'; try { p = localStorage.getItem('tbn_theme') || 'auto'; } catch (e) {}
  var dark = p === 'dark' || (p === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();
