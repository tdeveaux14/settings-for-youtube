(function () {
  'use strict';

  function restoreOptions(items) {
    document.getElementById('suppress_tips').checked = items
      .suppress_tips === '0';
    document.getElementById('ad3_module').checked = items.ad3_module === '1';
    document.getElementById('paid_content_overlay_duration_ms').checked = items
      .paid_content_overlay_duration_ms === '20000';
    document.getElementById('suggestedQuality').value = items.suggestedQuality;
    document.getElementById('loudness').checked = items.loudness === '1';
    document.getElementById('cc_load_policy').checked = items
      .cc_load_policy === '0';
    document.getElementById('iv_load_policy').checked = items
      .iv_load_policy === '1';
    document.getElementById('autohide').checked = items.autohide === '3';
    document.getElementById('youthere').checked = items.youthere === '1';
    document.getElementById('suppress_creator_endscreen').checked = items
      .suppress_creator_endscreen === '0';
    document.getElementById('autonav').checked = items.autonav === '2';
  }

  function saveOptions() {
    let items = {};
    if (document.getElementById('suppress_tips').checked) {
      items.suppress_tips = '0';
    } else {
      items.suppress_tips = '1';
    }
    if (document.getElementById('ad3_module').checked) {
      items.ad3_module = '1';
    } else {
      items.ad3_module = '0';
    }
    if (document.getElementById('paid_content_overlay_duration_ms').checked) {
      items.paid_content_overlay_duration_ms = '20000';
    } else {
      items.paid_content_overlay_duration_ms = '0';
    }
    if (document.getElementById('iv_load_policy').checked) {
      items.iv_load_policy = '1';
    } else {
      items.iv_load_policy = '3';
    }
    if (document.getElementById('loudness').checked) {
      items.loudness = '1';
    } else {
      items.loudness = '0';
    }
    if (document.getElementById('cc_load_policy').checked) {
      items.cc_load_policy = '0';
    } else {
      items.cc_load_policy = '2';
    }
    items.suggestedQuality = document.getElementById('suggestedQuality').value;
    if (document.getElementById('autohide').checked) {
      items.autohide = '3';
    } else {
      items.autohide = '1';
    }
    if (document.getElementById('youthere').checked) {
      items.youthere = '1';
    } else {
      items.youthere = '0';
    }
    if (document.getElementById('suppress_creator_endscreen').checked) {
      items.suppress_creator_endscreen = '0';
    } else {
      items.suppress_creator_endscreen = '1';
    }
    if (document.getElementById('autonav').checked) {
      items.autonav = '2';
    } else {
      items.autonav = '1';
    }
    window.chrome.storage.local.set(items);
  }

  function resetOptions() {
    window.chrome.storage.local.clear();
  }

  function main(items) {
    let i = 0;
    const elements = document.getElementsByTagName('*');
    while (i < elements.length) {
      if (elements[i].hasAttribute('i18n-content')) {
        elements[i].textContent = window.chrome.i18n.getMessage(
          elements[i].getAttribute('i18n-content')
        );
      }
      i += 1;
    }
    restoreOptions(items);
    document.forms[0].addEventListener('change', saveOptions);
    document.getElementById('reset-extension-options')
      .addEventListener('click', resetOptions);
  }

  window.chrome.storage.local.get({
    suppress_tips: '0',
    ad3_module: '1',
    paid_content_overlay_duration_ms: '20000',
    iv_load_policy: '1',
    loudness: '1',
    cc_load_policy: '0',
    suggestedQuality: 'auto',
    autohide: '1',
    youthere: '1',
    suppress_creator_endscreen: '0',
    autonav: '2'
  }, main);
}());
