function computeStackShape(vacancy) {
    const meta = vacancy.tech?.meta ?? {};
    const intentConfidence = meta.intentConfidence;

    let stackShape = 'unknown';

    if (meta.hasReactNative) {
        stackShape =
            intentConfidence !== 'low'
                ? 'mobile-mixed'
                : 'mobile-only';

    } else if (intentConfidence !== 'low' && meta.hasBackend) {
        stackShape =
            intentConfidence === 'high'
                ? 'frontend+backend'
                : 'frontend+backend-weak';

    } else if (intentConfidence !== 'low') {
        stackShape =
            intentConfidence === 'high'
                ? 'frontend-only'
                : 'frontend-only-weak';
    }

    vacancy.tech.meta.stackShape = stackShape;

    return vacancy;
}

module.exports = { computeStackShape };
