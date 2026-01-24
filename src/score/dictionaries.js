const entrySignals = {
  positive: {
    'junior': 0.6,
    'intern': 0.5,
    'стажировка': 0.4
  },
  negative: {
    'senior': -3,
    'lead': -3,
    '5+': -2.5
  }
};

const softPenalties = {
  experienceMismatch: {
    phrases: ['senior', 'lead', '5+'],
    penalty: -0.35
  },

  experienceStretch: {
    phrases: ['middle', '3+'],
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

module.exports = { entrySignals, softPenalties, qualitySignals };
