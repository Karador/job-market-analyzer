const { runFetch } = require('./run/fetch');
const { runTop } = require('./run/top');
const { runAnalyze } = require('./run/analyze');
const { runFresh } = require('./run/fresh');

const mode = process.argv[2] ?? 'top';

(async () => {
  switch (mode) {
    case 'fetch':
      await runFetch();
      break;
    case 'top':
      await runTop({ limit: 5 });
      break;
    case 'analyze':
      await runAnalyze();
      break;
    default:
      await runFresh({ pages: 1, limit: 5 });
  }
})();
