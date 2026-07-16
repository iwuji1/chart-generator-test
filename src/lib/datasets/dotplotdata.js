// dotplotdata.js

export const cohorts = [
  'CEO',
  'Senior Executive',
  'Senior Leader',
  'Mid-Level Leader',
  'First Level Supervisor/Manager',
  'Individual Contributor'
];

export const years = [2026, 2025, 2024];

export const SourceData = [
  {
    topic: 'Pay and compensation',
    response: '#1 reason to join',
    values: {
      2026: {
        CEO: 85,
        'Senior Executive': 68,
        'Senior Leader': 69,
        'Mid-Level Leader': 76,
        'First Level Supervisor/Manager': 51,
        'Individual Contributor': 81
      },
      2025: {
        CEO: 60,
        'Senior Executive': 90,
        'Senior Leader': 10,
        'Mid-Level Leader': 86,
        'First Level Supervisor/Manager': 89,
        'Individual Contributor': 75
      },
      2024: {
        CEO: 84,
        'Senior Executive': 34,
        'Senior Leader': 60,
        'Mid-Level Leader': 24,
        'First Level Supervisor/Manager': 61,
        'Individual Contributor': 70
      }
    }
  },
  {
    topic: 'Pay and compensation',
    response: '#1 reason to stay',
    values: {
      2026: {
        CEO: 82,
        'Senior Executive': 19,
        'Senior Leader': 43,
        'Mid-Level Leader': 34,
        'First Level Supervisor/Manager': 42,
        'Individual Contributor': 83
      },
      2025: {
        CEO: 65,
        'Senior Executive': 31,
        'Senior Leader': 78,
        'Mid-Level Leader': 43,
        'First Level Supervisor/Manager': 53,
        'Individual Contributor': 31
      },
      2024: {
        CEO: 56,
        'Senior Executive': 73,
        'Senior Leader': 16,
        'Mid-Level Leader': 51,
        'First Level Supervisor/Manager': 83,
        'Individual Contributor': 84
      }
    }
  },
  {
    topic: 'Pay and compensation',
    response: '#1 reason to leave',
    values: {
      2026: {
        CEO: 73,
        'Senior Executive': 39,
        'Senior Leader': 55,
        'Mid-Level Leader': 58,
        'First Level Supervisor/Manager': 72,
        'Individual Contributor': 31
      },
      2025: {
        CEO: 11,
        'Senior Executive': 63,
        'Senior Leader': 12,
        'Mid-Level Leader': 56,
        'First Level Supervisor/Manager': 12,
        'Individual Contributor': 69
      },
      2024: {
        CEO: 47,
        'Senior Executive': 70,
        'Senior Leader': 40,
        'Mid-Level Leader': 60,
        'First Level Supervisor/Manager': 53,
        'Individual Contributor': 84
      }
    }
  },
  {
    topic: 'Job security',
    response: 'When evaluating a new employer',
    values: {
      2026: {
        CEO: 83,
        'Senior Executive': 52,
        'Senior Leader': 58,
        'Mid-Level Leader': 24,
        'First Level Supervisor/Manager': 24,
        'Individual Contributor': 15
      },
      2025: {
        CEO: 55,
        'Senior Executive': 17,
        'Senior Leader': 15,
        'Mid-Level Leader': 22,
        'First Level Supervisor/Manager': 74,
        'Individual Contributor': 87
      },
      2024: {
        CEO: 11,
        'Senior Executive': 23,
        'Senior Leader': 67,
        'Mid-Level Leader': 41,
        'First Level Supervisor/Manager': 17,
        'Individual Contributor': 87
      }
    }
  },
  {
    topic: 'Job security',
    response: 'For retention',
    values: {
      2026: {
        CEO: 81,
        'Senior Executive': 37,
        'Senior Leader': 30,
        'Mid-Level Leader': 28,
        'First Level Supervisor/Manager': 22,
        'Individual Contributor': 35
      },
      2025: {
        CEO: 73,
        'Senior Executive': 11,
        'Senior Leader': 14,
        'Mid-Level Leader': 50,
        'First Level Supervisor/Manager': 64,
        'Individual Contributor': 66
      },
      2024: {
        CEO: 78,
        'Senior Executive': 28,
        'Senior Leader': 26,
        'Mid-Level Leader': 45,
        'First Level Supervisor/Manager': 31,
        'Individual Contributor': 73
      }
    }
  },
  {
    topic: 'Job security',
    response: 'Would leave if security deteriorated',
    values: {
      2026: {
        CEO: 71,
        'Senior Executive': 27,
        'Senior Leader': 65,
        'Mid-Level Leader': 21,
        'First Level Supervisor/Manager': 20,
        'Individual Contributor': 72
      },
      2025: {
        CEO: 77,
        'Senior Executive': 78,
        'Senior Leader': 22,
        'Mid-Level Leader': 20,
        'First Level Supervisor/Manager': 64,
        'Individual Contributor': 62
      },
      2024: {
        CEO: 22,
        'Senior Executive': 21,
        'Senior Leader': 55,
        'Mid-Level Leader': 85,
        'First Level Supervisor/Manager': 87,
        'Individual Contributor': 63
      }
    }
  },
  {
    topic: 'Employee wellbeing and benefits',
    response: 'When joining',
    values: {
      2026: {
        CEO: 81,
        'Senior Executive': 66,
        'Senior Leader': 18,
        'Mid-Level Leader': 14,
        'First Level Supervisor/Manager': 65,
        'Individual Contributor': 67
      },
      2025: {
        CEO: 15,
        'Senior Executive': 88,
        'Senior Leader': 19,
        'Mid-Level Leader': 45,
        'First Level Supervisor/Manager': 63,
        'Individual Contributor': 89
      },
      2024: {
        CEO: 56,
        'Senior Executive': 44,
        'Senior Leader': 55,
        'Mid-Level Leader': 45,
        'First Level Supervisor/Manager': 59,
        'Individual Contributor': 17
      }
    }
  },
  {
    topic: 'Employee wellbeing and benefits',
    response: 'For staying',
    values: {
      2026: {
        CEO: 78,
        'Senior Executive': 17,
        'Senior Leader': 35,
        'Mid-Level Leader': 25,
        'First Level Supervisor/Manager': 21,
        'Individual Contributor': 48
      },
      2025: {
        CEO: 50,
        'Senior Executive': 49,
        'Senior Leader': 77,
        'Mid-Level Leader': 23,
        'First Level Supervisor/Manager': 20,
        'Individual Contributor': 32
      },
      2024: {
        CEO: 47,
        'Senior Executive': 44,
        'Senior Leader': 44,
        'Mid-Level Leader': 25,
        'First Level Supervisor/Manager': 71,
        'Individual Contributor': 54
      }
    }
  },
  {
    topic: 'Employee wellbeing and benefits',
    response: 'Would leave because of inadequate benefits',
    values: {
      2026: {
        CEO: 69,
        'Senior Executive': 19,
        'Senior Leader': 81,
        'Mid-Level Leader': 77,
        'First Level Supervisor/Manager': 18,
        'Individual Contributor': 45
      },
      2025: {
        CEO: 53,
        'Senior Executive': 35,
        'Senior Leader': 24,
        'Mid-Level Leader': 10,
        'First Level Supervisor/Manager': 31,
        'Individual Contributor': 67
      },
      2024: {
        CEO: 36,
        'Senior Executive': 65,
        'Senior Leader': 54,
        'Mid-Level Leader': 29,
        'First Level Supervisor/Manager': 54,
        'Individual Contributor': 62
      }
    }
  },
  {
    topic: 'The work itself',
    response: 'When choosing an employer',
    values: {
      2026: {
        CEO: 80,
        'Senior Executive': 23,
        'Senior Leader': 16,
        'Mid-Level Leader': 89,
        'First Level Supervisor/Manager': 66,
        'Individual Contributor': 35
      },
      2025: {
        CEO: 44,
        'Senior Executive': 20,
        'Senior Leader': 53,
        'Mid-Level Leader': 57,
        'First Level Supervisor/Manager': 49,
        'Individual Contributor': 83
      },
      2024: {
        CEO: 44,
        'Senior Executive': 86,
        'Senior Leader': 27,
        'Mid-Level Leader': 32,
        'First Level Supervisor/Manager': 18,
        'Individual Contributor': 38
      }
    }
  },
  {
    topic: 'The work itself',
    response: 'For staying',
    values: {
      2026: {
        CEO: 75,
        'Senior Executive': 29,
        'Senior Leader': 90,
        'Mid-Level Leader': 83,
        'First Level Supervisor/Manager': 46,
        'Individual Contributor': 62
      },
      2025: {
        CEO: 30,
        'Senior Executive': 19,
        'Senior Leader': 15,
        'Mid-Level Leader': 82,
        'First Level Supervisor/Manager': 33,
        'Individual Contributor': 75
      },
      2024: {
        CEO: 17,
        'Senior Executive': 56,
        'Senior Leader': 36,
        'Mid-Level Leader': 40,
        'First Level Supervisor/Manager': 62,
        'Individual Contributor': 50
      }
    }
  },
  {
    topic: 'The work itself',
    response: 'Would leave because of dissatisfaction with the work',
    values: {
      2026: {
        CEO: 64,
        'Senior Executive': 42,
        'Senior Leader': 58,
        'Mid-Level Leader': 67,
        'First Level Supervisor/Manager': 28,
        'Individual Contributor': 46
      },
      2025: {
        CEO: 18,
        'Senior Executive': 60,
        'Senior Leader': 89,
        'Mid-Level Leader': 45,
        'First Level Supervisor/Manager': 59,
        'Individual Contributor': 70
      },
      2024: {
        CEO: 75,
        'Senior Executive': 74,
        'Senior Leader': 82,
        'Mid-Level Leader': 48,
        'First Level Supervisor/Manager': 46,
        'Individual Contributor': 37
      }
    }
  },
  {
    topic: 'Fair treatment and consistency',
    response: 'When joining',
    values: {
      2026: {
        CEO: 79,
        'Senior Executive': 83,
        'Senior Leader': 86,
        'Mid-Level Leader': 60,
        'First Level Supervisor/Manager': 38,
        'Individual Contributor': 16
      },
      2025: {
        CEO: 90,
        'Senior Executive': 72,
        'Senior Leader': 56,
        'Mid-Level Leader': 30,
        'First Level Supervisor/Manager': 26,
        'Individual Contributor': 20
      },
      2024: {
        CEO: 32,
        'Senior Executive': 87,
        'Senior Leader': 19,
        'Mid-Level Leader': 38,
        'First Level Supervisor/Manager': 32,
        'Individual Contributor': 55
      }
    }
  },
  {
    topic: 'Fair treatment and consistency',
    response: 'For staying',
    values: {
      2026: {
        CEO: 77,
        'Senior Executive': 16,
        'Senior Leader': 70,
        'Mid-Level Leader': 24,
        'First Level Supervisor/Manager': 30,
        'Individual Contributor': 72
      },
      2025: {
        CEO: 28,
        'Senior Executive': 78,
        'Senior Leader': 52,
        'Mid-Level Leader': 83,
        'First Level Supervisor/Manager': 40,
        'Individual Contributor': 89
      },
      2024: {
        CEO: 19,
        'Senior Executive': 51,
        'Senior Leader': 78,
        'Mid-Level Leader': 19,
        'First Level Supervisor/Manager': 70,
        'Individual Contributor': 87
      }
    }
  },
  {
    topic: 'Fair treatment and consistency',
    response: 'Would leave if they felt unfairly treated',
    values: {
      2026: {
        CEO: 63,
        'Senior Executive': 72,
        'Senior Leader': 34,
        'Mid-Level Leader': 75,
        'First Level Supervisor/Manager': 75,
        'Individual Contributor': 27
      },
      2025: {
        CEO: 28,
        'Senior Executive': 43,
        'Senior Leader': 30,
        'Mid-Level Leader': 81,
        'First Level Supervisor/Manager': 65,
        'Individual Contributor': 76
      },
      2024: {
        CEO: 87,
        'Senior Executive': 78,
        'Senior Leader': 32,
        'Mid-Level Leader': 14,
        'First Level Supervisor/Manager': 59,
        'Individual Contributor': 20
      }
    }
  }
];

/**
 * Converts the readable nested source data into chart-ready long data.
 *
 * Output:
 * {
 *   topic,
 *   response,
 *   rowIndex,
 *   year,
 *   cohort,
 *   value
 * }
 */

export function createLongData(sourceData = SourceData) {
  return sourceData.flatMap((row, rowIndex) =>
    Object.entries(row.values).flatMap(([year, cohortValues]) =>
      Object.entries(cohortValues).map(([cohort, value]) => ({
        topic: row.topic,
        response: row.response,
        rowIndex,
        year: Number(year),
        cohort,
        value: Number(value)
      }))
    )
  );
}

export const dotPlotData = createLongData();

export default SourceData;