import StorybookElmPlugin from './storybook-elm/plugin.mjs';

export default {
  "framework": {
    name: "@storybook/html-vite",
    options: {}
  },

  "stories": [
    {
      directory: '../src/Stories',
      files: '**/*.elm',
      importPathMatcher: /^\.\.\/src\/Stories\/.*\.elm$/
    }
  ],

  "addons": [
    "./storybook-elm/addon/register.js",
    "@storybook/addon-actions",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],

  async viteFinal(config) {
    config.plugins.push(StorybookElmPlugin())
    return config
  },

  docs: {},

  experimental_indexers: async (existingIndexers) => {
    const elmIndexer = {
      test: /\.elm$/,
      createIndex: async (fileName, { makeTitle }) => [{
        type: 'story',
        title: makeTitle(fileName.match(/src\/Stories\/(.*)\.elm$/)[1]),
        name: fileName.split('/').pop().replace('.elm', ''),
        importPath: fileName,
        exportName: fileName.split('/').pop().replace('.elm', '')
      }]
    };
    return [...existingIndexers, elmIndexer];
  }
} 