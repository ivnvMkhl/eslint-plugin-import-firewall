/**
 * ESLint plugin for import restrictions
 * Supports both CommonJS and ES modules (Node.js 20+)
 * Node.js automatically handles conversion between formats via package.json exports
 */

import importFirewallRule from './rules/import-firewall.js';

const plugin = {
  rules: {
    'import-firewall': importFirewallRule,
  },
};

export default plugin;

