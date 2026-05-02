import { HtmlBasePlugin } from '@11ty/eleventy';

const pathPrefix = process.env.NODE_ENV === 'production' ? '/carbon-uplot/' : '/';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ dist: 'dist' });
  eleventyConfig.addPassthroughCopy({
    'node_modules/@carbon/styles/css/styles.css': 'assets/carbon.css',
  });
  eleventyConfig.addPassthroughCopy({ 'demo/components': 'demo/components' });
  eleventyConfig.addPassthroughCopy({ 'demo/imgs': 'demo/imgs' });
  eleventyConfig.addPassthroughCopy({ 'demo/carbon-demo.css': 'demo/carbon-demo.css' });
  eleventyConfig.addPassthroughCopy({ 'demo/*.demo.js': 'demo' });
  eleventyConfig.addPassthroughCopy({ 'demo/overview.js': 'demo/overview.js' });
  eleventyConfig.addPassthroughCopy({ 'demo/data-utils.js': 'demo/data-utils.js' });
  eleventyConfig.addPassthroughCopy({ 'demo/demo-data.js': 'demo/demo-data.js' });

  return {
    pathPrefix,
    dir: {
      input: 'demo',
      output: 'site',
      layouts: 'layouts',
      includes: 'includes',
    },
  };
}
