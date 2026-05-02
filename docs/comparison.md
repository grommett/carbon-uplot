# carbon-uplot vs @carbon/charts

carbon-uplot is a focused alternative to `@carbon/charts` built specifically for **observability dashboards**. It does not try to be a general-purpose data visualization library. If you need word clouds, treemaps, or alluvial diagrams, `@carbon/charts` is the right tool. If you are building a metrics dashboard — time-series lines, area charts, bar charts, scatter plots, gauges — carbon-uplot gives you a significantly smaller, faster, and simpler path to the same Carbon design language.

---

## Bundle size

The single biggest practical difference. `@carbon/charts` is built on D3, which is a comprehensive data transformation and rendering library. For a line chart, you pay for all of D3 whether you use it or not.

| | Minified | Gzipped |
|---|---|---|
| **carbon-uplot** + uPlot | ~79 KB | ~25 KB |
| **@carbon/charts** | 8.6 MB install | ~300–500 KB |
| D3 v7 alone | ~500 KB | ~180 KB |

uPlot is the only required peer dependency. It has zero transitive dependencies.

---

## Dependencies

| | carbon-uplot | @carbon/charts |
|---|---|---|
| Rendering engine | uPlot (Canvas) | D3 v7 (SVG) |
| Required peer deps | `uplot` | `d3`, `carbon-components` |
| Bundled deps | none | d3-cloud, d3-sankey, lodash-es, date-fns, dompurify, topojson, html-to-image |
| Carbon CSS | tokens only (already in your app) | full Carbon CSS required |

If your application already uses Carbon, you have the CSS tokens. carbon-uplot reads them via CSS custom properties — no additional stylesheet to load.

---

## Performance

uPlot renders on Canvas. `@carbon/charts` renders on SVG via D3. For observability workloads this is a meaningful difference:

- **Canvas** draws pixels directly — adding more data points costs almost nothing
- **SVG** creates DOM nodes — each data point is an element the browser must layout, paint, and manage

uPlot was designed to render millions of data points at 60 fps. For typical observability dashboards (96–864 points per series, multiple charts per page, frequent data refresh) this means charts that stay responsive as your data volume grows.

---

## Chart types

carbon-uplot supports exactly the chart types an observability dashboard needs:

| Chart type | carbon-uplot | @carbon/charts |
|---|---|---|
| Line | ✓ | ✓ |
| Area | ✓ | ✓ |
| Bar | ✓ | ✓ |
| Scatter | ✓ | ✓ |
| Gauge | ✓ | ✓ |
| Alluvial / Sankey | — | ✓ |
| Treemap / Circle Pack | — | ✓ |
| Word Cloud | — | ✓ |
| Pie / Donut | — | ✓ |
| Bullet / Radar / Heatmap | — | ✓ |

`@carbon/charts` supports 23 chart types. That breadth comes with the full D3 and Carbon CSS dependency surface whether you use those chart types or not.

---

## When to use each

**Use carbon-uplot if you are:**
- Building a metrics, monitoring, or observability dashboard
- Working in a performance-sensitive environment (dense data, frequent updates, many charts per page)
- Already using Carbon and want charts that respect your token overrides without additional configuration
- Shipping a library or product where bundle size matters

**Use @carbon/charts if you are:**
- Building reports or information graphics that use pie charts, treemaps, or sankey diagrams
- Working in a context where bundle size is not a constraint
- Need a chart type carbon-uplot does not provide
