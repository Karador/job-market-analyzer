const ROLE_HINTS = {
    backend: [
        'api',
        'rest',
        'graphql',
        'server',
        'backend',
        'микросервис',
        'микросервисы'
    ],
    fullstack: [
        'fullstack',
        'full-stack',
        'end-to-end'
    ]
};

function textIncludes(text, words) {
    const t = text.toLowerCase();
    return words.some(w => t.includes(w));
}

function bucket(score) {
    if (score >= 0.5) return 'top';
    if (score >= 0.3) return 'good';
    if (score >= 0.2) return 'mid';
    return 'low';
}

function inc(map, key, by = 1) {
    map[key] = (map[key] || 0) + by;
}

function marketRoleProfile(scoredVacancies) {
    const roles = {
        frontendTotal: 0,
        frontendPlusBackend: 0,
        frontendPlusNode: 0,
        pureFrontend: 0
    };

    const byBucket = {
        top: { ...roles },
        other: { ...roles }
    };

    for (const v of scoredVacancies) {
        const b = bucket(v.scores.total) === 'top' ? 'top' : 'other';

        const tech = v.vacancy.tech?.technologies || {};
        const meta = v.vacancy.tech?.meta || {};
        const text = v.vacancy.text || '';

        const roleBackend =
            meta.hasBackend ||
            tech['nodejs'] ||
            textIncludes(text, ROLE_HINTS.backend);

        const roleFullstack =
            textIncludes(text, ROLE_HINTS.fullstack);

        const isFrontend =
            meta.hasFrontend ||
            tech['react.web'] ||
            tech['vue'] ||
            tech['angular'];

        if (!isFrontend) continue;

        const hasBackend =
            meta.hasBackend ||
            tech['nodejs'];

        if (hasBackend && tech['nodejs']) {
            inc(byBucket[b], 'frontendPlusNode');
        } else if (hasBackend || roleFullstack || roleBackend) {
            inc(byBucket[b], 'frontendPlusBackend');
        } else {
            inc(byBucket[b], 'pureFrontend');
        }

        inc(byBucket[b], 'frontendTotal');
    }

    function normalize(group) {
        const total = group.frontendTotal || 1;
        return {
            frontendTotal: Number((group.frontendTotal / total).toFixed(2)),
            pureFrontend: Number((group.pureFrontend / total).toFixed(2)),
            frontendPlusBackend: Number((group.frontendPlusBackend / total).toFixed(2)),
            frontendPlusNode: Number((group.frontendPlusNode / total).toFixed(2))
        };
    }

    return {
        top: normalize(byBucket.top),
        other: normalize(byBucket.other),
        insight: [
            'Top frontend вакансии значительно чаще ожидают backend или Node.js компетенции',
            'Pure frontend роль редко соответствует top-вакансиям'
        ]
    };
}

module.exports = { marketRoleProfile };
