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
};

function includesAny(text, phrases = []) {
  return phrases.some(p => text.includes(p));
}

function normalizeTechnologies(vacancy) {
  const text = vacancy.text.toLowerCase();

  const technologies = {};
  const tags = new Set();
  const meta = {
    hasReactNative: false,
    hasFrontend: false,
    hasBackend: false,
  };

  // --- PASS 1: direct matches ---
  for (const rule of Object.values(TECH_RULES)) {
    const matched = rule.match.filter(k => text.includes(k));
    if (!matched.length) continue;

    // React with subtypes
    if (rule.canonical === "react" && rule.subtypes) {
      const nativeMatched = rule.subtypes.native.match.filter(k => text.includes(k));
      const webMatched =
        rule.subtypes.web.match.filter(k => text.includes(k)) &&
        !rule.subtypes.web.excludeIf.some(k => text.includes(k));

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
