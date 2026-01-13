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
        const b = v.rank === 'top' ? 'top' : 'other';

        const tech = v.vacancy.tech?.technologies || {};
        const meta = v.vacancy.tech?.meta || {};
        const text = v.vacancy.text || '';

        const roleFullstack =
            textIncludes(text, ROLE_HINTS.fullstack);

        if (!meta.hasFrontend) continue;

        if (meta.hasBackend && tech['nodejs']) {
            inc(byBucket[b], 'frontendPlusNode');
        } else if (meta.hasBackend || roleFullstack) {
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
    };
}

module.exports = { marketRoleProfile };
