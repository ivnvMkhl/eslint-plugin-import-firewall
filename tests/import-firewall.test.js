/**
 * Unit tests for import-firewall ESLint rule
 */

import { RuleTester } from 'eslint';
import rule from '../rules/import-firewall.js';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
});

const baseConfig = {
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
};

ruleTester.run('import-firewall', rule, {
  valid: [
    // App layer can import from all layers
    {
      code: "import { something } from '@app/components';",
      filename: '/project/src/app/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from '@widgets/header';",
      filename: '/project/src/app/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from '@features/auth';",
      filename: '/project/src/app/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from '@shared/utils';",
      filename: '/project/src/app/index.js',
      options: [baseConfig],
    },
    // Widget layer can import from widget, feature, shared
    {
      code: "import { something } from '@widgets/header';",
      filename: '/project/src/widgets/header/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from '@features/auth';",
      filename: '/project/src/widgets/header/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from '@shared/utils';",
      filename: '/project/src/widgets/header/index.js',
      options: [baseConfig],
    },
    // Feature layer can import from feature, shared
    {
      code: "import { something } from '@features/auth';",
      filename: '/project/src/features/auth/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from '@shared/utils';",
      filename: '/project/src/features/auth/index.js',
      options: [baseConfig],
    },
    // Shared layer can import only from shared
    {
      code: "import { something } from '@shared/utils';",
      filename: '/project/src/shared/utils/index.js',
      options: [baseConfig],
    },
    // Relative imports within same layer
    {
      code: "import { something } from './component';",
      filename: '/project/src/app/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from '../app/other';",
      filename: '/project/src/app/components/button.js',
      options: [baseConfig],
    },
    // Node modules are always allowed
    {
      code: "import React from 'react';",
      filename: '/project/src/app/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from 'lodash';",
      filename: '/project/src/shared/utils/index.js',
      options: [baseConfig],
    },
    // Relative imports to allowed layers
    {
      code: "import { something } from '../../shared/utils';",
      filename: '/project/src/features/auth/index.js',
      options: [baseConfig],
    },
    {
      code: "import { something } from '../../../shared/utils';",
      filename: '/project/src/widgets/header/components/button.js',
      options: [baseConfig],
    },
  ],

  invalid: [
    // Widget cannot import from app
    {
      code: "import { something } from '@app/components';",
      filename: '/project/src/widgets/header/index.js',
      options: [baseConfig],
      errors: [
        {
          messageId: 'invalidImport',
          data: {
            layer: 'widget',
            importedLayer: 'app',
            allowed: 'widget, feature, shared, node_modules',
          },
        },
      ],
    },
    // Feature cannot import from widget or app
    {
      code: "import { something } from '@widgets/header';",
      filename: '/project/src/features/auth/index.js',
      options: [baseConfig],
      errors: [
        {
          messageId: 'invalidImport',
          data: {
            layer: 'feature',
            importedLayer: 'widget',
            allowed: 'feature, shared, node_modules',
          },
        },
      ],
    },
    {
      code: "import { something } from '@app/components';",
      filename: '/project/src/features/auth/index.js',
      options: [baseConfig],
      errors: [
        {
          messageId: 'invalidImport',
          data: {
            layer: 'feature',
            importedLayer: 'app',
            allowed: 'feature, shared, node_modules',
          },
        },
      ],
    },
    // Shared cannot import from any other layer
    {
      code: "import { something } from '@app/components';",
      filename: '/project/src/shared/utils/index.js',
      options: [baseConfig],
      errors: [
        {
          messageId: 'invalidImport',
          data: {
            layer: 'shared',
            importedLayer: 'app',
            allowed: 'shared, node_modules',
          },
        },
      ],
    },
    {
      code: "import { something } from '@widgets/header';",
      filename: '/project/src/shared/utils/index.js',
      options: [baseConfig],
      errors: [
        {
          messageId: 'invalidImport',
          data: {
            layer: 'shared',
            importedLayer: 'widget',
            allowed: 'shared, node_modules',
          },
        },
      ],
    },
    {
      code: "import { something } from '@features/auth';",
      filename: '/project/src/shared/utils/index.js',
      options: [baseConfig],
      errors: [
        {
          messageId: 'invalidImport',
          data: {
            layer: 'shared',
            importedLayer: 'feature',
            allowed: 'shared, node_modules',
          },
        },
      ],
    },
    // Relative imports to disallowed layers
    {
      code: "import { something } from '../../app/components';",
      filename: '/project/src/widgets/header/index.js',
      options: [baseConfig],
      errors: [
        {
          messageId: 'invalidImport',
          data: {
            layer: 'widget',
            importedLayer: 'app',
            allowed: 'widget, feature, shared, node_modules',
          },
        },
      ],
    },
    {
      code: "import { something } from '../../../app/components';",
      filename: '/project/src/features/auth/components/form.js',
      options: [baseConfig],
      errors: [
        {
          messageId: 'invalidImport',
          data: {
            layer: 'feature',
            importedLayer: 'app',
            allowed: 'feature, shared, node_modules',
          },
        },
      ],
    },
  ],
});

