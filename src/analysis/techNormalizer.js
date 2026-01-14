const TECH_RULES = {
  javascript: {
    canonical: "javascript",
    match: ["javascript", "js"],
  },

  typescript: {
    canonical: "typescript",
    match: ["typescript", "ts"],
  },

  nodejs: {
    canonical: "nodejs",
    match: ["node.js", "nodejs", "node"],
  },

  react: {
    canonical: "react",
    match: ["react", "react.js", "reactjs"],
    subtypes: {
      native: {
        match: ["react native", "expo"],
      },
      web: {
        match: ["react"],
        excludeIf: ["react native", "expo"],
      },
    },
  },

  vue: {
    canonical: "vue",
    match: ["vue", "vue.js"],
  },

  angular: {
    canonical: "angular",
    match: ["angular"],
  },

  java: {
    canonical: "java",
    match: ["java"],
    excludeIf: ["javascript"],
  },

  dotnet: {
    canonical: "dotnet",
    match: [".net", "c#"]
  },

  php: {
    canonical: "php",
    match: ["php"],
  }
};

const TITLE_ROLE_HINTS = {
  frontend: [
    'web',
    'front',
    'веб',
    'фронт',
  ],
  backend: [
    'backend',
  ],
}

const ROLE_HINTS = {
  backend: [
    'server',
    'микросервис',
    'микросервисы'
  ],
  fullstack: [
    'fullstack',
    'full-stack',
    'end-to-end'
  ]
};

function includesAny(text, phrases = []) {
  return phrases.some(p => text.includes(p));
}

function normalizeTechnologies(vacancy) {
  const title = vacancy.title.toLowerCase();
  const text = vacancy.text.toLowerCase();

  const technologies = {};
  const tags = new Set();
  const meta = {
    hasReactNative: false,
    hasFrontend: false,
    hasFrontendIntent: false,
    hasBackend: false,
    hasBackendIntent: false,
    hasFullStackIntent: false,
    frontendFramework: null,   // 'react' | 'vue' | 'angular'
    ecosystem: 'unknown',      // 'js' | 'non-js' | 'unknown'
    isLayoutHeavy: false,
    isLegacyTooling: false,
    intentConfidence: 'low',
  };

  meta.hasFrontendIntent = includesAny(title, TITLE_ROLE_HINTS.frontend);
  meta.hasBackendIntent = includesAny(title, TITLE_ROLE_HINTS.backend) || includesAny(text, ROLE_HINTS.backend);
  meta.hasFullStackIntent = includesAny(text, ROLE_HINTS.fullstack);

  // --- PASS 1: direct matches ---
  for (const rule of Object.values(TECH_RULES)) {
    const matched = rule.match.filter(k => text.includes(k));
    if (!matched.length || includesAny(text, rule?.excludeIf)) continue;

    // React with subtypes
    if (rule.canonical === "react" && rule.subtypes) {
      const nativeMatched = rule.subtypes.native.match.filter(k => text.includes(k));
      const webMatched =
        !rule.subtypes.web.excludeIf.some(k => text.includes(k)) &&
        rule.subtypes.web.match.filter(k => text.includes(k));

      if (nativeMatched.length) {
        technologies['react.native'] = { matched: nativeMatched };
        tags.add('react.native');
        meta.hasReactNative = true;
      }

      if (webMatched.length) {
        technologies['react.web'] = { matched: webMatched };
        tags.add('react.web');
        meta.hasFrontend = true;
      }

      continue;
    }

    // Other tech
    technologies[rule.canonical] = { matched };
    tags.add(rule.canonical);

    if (['nodejs', 'php', 'laravel', 'dotnet', 'java'].includes(rule.canonical)) {
      meta.hasBackend = true;
    }

    if (['vue', 'angular'].includes(rule.canonical)) {
      meta.hasFrontend = true;
    }
  }

  if (technologies['react.web']) meta.frontendFramework = 'react';
  else if (technologies['vue']) meta.frontendFramework = 'vue';
  else if (technologies['angular']) meta.frontendFramework = 'angular';


  // --- PASS 2: inferred technologies ---
  if (
    technologies['react.web'] ||
    technologies['vue'] ||
    technologies['angular'] ||
    technologies['nodejs']
  ) {
    if (!technologies['javascript']) {
      technologies['javascript'] = { inferred: true };
      tags.add('javascript');
    }
  }

  const hasJS =
    technologies['javascript'] ||
    technologies['typescript'] ||
    technologies['nodejs'] ||
    technologies['react.web'] ||
    technologies['vue'] ||
    technologies['angular'];

  const hasExplicitNonJS =
    ['1c', 'java', 'dotnet', 'php'].some(t =>
      text.includes(t)
    );

  if (hasJS) meta.ecosystem = 'js';
  else if (hasExplicitNonJS) meta.ecosystem = 'non-js';
  else meta.ecosystem = 'unknown';

  if (
    includesAny(text, ['верстка', 'верстальщик', 'html', 'css', 'scss']) &&
    !technologies['react.web'] &&
    !technologies['typescript']
  ) {
    meta.isLayoutHeavy = true;
  }

  if (includesAny(text, ['gulp', 'pug', 'jquery'])) {
    meta.isLegacyTooling = true;
  }

  const sources = {
    framework: Boolean(meta.frontendFramework),
    jsStack: technologies['javascript'] || technologies['typescript'],
    intentText: meta.hasFrontendIntent || meta.hasFullStackIntent
  };

  const sourceCount = Object.values(sources).filter(Boolean).length;

  if (sourceCount >= 2) {
    meta.intentConfidence = 'high';
  } else if (sourceCount === 1) {
    meta.intentConfidence = 'medium';
  } else if (meta.hasFrontend) {
    meta.intentConfidence = 'low';
  }

  return {
    ...vacancy,
    tech: {
      technologies,
      tags: Array.from(tags),
      meta,
    },
  };
}

module.exports = { normalizeTechnologies };
