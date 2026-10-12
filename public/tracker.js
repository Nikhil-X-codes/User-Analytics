(function () {
  "use strict";

  var _selfScript = document.currentScript;

  function isTrackingAllowed() {
    try {
      if (
        (typeof navigator !== "undefined" && (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true)) ||
        (typeof window !== "undefined" && window.doNotTrack === "1")
      ) {
        return false;
      }
      if (typeof localStorage !== "undefined" && localStorage.getItem("cf_opt_out") === "true") {
        return false;
      }
      if (typeof window !== "undefined" && window.__CF_ANALYTICS_OPT_OUT === true) {
        return false;
      }
    } catch (e) {}
    return true;
  }

  if (!isTrackingAllowed()) {
    return;
  }

  function resolveEndpoint() {
    var scriptEl =
      _selfScript ||
      document.querySelector('script[src*="tracker.js"]') ||
      document.querySelector('script[data-api]');

    var dataApi = scriptEl && scriptEl.getAttribute("data-api");
    if (dataApi) {
      return dataApi.replace(/\/+$/, "") + "/api/events";
    }
    if (scriptEl && scriptEl.src) {
      try {
        var srcUrl = new URL(scriptEl.src, window.location.href);
        if (srcUrl.origin && srcUrl.origin !== "null") {
          return srcUrl.origin + "/api/events";
        }
      } catch (e) {}
    }
    var winOrigin =
      typeof window !== "undefined" &&
      window.location.origin &&
      window.location.origin !== "null"
        ? window.location.origin
        : "";
    if (winOrigin) {
      return winOrigin + "/api/events";
    }
    return "/api/events";
  }

  var ENDPOINT = resolveEndpoint();
  var STORAGE_KEY = "cf_session_id";

  function getSessionId() {
    try {
      var id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        id =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
        localStorage.setItem(STORAGE_KEY, id);
      }
      return id;
    } catch (e) {
      return "mem-" + Date.now().toString(36);
    }
  }

  function sendEvent(data) {
    try {
      var payload = JSON.stringify(data);

      // sendBeacon is best for page unloads and never triggers a blocking preflight
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        var blob = new Blob([payload], { type: "text/plain" });
        var sent = navigator.sendBeacon(ENDPOINT, blob);
        if (sent) return;
      }

      if (typeof fetch === "function") {
        fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: payload,
          keepalive: true,
          mode: "cors",
          credentials: "omit",
        }).catch(function () {});
      }
    } catch (e) {}
  }

  var sessionId = getSessionId();
  var lastTrackedUrl = "";
  var lastTrackedTime = 0;

  function trackPageView() {
    var currentUrl = window.location.href;
    var now = Date.now();
    if (currentUrl === lastTrackedUrl && now - lastTrackedTime < 300) {
      return;
    }
    lastTrackedUrl = currentUrl;
    lastTrackedTime = now;
    sendEvent({
      sessionId: sessionId,
      eventType: "page_view",
      pageUrl: currentUrl,
      timestamp: new Date().toISOString(),
    });
  }

  function trackClick(e) {
    var x = Math.round(e.pageX || 0);
    var y = Math.round(e.pageY || 0);
    sendEvent({
      sessionId: sessionId,
      eventType: "click",
      pageUrl: window.location.href,
      timestamp: new Date().toISOString(),
      x: x,
      y: y,
    });
  }

  function init() {
    trackPageView();
    document.addEventListener("click", trackClick, { passive: true });

    var _pushState = history.pushState.bind(history);
    history.pushState = function () {
      _pushState.apply(history, arguments);
      trackPageView();
    };

    var _replaceState = history.replaceState.bind(history);
    history.replaceState = function () {
      _replaceState.apply(history, arguments);
      trackPageView();
    };

    window.addEventListener("popstate", trackPageView);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
