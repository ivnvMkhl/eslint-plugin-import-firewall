/**
 * Example ESLint configuration using eslint-plugin-import-firewall
 * 
 * This shows how to configure the plugin in your eslint.config.mjs
 */

// For ES modules (eslint.config.mjs):
// import importFirewallPlugin from 'eslint-plugin-import-firewall';

// For CommonJS (eslint.config.js):
// const importFirewallPlugin = require('eslint-plugin-import-firewall');

// This example uses ES modules
import importFirewallPlugin from './index.mjs';

export default {
  plugins: {
    'import-firewall': importFirewallPlugin,
  },
  rules: {
    'import-firewall/import-firewall': ['error', {
      layers: [
        {
          name: 'app',
          path: '/src/app/',
          alias: '@app/',
          allowedImports: ['app', 'widget', 'feature', 'shared'],
        },
        {
          name: 'widget',
          path: '/src/widgets/',
          alias: '@widgets/',
          allowedImports: ['widget', 'feature', 'shared'],
        },
        {
          name: 'feature',
          path: '/src/features/',
          alias: '@features/',
          allowedImports: ['feature', 'shared'],
        },
        {
          name: 'shared',
          path: '/src/shared/',
          alias: '@shared/',
          allowedImports: ['shared'],
        },
      ],
      srcDir: 'src',
    }],
  },
};

