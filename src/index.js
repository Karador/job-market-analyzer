const { runFetch } = require('./run/fetch');
const { runTop } = require('./run/top');
const { runAnalyze } = require('./run/analyze');

const mode = process.argv[2] ?? 'analyze';

(async () => {
  switch (mode) {
    case 'fetch':
      await runFetch();
      break;
    case 'top':
      await runTop();
      break;
    case 'analyze':
      await runAnalyze();
      break;
    default:
    // await runFresh();
  }
})();
