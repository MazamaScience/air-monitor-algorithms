// air-monitor-algorithms/rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  // UMD for browsers and Playwright
  {
    input: 'src/index.js',
    output: {
      file: 'dist/air-monitor-algorithms.umd.js',
      format: 'umd',
      name: 'AirMonitorAlgorithms', // global variable name
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), terser()],
  },
  // ESM for modern bundlers and Node
  {
    input: 'src/index.js',
    output: {
      file: 'dist/air-monitor-algorithms.esm.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), terser()],
  }
];

