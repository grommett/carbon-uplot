import { createLineChart, createAreaChart, createBarChart, createScatterChart, createGauge, createStat, createHeatmap, createBarGauge } from './index.js';

/**
 * Generates a custom element class that wraps a carbon-uplot chart factory.
 *
 * Properties mirror the factory's option keys. Setting any property while the
 * element is connected to the DOM recreates the chart. Arrays and objects are
 * passed by reference — the factory is called on every property set, so batch
 * updates by setting all properties before inserting the element into the DOM.
 *
 * CSS custom properties (--cu-layer, --cu-tooltip-bg, etc.) cascade normally
 * since these elements do not use shadow DOM.
 *
 * @param {Function} factory - A carbon-uplot chart factory function.
 * @param {string[]} propKeys - Property names to expose as JS properties.
 * @returns {typeof HTMLElement}
 */
function createChartElement(factory, propKeys, attrMap = {}) {
  const attrNames = Object.keys(attrMap);
  const Base = class extends HTMLElement {
    static get observedAttributes() {
      return attrNames;
    }

    _chart = null;
    _options = {};

    connectedCallback() {
      this._remount();
    }

    disconnectedCallback() {
      this._chart?.destroy();
      this._chart = null;
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      this._set(attrMap[name], newValue);
    }

    _remount() {
      if (!this._options.data) return;
      this._chart?.destroy();
      this._chart = factory(this, this._options);
    }

    _set(key, value) {
      this._options[key] = value;
      if (this.isConnected) this._remount();
    }
  };

  propKeys.forEach((key) => {
    Object.defineProperty(Base.prototype, key, {
      get() {
        return this._options[key];
      },
      set(value) {
        this._set(key, value);
      },
      enumerable: true,
      configurable: true,
    });
  });

  return Base;
}

/** Shared option keys present on all uPlot-backed chart elements. */
const CHART_PROPS = ['data', 'series', 'yRange', 'legend', 'tooltip', 'valueFormat'];

/**
 * `<cu-line-chart>` — Carbon-styled line chart.
 *
 * JS properties: data, series, yRange, legend, tooltip, valueFormat, cursor
 *
 * @example
 * const el = document.createElement("cu-line-chart");
 * el.style.height = "200px";
 * el.data   = [timestamps, cpuA, cpuB];
 * el.yRange = [0, 100];
 * el.series = [{ label: "node-a" }, { label: "node-b" }];
 * document.body.appendChild(el);
 */
export class CuLineChart extends createChartElement(createLineChart, [...CHART_PROPS, 'cursor', 'plugins'], { legend: 'legend' }) {}

/**
 * `<cu-area-chart>` — Carbon-styled area chart.
 *
 * JS properties: data, series, yRange, legend, tooltip, valueFormat
 */
export class CuAreaChart extends createChartElement(createAreaChart, [...CHART_PROPS, 'xFormat', 'cursor'], { legend: 'legend' }) {}

/**
 * `<cu-bar-chart>` — Carbon-styled bar chart.
 *
 * JS properties: data, series, yRange, xFormat, legend, tooltip, valueFormat
 */
export class CuBarChart extends createChartElement(createBarChart, [...CHART_PROPS, 'xFormat'], { legend: 'legend' }) {}

/**
 * `<cu-scatter-chart>` — Carbon-styled scatter chart.
 *
 * JS properties: data, series, xRange, yRange, xLabel, yLabel, legend
 */
export class CuScatterChart extends createChartElement(
  createScatterChart,
  ['data', 'series', 'xRange', 'yRange', 'xLabel', 'yLabel', 'legend'],
  { legend: 'legend', 'x-label': 'xLabel', 'y-label': 'yLabel' },
) {}

/**
 * `<cu-gauge>` — Carbon-styled semicircular gauge.
 *
 * JS properties: value, status, ticks, thresholds, min, max
 *
 * @example
 * const el = document.createElement("cu-gauge");
 * el.value = 820;
 * el.min = 0;
 * el.max = 1000;
 * el.thresholds = [{ value: 0, status: "success" }, { value: 700, status: "error" }];
 * document.body.appendChild(el);
 */
