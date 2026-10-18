// Alexander Neumorphism Plus — дополнение к теме Alexander Neumorphism.
// Не меняет карточки. Делает три вещи и только там, где активна эта тема:
//   1) значок в кружке чёрный; лунка света разгорается вместе с яркостью (подсветка и свечение);
//   2) лунка иконки — вдавленная, в стиле темы;
//   3) ползунок — стеклянный и тоньше (30 px вместо 42 px).
(() => {
  if (window.__alexanderNeumorphismPlus) return;
  window.__alexanderNeumorphismPlus = "1.0.0";

  const FEATURE_HEIGHT = "30px";
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const themed = (el) => getComputedStyle(el).getPropertyValue("--neumorphic-base").trim() !== "";

  // ---------- Стеклянный ползунок ----------
  const sliderSheet = new CSSStyleSheet();
  sliderSheet.replaceSync(`
    :host {
      --control-slider-background: var(--neumorphic-surface-alt);
      --control-slider-background-opacity: 1;
      --control-slider-border-radius: 999px;
    }
    .container {
      --handle-size: calc(var(--control-slider-thickness) * .95);
      --handle-margin: calc(var(--control-slider-thickness) / 9);
    }
    :host([vertical]) .container {
      --handle-size: calc(var(--control-slider-thickness) * .3);
    }
    .slider .slider-track-background {
      /* плитка красит дорожку цветом лампы поверх :host — делаем её утопленной в цвет темы */
      background: var(--neumorphic-surface-alt) !important;
      opacity: 1 !important;
      box-shadow: var(--neumorphic-concave-shadow-sm);
    }
    .slider .slider-track-bar {
      --slider-track-bar-border-radius: 999px;
      background-image: linear-gradient(180deg, rgba(255, 255, 255, .55) 0%, rgba(255, 255, 255, .12) 46%,
        rgba(255, 255, 255, 0) 60%, rgba(0, 0, 0, .08) 100%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), inset 0 -1px 2px rgba(0, 0, 0, .18);
    }
    :host([vertical]) .slider .slider-track-bar {
      background-image: linear-gradient(90deg, rgba(255, 255, 255, .4) 0%, rgba(255, 255, 255, .1) 40%,
        rgba(255, 255, 255, 0) 60%, rgba(0, 0, 0, .06) 100%);
    }
    .slider .slider-track-bar::after {
      top: var(--handle-margin);
      bottom: var(--handle-margin);
      height: auto;
      border-radius: 999px;
      background: linear-gradient(180deg, #fff, rgba(255, 255, 255, .74));
      box-shadow: 0 1px 3px rgba(0, 0, 0, .28), inset 0 0 0 .5px #fff, inset 0 -1px 2px rgba(0, 0, 0, .1);
      transition: transform .16s cubic-bezier(.3, 1.6, .5, 1);
    }
    :host([vertical]) .slider .slider-track-bar::after {
      top: var(--handle-margin);
      bottom: initial;
      left: var(--handle-margin);
      right: var(--handle-margin);
      width: auto;
      height: var(--handle-size);
    }
    :host([vertical]) .slider .slider-track-bar.end::after {
      top: initial;
      bottom: var(--handle-margin);
    }
    .pressed .slider-track-bar::after {
      transform: scale(1.12);
    }
  `);

  // ---------- Вдавленная лунка иконки ----------
  const iconSheet = new CSSStyleSheet();
  iconSheet.replaceSync(`
    .container {
      background: var(--neumorphic-surface-alt);
      box-shadow:
        var(--neumorphic-concave-shadow-sm),
        0 0 var(--an-glow-size, 0px) var(--an-glow-color, transparent);
      transition: box-shadow .25s ease;
    }
  `);

  function adopt(el, sheet, want) {
    const root = el.shadowRoot;
    if (!root) return;
    const has = root.adoptedStyleSheets.includes(sheet);
    if (want && !has) root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    if (!want && has) root.adoptedStyleSheets = root.adoptedStyleSheets.filter((s) => s !== sheet);
  }

  // ---------- Иконка разгорается вместе с яркостью ----------
  const GLYPH = "#1d1e24";
  // f: 0 — выключено, 1 — полная яркость. Значок чёрный, свет живёт в лунке.
  function setLevel(tile, b, isLight) {
    const icon = tile.shadowRoot && tile.shadowRoot.querySelector("ha-tile-icon");
    if (!icon) return;
    const f = b <= 0 ? 0 : 0.22 + 0.78 * Math.pow(clamp(b), 0.8);
    const si = icon.querySelector("ha-state-icon");
    if (si) {
      si.style.color = f > 0 ? `color-mix(in srgb, ${GLYPH} ${Math.round(55 + f * 45)}%, var(--state-icon-color))` : "";
      si.style.filter = "";
      si.style.transition = "color .25s ease";
    }
    if (!isLight) return;
    icon.style.setProperty("--tile-icon-opacity", (0.04 + f * 0.24).toFixed(3));
    icon.style.setProperty("--an-glow-size", (f * 12).toFixed(1) + "px");
    icon.style.setProperty("--an-glow-color", `color-mix(in srgb, var(--tile-color) ${Math.round(f * 55)}%, transparent)`);
  }
  function clearLevel(tile) {
    const icon = tile.shadowRoot && tile.shadowRoot.querySelector("ha-tile-icon");
    if (!icon) return;
    for (const p of ["--tile-icon-color", "--tile-icon-opacity", "--an-glow-size", "--an-glow-color"]) icon.style.removeProperty(p);
    const si = icon.querySelector("ha-state-icon");
    if (si) {
      si.style.color = "";
      si.style.filter = "";
    }
  }
  function applyTile(tile, states) {
    const on = themed(tile);
    const sr = tile.shadowRoot;
    if (!sr) return;
    const icon = sr.querySelector("ha-tile-icon");
    if (icon) adopt(icon, iconSheet, on);
    const features = sr.querySelector("hui-card-features");
    if (features) {
      if (on) features.style.setProperty("--feature-height", FEATURE_HEIGHT);
      else features.style.removeProperty("--feature-height");
    }
    const id = tile._config && tile._config.entity;
    if (!on || !id) {
      clearLevel(tile);
      return;
    }
    const s = states[id];
    if (!s || tile.__anDragging) return;
    const isLight = id.startsWith("light.");
    const active = !["off", "unavailable", "unknown", "closed", "idle", "standby", "locked", "not_home"].includes(s.state);
    let b = active ? 1 : 0;
    if (isLight && s.state === "on" && s.attributes.brightness != null) b = s.attributes.brightness / 255;
    setLevel(tile, b, isLight);
  }

  // ---------- Обход DOM ----------
  let tiles = [];
  function scan() {
    const found = [];
    const walk = (root) => {
      for (const el of root.querySelectorAll("*")) {
        const tag = el.localName;
        if (tag === "hui-tile-card") found.push(el);
        else if (tag === "ha-control-slider") adopt(el, sliderSheet, themed(el));
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(document);
    tiles = found;
  }

  // Во время перетаскивания иконка меняется вживую
  document.addEventListener("slider-moved", (e) => {
    const path = e.composedPath();
    const tile = path.find((n) => n.localName === "hui-tile-card");
    if (!tile || !themed(tile)) return;
    const id = tile._config && tile._config.entity;
    if (!id || !id.startsWith("light.")) return;
    const slider = path[0];
    const v = e.detail && e.detail.value;
    if (v == null) {
      tile.__anDragging = false;
      return;
    }
    const min = slider.min ?? 0;
    const max = slider.max ?? 100;
    tile.__anDragging = true;
    setLevel(tile, (v - min) / (max - min || 1), true);
  }, true);
  document.addEventListener("value-changed", (e) => {
    const tile = e.composedPath().find((n) => n.localName === "hui-tile-card");
    if (tile) tile.__anDragging = false;
  }, true);

  // ---------- Главный цикл ----------
  let lastHass = null;
  let lastScan = 0;
  let lastPath = "";
  function tick() {
    const ha = document.querySelector("home-assistant");
    const hass = ha && ha.hass;
    const now = Date.now();
    let scanned = false;
    if (location.pathname !== lastPath || now - lastScan > 2500) {
      scan();
      scanned = true;
      lastScan = now;
      lastPath = location.pathname;
    }
    if (hass && (hass !== lastHass || scanned)) {
      for (const t of tiles) applyTile(t, hass.states);
      lastHass = hass;
    }
  }
  setInterval(tick, 300);
  tick();
})();
