# carbon-µPlot

Carbon-styled observability charts for metrics, monitoring, and operational dashboards.

This library is a thin wrapper around [uPlot](https://github.com/leeoniya/uPlot) — one of the fastest, smallest charting libraries available — with IBM Carbon design system tokens applied automatically. If your application already loads Carbon CSS, there is nothing extra to configure. All four Carbon themes (White, G10, G90, G100) work out of the box, and the demo site includes a live theme switcher so you can preview every chart in each theme.

Gauges (arc and bar) are implemented natively in this library and are not backed by uPlot.

**Live demos:** [grommett.github.io/carbon-uplot](https://grommett.github.io/carbon-uplot)

---

## Credit

All time-series and canvas rendering is done by [uPlot](https://github.com/leeoniya/uPlot), written by Leon Sorokin. uPlot is extraordinarily fast — it renders 60 fps on datasets with hundreds of thousands of points — and its columnar data format maps directly to what Prometheus, CloudWatch, and InfluxDB actually return. carbon-µPlot would not exist without it. If you find this library useful, go star uPlot.

---

## Chart types

| Chart | Backed by |
|---|---|
| Line | uPlot |
| Area | uPlot |
| Bar | uPlot |
| Scatter | uPlot |
| Heatmap | uPlot |
| Gauge (arc) | native |
| Stat | native |
| Bar Gauge | native |

---

## Installation

```bash
npm install carbon-uplot uplot
```

uPlot is a peer dependency. React is optional — only install it if you use the React bindings.

---

## Usage

### Vanilla JS

```js
import { createLineChart } from 'carbon-uplot';

createLineChart(document.getElementById('chart'), {
  data: [timestamps, seriesA, seriesB],
  series: [{ label: 'node-a' }, { label: 'node-b' }],
  yRange: [0, 100],
});
```

### React

```jsx
import { LineChart } from 'carbon-uplot/react';

<LineChart
  data={[timestamps, seriesA, seriesB]}
  series={[{ label: 'node-a' }, { label: 'node-b' }]}
  yRange={[0, 100]}
  style={{ height: 240 }}
/>
```

### Web Components

```js
import 'carbon-uplot/web-components';
```

```html
<cu-line-chart style="height: 240px"></cu-line-chart>

<script>
  const el = document.querySelector('cu-line-chart');
  el.data = [timestamps, seriesA, seriesB];
  el.series = [{ label: 'node-a' }, { label: 'node-b' }];
  el.yRange = [0, 100];
</script>
```

---

## Thresholds

Gauge and Bar Gauge both accept a `thresholds` array. Bar Gauge also supports `inverted` mode for metrics where low values are bad (e.g. availability percentages).

```js
// Normal — high values are bad (e.g. CPU utilization)
const thresholds = [
  { value: 70, status: 'warning' },
  { value: 85, status: 'error' },
];

// Inverted — low values are bad (e.g. availability %)
createBarGauge(el, {
  series: availability,
  thresholds: [{ value: 80, status: 'error' }, { value: 95, status: 'warning' }],
  inverted: true,
});
```

---

## Carbon CSS

carbon-µPlot reads Carbon CSS custom properties (`--cds-interactive`, `--cds-support-warning`, etc.) from the document. Apply a theme class to your root element and charts update automatically:

```js
document.documentElement.classList.add('cds--g100');
```

No chart-specific configuration needed.

---

## Demo and development

The `demo/` folder contains a full Eleventy site with live examples for every chart type, including Vanilla JS, React, and Web Component code samples.

```bash
npm run dev      # build + watch + serve at localhost:3131
npm run demo     # one-shot build + serve
```

The built site is deployed to GitHub Pages at [grommett.github.io/carbon-uplot](https://grommett.github.io/carbon-uplot).

---

## License

MIT
