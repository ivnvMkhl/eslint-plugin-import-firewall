# eslint-plugin-import-firewall

ESLint plugin to enforce import restrictions with configurable layers.

## Requirements

- Node.js >= 20.0.0
- ESLint >= 8.0.0

## Installation

```bash
npm install --save-dev eslint-plugin-import-firewall
```

## Usage

The plugin supports both ES modules and CommonJS formats (Node.js 20+ handles conversion automatically).

### ES Modules (eslint.config.mjs)

```javascript
import importFirewallPlugin from 'eslint-plugin-import-firewall';

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
      srcDir: 'src', // optional, defaults to 'src'
    }],
  },
};
```

### CommonJS (eslint.config.js)

```javascript
const importFirewallPlugin = require('eslint-plugin-import-firewall');

module.exports = {
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
      srcDir: 'src', // optional, defaults to 'src'
    }],
  },
};
```

## Configuration

### Options

- `layers` (required): Array of layer configurations
  - `name` (required): Layer identifier (e.g., 'app', 'widget', 'feature', 'shared')
  - `path` (required): Path pattern to detect layer in file path (e.g., '/src/app/')
  - `alias` (required): Import alias prefix (e.g., '@app/')
  - `allowedImports` (required): Array of layer names that this layer can import from
- `srcDir` (optional): Source directory name (default: 'src')

### Layer Rules

Each layer can only import from layers specified in its `allowedImports` array. All layers can import from `node_modules`.

## Example

With the configuration above:

- ✅ `app` can import from `app`, `widget`, `feature`, `shared`, and `node_modules`
- ✅ `widget` can import from `widget`, `feature`, `shared`, and `node_modules`
- ✅ `feature` can import from `feature`, `shared`, and `node_modules`
- ✅ `shared` can import only from `shared` and `node_modules`
- ❌ `widget` cannot import from `app`
- ❌ `feature` cannot import from `widget` or `app`
- ❌ `shared` cannot import from any other layer

## Supported Import Styles

The plugin supports:

- **Aliased imports**: `import { something } from '@app/components'`
- **Relative imports**: `import { something } from '../../shared/utils'`
- **Same-level imports**: `import { something } from './component'`
- **Node modules**: `import { something } from 'react'` (always allowed)

## Testing

The plugin includes unit tests using ESLint's `RuleTester`. To run the tests:

```bash
npm test
```

The tests verify:
- Valid imports between allowed layers
- Invalid imports that violate FSD rules
- Support for aliased and relative imports
- Node modules imports (always allowed)

