const revealTargets = document.querySelectorAll("[data-reveal]");
const parallaxTargets = document.querySelectorAll(".feature-frame, .collage-float, .kinetic-word");
const header = document.querySelector(".site-header");
const video = document.querySelector(".hero-video");
const trialForm = document.querySelector("[data-sample-form]");

const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const params = new URLSearchParams(window.location.search);
const utmData = {};

utmKeys.forEach((key) => {
  const value = params.get(key);
  if (value) utmData[key] = value;
});

if (Object.keys(utmData).length) {
  sessionStorage.setItem("carpediem_lp_utm", JSON.stringify(utmData));
}

const trackEvent = (eventName) => {
  if (!eventName) return;
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName);
  }
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName);
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
);

revealTargets.forEach((target, index) => {
  target.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  observer.observe(target);
});

const syncHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 28);
};

const syncParallax = () => {
  const vh = window.innerHeight || 1;
  parallaxTargets.forEach((target, index) => {
    const rect = target.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
    const strength = target.classList.contains("kinetic-word") ? 26 : 18 + (index % 3) * 8;
    target.style.setProperty("--parallax-y", `${progress * -strength}px`);
    target.style.transform = `translate3d(0, var(--parallax-y), 0)`;
  });
};

document.querySelectorAll("[data-track]").forEach((target) => {
  target.addEventListener("click", (event) => {
    if (target.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      return;
    }
    trackEvent(target.dataset.track);
  });
});

window.addEventListener("scroll", () => {
  syncHeader();
  syncParallax();
}, { passive: true });

window.addEventListener("resize", syncParallax);
syncHeader();
syncParallax();

if (video) {
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;

  const playHeroVideo = () => {
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {});
    }
  };

  window.addEventListener("load", playHeroVideo, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) playHeroVideo();
  });
  playHeroVideo();
}

if (trialForm) {
  trialForm.addEventListener("submit", (event) => {
    event.preventDefault();
    trackEvent("trial_submit");
    const status = trialForm.querySelector(".form-status");
    if (status) {
      status.textContent = "現在はサンプルです。正式公開時に体験予約システムへ接続します。";
    }
  });
}
