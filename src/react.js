import { useEffect, useRef, createElement, forwardRef, useImperativeHandle } from 'react';
import { createLineChart, createAreaChart, createBarChart, createScatterChart, createGauge, createStat, createHeatmap, createBarGauge, bindLegend } from './index.js';

export { bindLegend };

/**
 * Mounts a carbon-uplot chart factory into a DOM ref and tears it down on unmount
 * or when any listed dependency changes.
 *
 * Arrays and objects are compared by reference. To avoid unnecessary recreations,
 * stabilize them with useMemo at the call site:
 *
 *   const series = useMemo(() => [{ label: "CPU" }], []);
 *
 * @param {Function} factory - A carbon-uplot chart factory (e.g. createLineChart).
 * @param {React.RefObject} containerRef - Ref attached to the container element.
 * @param {object} options - Options forwarded to the factory.
 * @param {Array} deps - Dependency array controlling when the chart is recreated.
 * @returns {React.RefObject} Ref holding the live uPlot instance.
 */
function useChart(factory, containerRef, options, deps) {
  const chartRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    chartRef.current = factory(el, options);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return chartRef;
}

/**
 * Exposes the uPlot chart instance on a forwarded ref as `ref.current.chart`.
 * Uses a getter so the value is resolved lazily — callers that read it in a
 * useEffect will always see the populated instance since child effects fire first.
 */
function useChartHandle(forwardedRef, chartRef) {
  useImperativeHandle(
    forwardedRef,
    () => ({
      get chart() {
        return chartRef.current;
      },
    }),
    [],
  );
}

/**
 * Carbon-styled line chart.
 *
 * @param {object} props
 * @param {Array} props.data - uPlot data array [timestamps, ...ySeries]. Stabilize with useMemo.
 * @param {[number, number]} props.yRange - [min, max] for the y scale.
 * @param {{ label?: string; color?: string; width?: number }[]} [props.series] - Per-series config. Stabilize with useMemo.
 * @param {boolean|"top"|"bottom"} [props.legend] - Legend placement. Defaults to "bottom". Pass false to disable.
 * @param {boolean} [props.tooltip] - Show tooltip. Defaults to true.
 * @param {(y: number) => string} [props.valueFormat] - Custom value formatter for tooltip.
 * @param {(x: number) => string} [props.xFormat] - Custom x-axis header formatter for tooltip.
 * @param {object} [props.cursor] - uPlot cursor options (e.g. drag-to-zoom).
 * @param {object[]} [props.plugins] - Additional uPlot plugins.
 * @param {string} [props.className] - CSS class applied to the container div.
 * @param {object} [props.style] - Inline styles applied to the container div.
 * @param {React.Ref} ref - Exposes `{ chart }` — the underlying uPlot instance.
 */
export const LineChart = forwardRef(function LineChart(
  { data, yRange, series, legend, tooltip, valueFormat, xFormat, cursor, plugins, className, style },
  ref,
) {
  const containerRef = useRef(null);
  const chartRef = useChart(
    createLineChart,
    containerRef,
    { data, yRange, series, legend, tooltip, valueFormat, xFormat, cursor, plugins },
    [data, yRange, series, legend, tooltip, valueFormat, xFormat, cursor, plugins],
  );
  useChartHandle(ref, chartRef);
  return createElement('div', { ref: containerRef, className, style });
});

/**
 * Carbon-styled area chart.
 *
 * @param {object} props
 * @param {Array} props.data - uPlot data array [timestamps, ...ySeries]. Stabilize with useMemo.
 * @param {[number, number]} props.yRange - [min, max] for the y scale.
 * @param {{ label?: string; color?: string; width?: number }[]} [props.series] - Per-series config. Stabilize with useMemo.
 * @param {boolean|"top"|"bottom"} [props.legend] - Legend placement. Defaults to "bottom". Pass false to disable.
 * @param {boolean} [props.tooltip] - Show tooltip. Defaults to true.
 * @param {(y: number) => string} [props.valueFormat] - Custom value formatter for tooltip.
 * @param {(x: number) => string} [props.xFormat] - Custom x-axis header formatter for tooltip.
 * @param {object} [props.cursor] - uPlot cursor options (e.g. drag-to-zoom).
 * @param {string} [props.className] - CSS class applied to the container div.
 * @param {object} [props.style] - Inline styles applied to the container div.
 * @param {React.Ref} ref - Exposes `{ chart }` — the underlying uPlot instance.
 */
