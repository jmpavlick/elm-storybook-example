import compiler from 'node-elm-compiler';
import chokidar from 'chokidar';
import fs from 'fs';

const fileRegex = /src\/Stories\/(.*)\.elm$/;

const Tracker = (() => {
  let files = {};

  let watcher = chokidar.watch([], { ignoreInitial: true })
    .on('all', (_event, pathOfWatchedDependency) => {
      let filepathsNeedingThisDep = Object.keys(files[pathOfWatchedDependency] || {});
      filepathsNeedingThisDep.forEach(touchFile);
    });
  
  const touchFile = filepath => fs.utimes(filepath, Date.now(), Date.now(), () => { });

  const track = async (filepath) =>
    compiler.findAllDependencies(filepath)
      .then(addToFiles(filepath));

  const addToFiles = (filepath) => (newDependencies) => {
    newDependencies.forEach(depFilepath => {
      files[depFilepath] = files[depFilepath] || {};
      files[depFilepath][filepath] = true;
    });

    watcher.add(newDependencies);
  };

  return { track };
})();

export default () => ({
  name: 'storybook-elm',
  enforce: 'pre',

  async indexer(fileName) {
    if (!fileRegex.test(fileName)) return null;
    
    const modulePath = fileRegex.exec(fileName)[1];
    const finalModuleName = modulePath.split('/').slice(-1)[0];
    
    return {
      type: 'story',
      title: modulePath,
      name: finalModuleName,
      importPath: fileName,
    };
  },

  transform: async (rawSource, id) => {
    if (fileRegex.test(id)) {
      const modulePath = fileRegex.exec(id)[1];
      const finalModuleName = modulePath.split('/').slice(-1)[0];
      const fullModuleName = modulePath.split('/').join('.');

      let compiledJs;

      // Attempt to compile the story
      const log = console.log;
      try {
        console.log = () => { };
        compiledJs = await compiler.compileToString(id, { optimize: false, debug: false });
        console.log = log;
      } catch (elmCompilerError) {
        console.log = log;
        throw ('Elm found an error!\n\n' + elmCompilerError.message.slice('Compilation failed\nCompiling ...'.length));
      }

      const transformedCode = compiledJs
        .replace('(this)', '(globalThis)')
        .replace(`console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.1/optimize for better performance and smaller assets.');`, '');

      await Tracker.track(id);

      return {
        code: `
${transformedCode}

export default {
  title: "${modulePath}",
  parameters: {
    elmSource: \`${rawSource.split('`').join('\`')}\`,
    layout: 'centered'
  },
  argTypes: {
    onAction: { action: "Elm", control: 'none' }
  }
}

export const ${finalModuleName} = (controls) => {
  const node = document.createElement('div');
  window.requestAnimationFrame(() => {
    const app = globalThis.Elm.Stories.${fullModuleName}.init({ node });
    if (app.ports && app.ports.logAction) {
      app.ports.logAction.subscribe((msg) => {
        controls.onAction(msg);
      });
    }
  });
  return node;
}
`.trim(),
        map: null
      };
    }
  }
});