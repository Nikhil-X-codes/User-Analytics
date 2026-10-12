(function () {
  "use strict";

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
    } catch (e) {
      /* ignore storage access restrictions */
    }
    return true;
  }

  if (!isTrackingAllowed()) {
    return;
  }

  var currentScript =
    typeof document !== "undefined"
      ? document.currentScript || document.querySelector('script[src*="tracker.js"]')
      : null;
  var customHost =
    (currentScript && currentScript.getAttribute("data-api")) ||
    (typeof window !== "undefined" && window.__CF_API_HOST);
  var host = "";
  if (currentScript && currentScript.src) {
    try {
      var parsed = new URL(currentScript.src, typeof window !== "undefined" ? window.location.href : undefined);
      if (parsed.origin && parsed.origin !== "null") {
        host = parsed.origin;
      }
    } catch (e) {}
  }
  var localOrigin =
    typeof window !== "undefined" && window.location.origin && window.location.origin !== "null"
      ? window.location.origin
      : "";
  var baseHost = customHost || host || localOrigin || "http://localhost:3000";
  var ENDPOINT = baseHost.replace(/\/+$/, "") + "/api/events";
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

      if (typeof fetch === "function") {
        fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(function () {});
      } else if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
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
})();
