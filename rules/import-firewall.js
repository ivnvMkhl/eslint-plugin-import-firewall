/**
 * Custom ESLint rule to enforce FSD (Feature-Sliced Design) import restrictions
 * 
 * Configuration:
 * - layers: Array of layer configurations
 *   - name: Layer identifier (e.g., 'app', 'widget', 'feature', 'shared')
 *   - path: Path pattern to detect layer in file path (e.g., '/src/app/')
 *   - alias: Import alias prefix (e.g., '@app/')
 *   - allowedImports: Array of layer names that this layer can import from
 * - srcDir: Source directory name (default: 'src')
 */

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce FSD architecture import restrictions',
    },
    messages: {
      invalidImport: 'Layer "{{layer}}" cannot import from "{{importedLayer}}". Allowed imports: {{allowed}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          layers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                path: { type: 'string' },
                alias: { type: 'string' },
                allowedImports: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['name', 'path', 'alias', 'allowedImports'],
              additionalProperties: false,
            },
          },
          srcDir: {
            type: 'string',
            default: 'src',
          },
        },
        required: ['layers'],
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const layers = options.layers || [];
    const srcDir = options.srcDir || 'src';

    // Build lookup maps for efficient layer detection
    const layerByPath = new Map();
    const layerByAlias = new Map();
    const layerRules = new Map();

    layers.forEach((layer) => {
      layerByPath.set(layer.path, layer.name);
      layerByAlias.set(layer.alias, layer.name);
      layerRules.set(layer.name, layer.allowedImports);
    });

    function normalizePath(path) {
      // Normalize path separators for cross-platform compatibility
      return path.replace(/\\/g, '/');
    }

    function getLayerFromPath(filePath) {
      const normalizedPath = normalizePath(filePath);
      
      // Check each configured layer path
      for (const [pathPattern, layerName] of layerByPath.entries()) {
        if (normalizedPath.includes(pathPattern)) {
          return layerName;
        }
      }
      
      return null;
    }

    function getLayerFromImport(importPath) {
      // Check aliased imports first
      for (const [alias, layerName] of layerByAlias.entries()) {
        if (importPath.startsWith(alias)) {
          return layerName;
        }
      }
      
      // Check relative imports by analyzing the file path
      if (importPath.startsWith('../') || importPath.startsWith('./')) {
        const filePath = normalizePath(context.getFilename());
        const pathParts = filePath.split('/').filter(Boolean);
        
        // Remove filename to get directory
        const fileDir = pathParts.slice(0, -1);
        
        // Resolve relative path
        const importParts = importPath.split('/').filter(Boolean);
        const resolvedParts = [...fileDir];
        
        for (const part of importParts) {
          if (part === '..') {
            if (resolvedParts.length > 0) {
              resolvedParts.pop();
            }
          } else if (part !== '.') {
            resolvedParts.push(part);
          }
        }
        
        // Reconstruct the resolved path
        const resolvedPath = '/' + resolvedParts.join('/') + '/';
        
        // Check if resolved path matches any layer pattern
        for (const [pathPattern, layerName] of layerByPath.entries()) {
          // Check if the resolved path contains the layer pattern
          // For example: '/project/src/app/components/' should match '/src/app/'
          if (resolvedPath.includes(pathPattern)) {
            return layerName;
          }
        }
        
        // If we can't determine from resolved path, check if it's same-level import
        if (importPath.startsWith('./')) {
          const currentLayer = getLayerFromPath(filePath);
          return currentLayer;
        }
      }
      
      // If we can't determine, return null (will be treated as node_modules)
      return null;
    }

    function isNodeModuleImport(importPath) {
      // If import doesn't start with any configured alias, ./, or ../, it's likely a node_modules import
      const startsWithAlias = Array.from(layerByAlias.keys()).some(alias => 
        importPath.startsWith(alias)
      );
      
      return !startsWithAlias && 
             !importPath.startsWith('./') && 
             !importPath.startsWith('../');
    }

    return {
      ImportDeclaration(node) {
        const filePath = context.getFilename();
        const currentLayer = getLayerFromPath(filePath);
        
        // Only check files within recognized layers
        if (!currentLayer) {
          return;
        }

        const importSource = node.source.value;
        
        // Skip node_modules imports (they're allowed for all layers)
        if (isNodeModuleImport(importSource)) {
          return;
        }

        const importedLayer = getLayerFromImport(importSource);
        
        // If we can't determine the layer, skip (might be relative import within same layer)
        if (importedLayer === null) {
          return;
        }

        const allowedLayers = layerRules.get(currentLayer) || [];
        
        // Check if import violates FSD rules
        if (!allowedLayers.includes(importedLayer)) {
          const allowedStr = allowedLayers.length > 0 
            ? allowedLayers.join(', ') + ', node_modules'
            : 'node_modules only';
          
          context.report({
            node: node.source,
            messageId: 'invalidImport',
            data: {
              layer: currentLayer,
              importedLayer: importedLayer,
              allowed: allowedStr,
            },
          });
        }
      },
    };
  },
};

// Support both CommonJS and ES modules (Node.js 20+)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = rule;
}
export default rule;

