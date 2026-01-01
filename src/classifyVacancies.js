const taskTypes = {
    web: [
        'web', 'веб',
        'frontend', 'backend', 'fullstack',
        'react', 'vue', 'angular',
        'node', 'express',
        'html', 'css'
    ],
    automation: [
        'automation',
        // 'script', 'скрипт',
        'parser', 'парсер',
        // 'bot', 'бот',
        'integration', 'интеграция',
        'internal tool',
        'low-code', 'nocode'
    ],
    data: [
        'data',
        'etl',
        'csv',
        'excel',
        'report',
        'analytics',
        'scraping', 'scraper'
    ],
    game: [
        'game', 'игр',
        'unity',
        'unreal',
        'gamedev'
    ],
    enterprise: [
        '1c', '1с',
        'sap',
        'oracle',
        'bitrix',
        'crm'
    ],
    mobile: [
        'android',
        'ios',
        'flutter',
        'react native'
    ],
    infra: [
        'devops',
        'docker',
        'kubernetes',
        'linux',
        'admin',
        'sysadmin'
    ],
    misc: [
        'low-code',
        'bpm',
        'rpa',
        'zapier',
        'make.com'
    ],
};

function classifyVacancies(vacancies = []) {
    const filteredVacancies = {};
    const intersections = [];

    vacancies.forEach((vacancy) => {
        const matchedGroups = [];
        const title = vacancy.title.toLowerCase();

        for (const [group, words] of Object.entries(taskTypes)) {
            if (words.some(word => title.includes(word))) {
                matchedGroups.push(group);

                if (!filteredVacancies[group]) {
                    filteredVacancies[group] = [];
                }

                filteredVacancies[group].push(vacancy);
            }
        }

        if (matchedGroups.length > 1) {
            intersections.push({ vacancy, matchedGroups });
        }
    });

    return {
        filteredVacancies,
        intersections,
    };
}

module.exports = { classifyVacancies };
