const taskTypes = {
  web: {
    weight: 1,
    keywords: {
      frontend: 1,
      backend: 1,
      fullstack: 1.2,
      react: 1.5,
      vue: 1.3,
      javascript: 0.7,
      html: 0.3,
      css: 0.3
    }
  },
  automation: {
    weight: 1,
    keywords: {
      automation: 1.5,
      rpa: 1.5,
      bot: 0.3,
      script: 0.3,
      integration: 1
    }
  },
  data: {
    weight: 1,
    keywords: {
      data: 1,
      airflow: 1.2,
      sql: 0.8,
      python: 0.6
    }
  },
};

const entrySignals = {
  positive: {
    'без опыта': 2,
    'начинающий': 1.5,
    'junior': 1.5,
    'стажировка': 1.2,
    'обучение': 1
  },
  negative: {
    '3+': -2,
    'senior': -3,
    'lead': -3,
    'highload': -1.5
  }
};

const softPenalties = {
  experienceMismatch: {
    phrases: [
      'middle',
      'middle+',
      'senior',
      'lead',
      '3+',
      '5+'
    ],
    penalty: -0.35
  },

  unclearSalary: {
    phrases: [
      'з.п. не указана',
      'по договоренности',
      'от 0 до',
      'без указания зарплаты'
    ],
    penalty: -0.1
  },

  soloResponsibility: {
    phrases: [
      'вся зона ответственности',
      'единственный разработчик',
      'полностью твоя ответственность',
      'самостоятельно',
      'стартап'
    ],
    penalty: -0.15
  }
};

const qualitySignals = {
  negative: {
    'помогаем найти работу': -4,
    'обучаем с нуля': -3,
    'карьерный рост без опыта': -3,
    'поддержка на старте карьеры': -3,
    'мы помогаем начинающим': -3,
    'заполни анкету': -1,
    'наставник поможет': -1,
    'мы вас научим': -2
  }
};

module.exports = { taskTypes, entrySignals, softPenalties, qualitySignals };
