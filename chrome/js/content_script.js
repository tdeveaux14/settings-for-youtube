const settingsForYouTube = function (items) {
  'use strict';
  let player = {};
  let done = false;

  function setStorage(key, value) {
    try {
      const storage = window.localStorage;
      if (value) {
        storage.setItem(key, value);
      } else {
        storage.removeItem(key);
      }
    } catch (ignore) {}
  }

  function modArgs(args) {
    const timestamp = Date.now();
    if (args.raw_player_response) {
      let playerResponse = args.raw_player_response;
      if (playerResponse.adPlacements && items.ad3_module === '0') {
        delete playerResponse.adPlacements;
      }
      if (items.paid_content_overlay_duration_ms === '0') {
        delete playerResponse.paidContentOverlay;
      }
      if (items.loudness === '0') {
        if (playerResponse.playerConfig) {
          let audioConfig = playerResponse.playerConfig.audioConfig;
          if (audioConfig.loudnessDb > 0) {
            delete audioConfig.loudnessDb;
            delete audioConfig.perceptualLoudnessDb;
          }
        }
        if (
          playerResponse.streamingData &&
          playerResponse.streamingData.adaptiveFormats
        ) {
          let i = 0;
          let adaptiveFormats = playerResponse.streamingData.adaptiveFormats;
          while (i < adaptiveFormats.length) {
            if (adaptiveFormats[i].loudnessDb > 0) {
              delete adaptiveFormats[i].loudnessDb;
            }
            i += 1;
          }
        }
      }
      if (playerResponse.captions && items.cc_load_policy === '2') {
        setStorage(
          'yt-html5-player-modules::subtitlesModuleData::module-enabled',
          'false'
        );
      } else {
        setStorage(
          'yt-html5-player-modules::subtitlesModuleData::module-enabled'
        );
      }
      if (items.suppress_creator_endscreen === '1') {
        delete playerResponse.endscreen;
      }
    }
    if (items.iv_load_policy === '3') {
      args.iv_load_policy = '3';
    }
    if (items.suggestedQuality !== 'auto') {
      setStorage('yt-player-quality', JSON.stringify({
        data: items.suggestedQuality,
        expiration: timestamp + 2592E6,
        creation: timestamp
      }));
      args.suggestedQuality = items.suggestedQuality;
    } else {
      setStorage('yt-player-quality');
    }
    if (items.suppress_creator_endscreen === '1') {
      args.suppress_creator_endscreen = '1';
    }
    if (items.autonav === '1') {
      setStorage('yt.autonav::autonav_disabled', JSON.stringify({
        data: true,
        expiration: timestamp + 31104E6,
        creation: timestamp
      }));
    } else {
      setStorage('yt.autonav::autonav_disabled');
    }
    return args;
  }

  function closeTip(event) {
    if (event.target.getAttribute('force-close-on-outside-click')) {
      document.body.click();
    }
  }

  function modCreateAlternate(original) {
    return function (playerId, config, ...args) {
      if (config && config.args) {
        modArgs(config.args);
      }
      window.yt.player.Application.createAlternate = original;
      return original(playerId, config, ...args);
    };
  }

  function checkCreateAlternate() {
    if (
      window.yt &&
      window.yt.player &&
      window.yt.player.Application &&
      window.yt.player.Application.createAlternate
    ) {
      window.yt.player.Application.createAlternate = modCreateAlternate(
        window.yt.player.Application.createAlternate
      );
      document.removeEventListener('load', checkCreateAlternate, true);
    }
  }

  function handleGlobalKeydown(event) {
    const tagNames = ['INPUT', 'TEXTAREA'];
    if (
      window.location.pathname === '/watch' && player &&
      !tagNames.includes(document.activeElement.tagName) && !event.ctrlKey &&
      !event.metaKey
    ) {
      if (
        (event.keyCode === 32 || event.keyCode === 75) && player.getPlayerState
      ) {
        if (player.getPlayerState() !== 1) {
          if (player.playVideo) {
            player.playVideo();
          }
        } else {
          if (player.pauseVideo) {
            player.pauseVideo();
          }
        }
      } else if (event.keyCode === 35 && player.seekTo) {
        player.seekTo(window.Infinity, true);
      } else if (event.keyCode === 36 && player.seekTo) {
        player.seekTo(0, true);
      } else if (
        event.keyCode === 37 && player.seekTo && player.getCurrentTime
      ) {
        player.seekTo(player.getCurrentTime() - 5, true);
      } else if (event.keyCode === 38 && player.setVolume && player.getVolume) {
        player.setVolume(Math.min(player.getVolume() + 5, 100));
      } else if (
        event.keyCode === 39 && player.seekTo && player.getCurrentTime
      ) {
        player.seekTo(player.getCurrentTime() + 5, true);
      } else if (event.keyCode === 40 && player.setVolume && player.getVolume) {
        player.setVolume(Math.max(player.getVolume() - 5, 0));
      } else if (
        48 <= event.keyCode && 57 >= event.keyCode && player.seekTo &&
        player.getDuration
      ) {
        player.seekTo((event.keyCode - 48) / 10 * player.getDuration(), true);
      } else if (
        event.keyCode === 74 && player.seekTo && player.getCurrentTime
      ) {
        player.seekTo(player.getCurrentTime() - 10, true);
      } else if (
        event.keyCode === 76 && player.seekTo && player.getCurrentTime
      ) {
        player.seekTo(player.getCurrentTime() + 10, true);
      } else if (
        event.keyCode === 77 && player.isMuted && player.mute && player.unMute
      ) {
        if (player.isMuted()) {
          player.unMute();
        } else {
          player.mute();
        }
      } else if (
        96 <= event.keyCode && 105 >= event.keyCode && player.seekTo &&
        player.getDuration
      ) {
        player.seekTo((event.keyCode - 96) / 10 * player.getDuration(), true);
      } else {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function setPlaybackQuality(suggestedQuality) {
    if (
      player &&
      player.getAvailableQualityLevels &&
      player.setPlaybackQualityRange
    ) {
      let i = 0;
      const qualityLevels = [
        'highres',
        'hd2880',
        'hd2160',
        'hd1440',
        'hd1080',
        'hd720',
        'large',
        'medium',
        'small',
        'tiny'
      ];
      const availableQualityLevels = player.getAvailableQualityLevels();
      while (i < qualityLevels.length) {
        if (availableQualityLevels.includes(suggestedQuality)) {
          player.setPlaybackQualityRange(suggestedQuality);
          break;
        }
        if (suggestedQuality === 'tiny') {
          suggestedQuality = 'small';
        } else {
          suggestedQuality = qualityLevels[
            qualityLevels.indexOf(suggestedQuality) + 1
          ];
        }
        i += 1;
      }
    }
  }

  function onPlayerStateChange(event) {
    if (event === -1) {
      done = false;
    } else if (event === 1 && !done) {
      if (
        items.iv_load_policy === '3' && player && player.unloadModule &&
        player.updateVideoData
      ) {
        player.unloadModule('annotations_module');
        player.updateVideoData();
      }
      setPlaybackQuality(items.suggestedQuality);
      done = true;
    }
  }

  function onPlayerReady() {
    player = document.getElementById('movie_player');
    if (items.autohide === '3') {
      document.addEventListener('keydown', handleGlobalKeydown, true);
    }
    if (
      (items.iv_load_policy === '3' || items.suggestedQuality !== 'auto') &&
      player
    ) {
      player.addEventListener('onStateChange', onPlayerStateChange);
    }
  }

  function checkPlayer() {
    if (document.getElementById('movie_player')) {
      onPlayerReady();
      document.removeEventListener('load', checkPlayer, true);
    }
  }

  function shareOnPlayerReady(original) {
    return function (...args) {
      onPlayerReady();
      if (original) {
        return original(...args);
      }
    };
  }

  function main() {
    Object.defineProperties(Object.prototype, {
      player: {
        get: function getPlayer() {
          return this.player_;
        },
        set: function setPlayer(value) {
          if (value && value.args) {
            modArgs(value.args);
          }
          this.player_ = value;
        }
      }
    });
    if (items.suppress_tips === '1') {
      document.addEventListener('iron-overlay-opened', closeTip);
    }
    document.addEventListener('load', checkCreateAlternate, true);
    document.addEventListener('load', checkPlayer, true);
    window.onYouTubePlayerReady = shareOnPlayerReady(
      window.onYouTubePlayerReady
    );
    if (items.autonav === '1') {
      window.ytglobal = window.ytglobal || {};
      window.ytglobal.prefsUserPrefsPrefs_ = window.ytglobal
        .prefsUserPrefsPrefs_ || {};
      window.ytglobal.prefsUserPrefsPrefs_.f5 = '30000';
    }
  }

  main();
};

function setAutoplayState(state) {
  'use strict';
  let temp = document.cookie.split(/PREF=([^;]+)/)[1] || 'f1=50000000';
  let i = 0;
  let pair = [];
  let prefs = {};
  let cookie = 'PREF=';
  temp = temp.split('&');
  while (i < temp.length) {
    pair = temp[i].split('=');
    prefs[pair[0]] = pair[1];
    i += 1;
  }
  if (state === '1') {
    prefs.f5 = '30000';
  } else {
    delete prefs.f5;
  }
  temp = Object.keys(prefs);
  cookie += temp[0] + '=' + prefs[temp[0]];
  i = 1;
  while (i < temp.length) {
    cookie += '&' + temp[i] + '=' + prefs[temp[i]];
    i += 1;
  }
  cookie += '; domain=.youtube.com; path=/; expires=';
  document.cookie = cookie + new Date(Date.now() + 63072E6).toUTCString();
}

function main(items) {
  'use strict';
  let script = document.createElement('script');
  setAutoplayState(items.autonav);
  script.textContent = '(' + settingsForYouTube + '(' + JSON.stringify(
    items,
    null,
    2
  ) + '));';
  document.head.appendChild(script);
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
  suppress_creator_endscreen: '0',
  autonav: '2'
}, main);
