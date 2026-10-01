// Paylaşım linki sayfası (s/ = istasyon, p/ = podcast). Uygulama yüklüyse iOS bu adresi
// Universal Link olarak doğrudan uygulamada açar; bu sayfa yalnız uygulama yokken görünür.
(function () {
  var kind = document.body.getAttribute('data-kind');
  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  var episode = params.get('e');
  var tr = (navigator.language || '').toLowerCase().indexOf('tr') === 0;
  var t = tr ? {
    station: 'Radyo istasyonu', podcast: 'Podcast', open: 'CarWave’de aç', get: 'App Store’dan indir',
    missing: 'Bu bağlantı eksik ya da artık geçerli değil.', lead: 'CarWave ile dinle: canlı radyo ve podcast, CarPlay ve Apple Watch.'
  } : {
    station: 'Radio station', podcast: 'Podcast', open: 'Open in CarWave', get: 'Download on the App Store',
    missing: 'This link is incomplete or no longer valid.', lead: 'Listen with CarWave: live radio and podcasts, CarPlay and Apple Watch.'
  };
  document.documentElement.lang = tr ? 'tr' : 'en';
  var $ = function (s) { return document.querySelector(s); };
  $('#kind').textContent = kind === 's' ? t.station : t.podcast;
  $('#lead').textContent = t.lead;
  $('#get').textContent = t.get;
  var open = $('#open');
  open.textContent = t.open;
  if (!id) { $('#title').textContent = t.missing; open.style.display = 'none'; return; }
  open.href = 'carwave://' + kind + '?id=' + encodeURIComponent(id) + (episode ? '&e=' + encodeURIComponent(episode) : '');

  function show(title, subtitle, image) {
    $('#title').textContent = title || '';
    $('#subtitle').textContent = subtitle || '';
    document.title = (title ? title + ' · ' : '') + 'CarWave';
    if (image) { var img = $('#art'); img.src = image; img.style.display = 'block'; }
  }

  if (kind === 's') {
    fetch('https://de1.api.radio-browser.info/json/stations/byuuid/' + encodeURIComponent(id))
      .then(function (r) { return r.json(); })
      .then(function (list) {
        var s = list && list[0];
        if (!s) { show(t.missing); return; }
        show(s.name, [s.country, s.tags && s.tags.split(',').slice(0, 2).join(', ')].filter(Boolean).join(' · '), s.favicon);
      })
      .catch(function () { show(''); });
  } else {
    // iTunes Lookup CORS vermiyor; JSONP.
    window.__cw = function (data) {
      var p = data && data.results && data.results[0];
      if (!p) { show(t.missing); return; }
      show(p.collectionName, p.artistName, p.artworkUrl600 || p.artworkUrl100);
    };
    var script = document.createElement('script');
    script.src = 'https://itunes.apple.com/lookup?entity=podcast&callback=__cw&id=' + encodeURIComponent(id);
    document.body.appendChild(script);
  }
})();
