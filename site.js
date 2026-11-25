(function(){
  var c = window.SITE || {};
  document.querySelectorAll('[data-store]').forEach(function(a){
    if (c.storeUrl) { a.href = c.storeUrl; }
    else { a.textContent = 'Binnenkort in de App Store'; a.setAttribute('aria-disabled','true'); a.removeAttribute('href'); }
  });
  if (c.price) {
    document.querySelectorAll('[data-price]').forEach(function(e){ e.textContent = c.price; e.hidden = false; });
    document.querySelectorAll('[data-price-note]').forEach(function(e){ e.hidden = false; });
  }
})();