export class CuGauge extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'color', 'status'];
  }

  _gauge = null;
  _options = {};

  connectedCallback() {
    this._remount();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this._set(name, newValue);
  }

  disconnectedCallback() {
    while (this.firstChild) this.removeChild(this.firstChild);
    this._gauge = null;
  }

  _remount() {
    while (this.firstChild) this.removeChild(this.firstChild);
    this._gauge = createGauge(this, this._options);
  }

  _set(key, value) {
    this._options[key] = value;
    if (this.isConnected) this._remount();
  }

  get value() {
    return this._options.value;
  }
  set value(v) {
    this._set('value', v);
  }

  get status() {
    return this._options.status;
  }
  set status(v) {
    this._set('status', v);
  }

  get ticks() {
    return this._options.ticks;
  }
  set ticks(v) {
    this._set('ticks', v);
  }

  get thresholds() {
    return this._options.thresholds;
  }
  set thresholds(v) {
    this._set('thresholds', v);
  }

  get min() {
    return this._options.min;
  }
  set min(v) {
    this._set('min', v);
  }

  get max() {
    return this._options.max;
  }
  set max(v) {
    this._set('max', v);
  }

  get label() {
    return this._options.label;
  }
  set label(v) {
    this._set('label', v);
  }

  get valueFormat() {
    return this._options.valueFormat;
  }
  set valueFormat(v) {
    this._set('valueFormat', v);
  }

  get color() {
    return this._options.color;
  }
  set color(v) {
    this._set('color', v);
  }

  setValue(update) {
    this._gauge?.setValue(update);
  }
}

/**
 * `<cu-stat>` — Carbon-styled stat panel with an optional big-number value and sparkline.
 *
 * Setting `value` calls setValue() on the live instance so the sparkline scrolls without
 * a full remount. All other properties recreate the panel.
 *
 * JS properties: value, data, label, valueFormat, showValue, sparkline, color, size, align, verticalAlign
 * HTML attributes: label, color, size, align, vertical-align
 *
 * @example
 * const el = document.createElement("cu-stat");
 * el.style.height = "140px";
 * el.data = [timestamps, cpuSeries];
 * el.label = "CPU utilization";
 * el.valueFormat = (v) => `${v.toFixed(0)}%`;
 * document.body.appendChild(el);
 * setInterval(() => { el.value = Math.round(Math.random() * 100); }, 1000);
 */
export class CuStat extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'color', 'size', 'align', 'vertical-align'];
  }

  _stat = null;
  _options = {};

  connectedCallback() {
    this._remount();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    const key = name === 'vertical-align' ? 'verticalAlign' : name;
    this._set(key, newValue);
  }

  disconnectedCallback() {
    while (this.firstChild) this.removeChild(this.firstChild);
    this._stat = null;
  }

  _remount() {
    while (this.firstChild) this.removeChild(this.firstChild);
    this._stat = createStat(this, this._options);
  }

  _set(key, value) {
    this._options[key] = value;
    if (this.isConnected) this._remount();
  }

  get value() { return this._options.value; }
  set value(v) {
    this._options.value = v;
    if (this.isConnected && this._stat) this._stat.setValue({ value: v });
  }

  get data() { return this._options.data; }
  set data(v) { this._set('data', v); }

  get label() { return this._options.label; }
  set label(v) { this._set('label', v); }

  get valueFormat() { return this._options.valueFormat; }
  set valueFormat(v) { this._set('valueFormat', v); }

  get showValue() { return this._options.showValue; }
  set showValue(v) { this._set('showValue', v); }

  get sparkline() { return this._options.sparkline; }
  set sparkline(v) { this._set('sparkline', v); }

  get color() { return this._options.color; }
  set color(v) { this._set('color', v); }

  get size() { return this._options.size; }
  set size(v) { this._set('size', v); }

  get align() { return this._options.align; }
  set align(v) { this._set('align', v); }

  get verticalAlign() { return this._options.verticalAlign; }
  set verticalAlign(v) { this._set('verticalAlign', v); }

  setValue(update) {
    this._stat?.setValue(update);
  }
}

