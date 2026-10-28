import { $, $$ } from './dom.js';
export function initKnowledge() {
  /* One filter state: category and query always apply together. */
  var activeBlogCategory = 'all',
    blogSearch = $('#blogSearch');
  function filterBlog() {
    var query = blogSearch ? blogSearch.value.trim().toLowerCase() : '',
      count = 0;
    $$('.blog-card').forEach(function (card) {
      var visible =
        (activeBlogCategory === 'all' ||
          card.dataset.category === activeBlogCategory) &&
        (!query || card.textContent.toLowerCase().includes(query));
      card.hidden = !visible;
      if (visible) count++;
    });
    var results = $('#blogResultsStatus');
    if (results)
      results.textContent = count
        ? count + ' articles found'
        : 'No articles match. Try another topic or clear your search.';
  }
  $$('.blog-filter-btn').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    btn.addEventListener('click', function () {
      activeBlogCategory = btn.dataset.filter || 'all';
      $$('.blog-filter-btn').forEach(function (other) {
        other.classList.toggle('active', other === btn);
        other.setAttribute('aria-pressed', String(other === btn));
      });
      filterBlog();
    });
  });
  if (blogSearch) blogSearch.addEventListener('input', filterBlog);
  $$('.blog-card').forEach(function (card, index) {
    var btn = $('.blog-read-btn', card),
      drawer = $('.blog-drawer', card);
    if (!btn || !drawer) return;
    drawer.id = 'memo-content-' + index;
    btn.setAttribute('aria-controls', drawer.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close Memo ↑' : 'Read Memo →';
    });
  });
}
