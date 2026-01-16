function inc(map, key, by = 1) {
    map[key] = (map[key] || 0) + by;
}

function hasTech(v, tech) {
    return v.vacancy.tech?.tags?.includes(tech);
}

function getBucketed(vacancies) {
    const buckets = { top: [], good: [], mid: [], low: [] };

    for (const v of vacancies) {
        buckets[v.rank].push(v);
    }

    return buckets;
}

function marketProfile(scoredVacancies) {
    const buckets = getBucketed(scoredVacancies);

    const coverage = {
        total: scoredVacancies.length,
        buckets: Object.fromEntries(
            Object.entries(buckets).map(([k, v]) => [k, v.length])
        )
    };

    const allTech = new Set();

    for (const v of scoredVacancies) {
        for (const t of v.vacancy.tech?.tags || []) {
            allTech.add(t);
        }
    }

    function techShare(list) {
        const total = list.length;
        const result = {};

        for (const tech of allTech) {
            let count = 0;
            for (const v of list) {
                if (hasTech(v, tech)) count++;
            }
            result[tech] = total ? Number((count / total).toFixed(2)) : 0;
        }

        return result;
    }

    const techShareByBucket = {
        overall: techShare(scoredVacancies),
        top: techShare(buckets.top),
        good: techShare(buckets.good),
        mid: techShare(buckets.mid),
        low: techShare(buckets.low)
    };

    const stackShapes = {};

    for (const v of scoredVacancies) {
        const shape = v.vacancy.tech?.meta?.stackShape ?? 'unknown';
        inc(stackShapes, shape);
    }

    const rn = {
        total: 0,
        pure: 0,
        mixed: 0,
        score: {
            pure: [],
            mixed: [],
            none: []
        }
    };

    for (const v of scoredVacancies) {
        const meta = v.vacancy.tech?.meta || {};
        const hasRN = meta.hasReactNative;

        if (!hasRN) {
            rn.score.none.push(v.scores.total);
            continue;
        }

        rn.total++;

        if (meta.hasFrontend) {
            rn.mixed++;
            rn.score.mixed.push(v.scores.total);
        } else {
            rn.pure++;
            rn.score.pure.push(v.scores.total);
        }
    }

    const notes = [];

    if (techShareByBucket.top['react.web'] > 0.7) {
        notes.push('React доминирует в top-вакансиях');
    }

    if (stackShapes['frontend+backend'] > stackShapes['frontend-only']) {
        notes.push('Frontend+Backend вакансии встречаются чаще, чем чистый frontend');
    }

    return {
        coverage,
        techShare: techShareByBucket,
        stackShapes,
        notes
    };
}

module.exports = { marketProfile };