/**
 * `<cu-heatmap>` — Carbon-styled heatmap chart.
 *
 * JS properties: data, bucketLabels, color (also an HTML attribute), xTime
 *
 * @example
 * const el = document.createElement("cu-heatmap");
 * el.style.height = "220px";
 * el.bucketLabels = ['0–10ms', '10–25ms', '25–50ms', '50–100ms', '100–250ms', '250–500ms', '500ms+'];
 * el.data = [timestamps, ...buckets];
 * document.body.appendChild(el);
 */
export class CuHeatmap extends createChartElement(createHeatmap, ['data', 'bucketLabels', 'color', 'xTime'], { color: 'color' }) {}

/**
 * `<cu-bar-gauge>` — Carbon-styled bar gauge.
 *
 * A vertical list of labeled horizontal bars. Passing a single-item series
 * is equivalent to a standalone meter.
 *
 * JS properties: series, min, max, color (also an HTML attribute), thresholds, valueFormat
 *
 * @example
 * const el = document.createElement("cu-bar-gauge");
 * el.series = [
 *   { label: 'prod-db-01', value: 82 },
 *   { label: 'prod-db-02', value: 45 },
 * ];
 * el.valueFormat = (v) => `${v}%`;
 * document.body.appendChild(el);
 */
export class CuBarGauge extends HTMLElement {
  static get observedAttributes() {
    return ['color'];
  }

  _barGauge = null;
  _options = {};

  connectedCallback() {
    this._remount();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this._set(name, newValue);
  }

  disconnectedCallback() {
    while (this.firstChild) this.removeChild(this.firstChild);
    this._barGauge = null;
  }

  _remount() {
    while (this.firstChild) this.removeChild(this.firstChild);
    this._barGauge = createBarGauge(this, this._options);
  }

  _set(key, value) {
    this._options[key] = value;
    if (this.isConnected) this._remount();
  }

  get series() { return this._options.series; }
  set series(v) { this._set('series', v); }

  get min() { return this._options.min; }
  set min(v) { this._set('min', v); }

  get max() { return this._options.max; }
  set max(v) { this._set('max', v); }

  get color() { return this._options.color; }
  set color(v) { this._set('color', v); }

  get thresholds() { return this._options.thresholds; }
  set thresholds(v) { this._set('thresholds', v); }

  get inverted() { return this._options.inverted; }
  set inverted(v) { this._set('inverted', v); }

  get valueFormat() { return this._options.valueFormat; }
  set valueFormat(v) { this._set('valueFormat', v); }

  setValue(index, update) {
    this._barGauge?.setValue(index, update);
  }
}

/**
 * Registers all carbon-uplot custom elements with the browser. Safe to call
 * multiple times — elements and styles are only defined once.
 *
 * This is called automatically when the module is imported, so explicit
 * calls to register() are not required.
 */
export function register() {
  const definitions = [
    ['cu-line-chart', CuLineChart],
    ['cu-area-chart', CuAreaChart],
    ['cu-bar-chart', CuBarChart],
    ['cu-scatter-chart', CuScatterChart],
    ['cu-gauge', CuGauge],
    ['cu-stat', CuStat],
    ['cu-heatmap', CuHeatmap],
    ['cu-bar-gauge', CuBarGauge],
  ];

  definitions.forEach(([tag, cls]) => {
    if (!customElements.get(tag)) customElements.define(tag, cls);
  });

  if (!document.getElementById('cu-wc-styles')) {
    const style = document.createElement('style');
    style.id = 'cu-wc-styles';
    style.textContent = 'cu-line-chart,cu-area-chart,cu-bar-chart,cu-scatter-chart,cu-gauge,cu-stat,cu-heatmap,cu-bar-gauge{display:block}';
    document.head.appendChild(style);
  }
}

register();