export const AreaChart = forwardRef(function AreaChart(
  { data, yRange, series, legend, tooltip, valueFormat, xFormat, cursor, className, style },
  ref,
) {
  const containerRef = useRef(null);
  const chartRef = useChart(
    createAreaChart,
    containerRef,
    { data, yRange, series, legend, tooltip, valueFormat, xFormat, cursor },
    [data, yRange, series, legend, tooltip, valueFormat, xFormat, cursor],
  );
  useChartHandle(ref, chartRef);
  return createElement('div', { ref: containerRef, className, style });
});

/**
 * Carbon-styled bar chart.
 *
 * @param {object} props
 * @param {Array} props.data - uPlot data array [timestamps, ...ySeries]. Stabilize with useMemo.
 * @param {[number, number]} props.yRange - [min, max] for the y scale.
 * @param {{ label?: string; color?: string }[]} [props.series] - Per-series config. Stabilize with useMemo.
 * @param {Function} [props.xFormat] - Formatter for x-axis labels and tooltip header.
 * @param {boolean|"top"|"bottom"} [props.legend] - Legend placement. Defaults to "bottom". Pass false to disable.
 * @param {boolean} [props.tooltip] - Show tooltip. Defaults to true.
 * @param {(y: number) => string} [props.valueFormat] - Custom value formatter for tooltip.
 * @param {string} [props.className] - CSS class applied to the container div.
 * @param {object} [props.style] - Inline styles applied to the container div.
 * @param {React.Ref} ref - Exposes `{ chart }` — the underlying uPlot instance.
 */
export const BarChart = forwardRef(function BarChart(
  { data, yRange, series, xFormat, legend, tooltip, valueFormat, className, style },
  ref,
) {
  const containerRef = useRef(null);
  const chartRef = useChart(
    createBarChart,
    containerRef,
    { data, yRange, series, xFormat, legend, tooltip, valueFormat },
    [data, yRange, series, xFormat, legend, tooltip, valueFormat],
  );
  useChartHandle(ref, chartRef);
  return createElement('div', { ref: containerRef, className, style });
});

/**
 * Carbon-styled scatter chart.
 *
 * @param {object} props
 * @param {Array} props.data - uPlot data array [xIndexes, ...ySeries]. Stabilize with useMemo.
 * @param {[number, number]} props.xRange - [min, max] for the x scale.
 * @param {[number, number]} props.yRange - [min, max] for the y scale.
 * @param {{ label?: string; color?: string }[]} [props.series] - Per-series config. Stabilize with useMemo.
 * @param {string} [props.xLabel] - X-axis label.
 * @param {string} [props.yLabel] - Y-axis label.
 * @param {boolean|"top"|"bottom"} [props.legend] - Legend placement. Defaults to "bottom". Pass false to disable.
 * @param {string} [props.className] - CSS class applied to the container div.
 * @param {object} [props.style] - Inline styles applied to the container div.
 * @param {React.Ref} ref - Exposes `{ chart }` — the underlying uPlot instance.
 */
export const ScatterChart = forwardRef(function ScatterChart(
  { data, xRange, yRange, series, xLabel, yLabel, legend, className, style },
  ref,
) {
  const containerRef = useRef(null);
  const chartRef = useChart(
    createScatterChart,
    containerRef,
    { data, xRange, yRange, series, xLabel, yLabel, legend },
    [data, xRange, yRange, series, xLabel, yLabel, legend],
  );
  useChartHandle(ref, chartRef);
  return createElement('div', { ref: containerRef, className, style });
});

/**
 * Carbon-styled heatmap chart.
 *
 * @param {object} props
 * @param {Array} props.data - uPlot data array [xValues, ...bucketSeries]. Stabilize with useMemo.
 * @param {string[]} [props.bucketLabels] - Y-axis labels, one per bucket. Stabilize with useMemo.
 * @param {string} [props.color] - Base hex color for the heat scale.
 * @param {boolean} [props.xTime] - Treat x values as Unix timestamps. Defaults to true.
 * @param {string} [props.className] - CSS class applied to the container div.
 * @param {object} [props.style] - Inline styles applied to the container div.
 * @param {React.Ref} ref - Exposes `{ chart }` — the underlying uPlot instance.
 */
export const Heatmap = forwardRef(function Heatmap(
  { data, bucketLabels, color, xTime, className, style },
  ref,
) {
  const containerRef = useRef(null);
  const chartRef = useChart(
    createHeatmap,
    containerRef,
    { data, bucketLabels, color, xTime },
    [data, bucketLabels, color, xTime],
  );
  useChartHandle(ref, chartRef);
  return createElement('div', { ref: containerRef, className, style });
});

