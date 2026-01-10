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
  const tags = [];
  const meta = {
    hasReactNative: false,
    hasFrontend: false,
  };

  for (const rule of Object.values(TECH_RULES)) {
    const matched = rule.match.filter(k => text.includes(k));
    if (!matched.length) continue;

    if (rule.canonical === "react" && rule.subtypes) {
      const isNative = includesAny(text, rule.subtypes.native.match);
      const isWeb =
        includesAny(text, rule.subtypes.web.match) &&
        !includesAny(text, rule.subtypes.web.excludeIf);

      technologies.react = {
        web: isWeb,
        native: isNative,
        matched,
      };

      if (isNative) {
        tags.push("react.native");
        meta.hasReactNative = true;
      }

      if (isWeb) {
        tags.push("react.web");
        meta.hasFrontend = true;
      }

      continue;
    }

    technologies[rule.canonical] = { matched };
    tags.push(rule.canonical);

    if (["react", "vue", "angular"].includes(rule.canonical)) {
      meta.hasFrontend = true;
    }
  }

  return {
    ...vacancy,
    tech: {
      technologies,
      tags,
      meta,
    },
  }
}

module.exports = { normalizeTechnologies };