/**
 * Carbon-styled stat panel with an optional big-number value and sparkline.
 *
 * Structural props (data, label, color, valueFormat, showValue, sparkline) recreate the panel.
 * The value prop is applied via setValue so live updates scroll the sparkline without a remount.
 *
 * @param {object} props
 * @param {number} [props.value] - Current value to display.
 * @param {Array} [props.data] - uPlot data array [timestamps, yValues] for the sparkline.
 * @param {string} [props.label] - Descriptive label rendered below the value.
 * @param {(value: number) => string} [props.valueFormat] - Custom value formatter.
 * @param {boolean} [props.showValue] - Whether to render the big number. Defaults to true.
 * @param {boolean} [props.sparkline] - Whether to render the sparkline. Defaults to true.
 * @param {string} [props.color] - Color for the value text and sparkline.
 * @param {'sm'|'md'|'lg'} [props.size] - Value font size. Defaults to 'md'.
 * @param {'left'|'center'|'right'} [props.align] - Horizontal alignment of value and label. Defaults to 'left'.
 * @param {'top'|'center'} [props.verticalAlign] - Vertical alignment within the container. Defaults to 'top'.
 * @param {string} [props.className] - CSS class applied to the container div.
 * @param {object} [props.style] - Inline styles applied to the container div.
 */
export function Stat({ value, data, label, valueFormat, showValue, sparkline, color, size, align, verticalAlign, className, style }) {
  const containerRef = useRef(null);
  const statRef = useRef(null);
  const skipValueEffect = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
    statRef.current = createStat(el, { value, data, label, valueFormat, showValue, sparkline, color, size, align, verticalAlign });
    skipValueEffect.current = true;
    return () => {
      while (el.firstChild) el.removeChild(el.firstChild);
      statRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, label, valueFormat, showValue, sparkline, color, size, align, verticalAlign]);

  useEffect(() => {
    if (skipValueEffect.current) {
      skipValueEffect.current = false;
      return;
    }
    statRef.current?.setValue({ value });
  }, [value]);

  return createElement('div', { ref: containerRef, className, style });
}

/**
 * Carbon-styled semicircular gauge.
 *
 * @param {object} props
 * @param {number} props.value - Current value in real units.
 * @param {"info"|"success"|"warning"|"error"} [props.status] - Overrides threshold color lookup.
 * @param {boolean} [props.ticks] - Show tick marks around the arc. Defaults to true.
 * @param {{ value: number, status: string }[]} [props.thresholds] - Color thresholds, sorted ascending. Stabilize with useMemo.
 * @param {number} [props.min] - Minimum value of the scale. Defaults to 0.
 * @param {number} [props.max] - Maximum value of the scale. Defaults to 100.
 * @param {string} [props.label] - Descriptive label rendered below the arc.
 * @param {(value: number) => string} [props.valueFormat] - Custom formatter for the center value label.
 * @param {string} [props.color] - Direct color override for the arc.
 * @param {string} [props.className] - CSS class applied to the container div.
 * @param {object} [props.style] - Inline styles applied to the container div.
 */
export function Gauge({ value, status, ticks, thresholds, min, max, label, valueFormat, color, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    createGauge(el, { value, status, ticks, thresholds, min, max, label, valueFormat, color });
    return () => {
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, [value, status, ticks, thresholds, min, max, label, valueFormat, color]);

  return createElement('div', { ref, className, style });
}

/**
 * Carbon-styled bar gauge — a vertical list of labeled horizontal bars.
 *
 * Passing a single-item series is equivalent to a standalone meter.
 * All props recreate the panel on change.
 *
 * @param {object} props
 * @param {{ label?: string; value?: number; color?: string; status?: string }[]} [props.series] - Rows to render. Stabilize with useMemo.
 * @param {number} [props.min] - Minimum scale value. Defaults to 0.
 * @param {number} [props.max] - Maximum scale value. Defaults to 100.
 * @param {string} [props.color] - Global bar color override.
 * @param {{ value: number; status: string }[]} [props.thresholds] - Color thresholds sorted ascending. Stabilize with useMemo.
 * @param {(value: number) => string} [props.valueFormat] - Custom value formatter.
 * @param {string} [props.className] - CSS class applied to the container div.
 * @param {object} [props.style] - Inline styles applied to the container div.
 */
export function BarGauge({ series, min, max, color, thresholds, inverted, valueFormat, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    createBarGauge(el, { series, min, max, color, thresholds, inverted, valueFormat });
    return () => {
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, [series, min, max, color, thresholds, inverted, valueFormat]);

  return createElement('div', { ref, className, style });
}
