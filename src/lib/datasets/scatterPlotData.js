// scatterPlotData.js
// 62 segments × 13 measures = 806 source values.
// The single dash in the supplied data is represented as null.

export const measures = [
  'I feel excited and positive about how emerging technologies like AI will change the way I work',
  'I think using AI in my role will bolster my value in the next three years',
  'I feel certain that my role will be replaced by AI/tech in the next three years',
  'I feel adequately trained to use AI tools',
  "When I've been asked to use AI to help with my job, I found it increased my efficiency",
  'I feel leaders in my organization understand AI and how the organization should utilize it',
  'My organization encourages and reinforces AI learning and development',
  'AI adoption is happening at scale across my organization, not just in isolated teams',
  'AI tools allow me to focus on more high-value work',
  'AI or new technologies in my organization are enabling me to innovate at work',
  'AI tools are being integrated into how work gets done in my role',
  'I am assessed on my level of AI fluency',
  'AI fluency is incorporated into our employee reviews'
];

export const segmentGroups = {
  Overall: ['Total'],

  'Job Level': [
    'CEO',
    'Senior Executive',
    'Senior Leader',
    'Mid-Level Leader',
    'First Level Supervisor/Manager',
    'Individual Contributor'
  ],

  'Business Unit': [
    'Accounting and Finance',
    'Corporate Management',
    'Customer Service',
    'Human Resources',
    'Information Technology',
    'Marketing and Advertising',
    'Operations',
    'Production',
    'Purchasing',
    'Research and Development',
    'Sales',
    'Other'
  ],

  Industry: [
    'Technology',
    'Not for profit',
    'Media and Entertainment',
    'Retail',
    'Sports',
    'Travel, Hospitality and Leisure',
    'Healthcare',
    'Life Sciences',
    'Financial Services',
    'Industrial',
    'Clean Technology',
    'Government',
    'Energy',
    'Telecommunications',
    'Professional Services',
    'Consumer Goods',
    'Utility',
    'Other'
  ],

  'Age Generation': [
    'Gen Z',
    'Millennial',
    'Gen X',
    'Baby Boomers'
  ],

  'No. Of Employees': [
    '1 - 50',
    '51 - 500',
    '501 - 5,000',
    '5,001 - 50,000',
    '50,001 - 100,000',
    '100,001 - 200,000',
    '200,001 - 300,000',
    '300,001 - 400,000',
    '400,001 - 500,000',
    'Over 500,000'
  ],

  'Work Location': [
    'USA',
    'UK',
    'France',
    'Germany',
    'UAE',
    'Saudi Arabia',
    'Singapore',
    'India',
    'Japan',
    'Australia',
    'Brazil'
  ]
};

/*
 * The values in every row follow the exact order of the
 * full statements in the exported `measures` array above.
 */
const rawSegments = [
  {
    group: 'Overall',
    segment: 'Total',
    values: [
      0.65, 0.58, 0.44, 0.52, 0.63, 0.56, 0.55,
      0.54, 0.6, 0.61, 0.54, 0.47, 0.5
    ]
  },

  {
    group: 'Job Level',
    segment: 'CEO',
    values: [
      0.79, 0.73, 0.39, 0.64, 0.79, 0.77, 0.74,
      0.75, 0.74, 0.77, 0.71, 0.67, 0.64
    ]
  },
  {
    group: 'Job Level',
    segment: 'Senior Executive',
    values: [
      0.65, 0.6, 0.41, 0.54, 0.64, 0.62, 0.58,
      0.59, 0.61, 0.62, 0.58, 0.49, 0.54
    ]
  },
  {
    group: 'Job Level',
    segment: 'Senior Leader',
    values: [
      0.63, 0.59, 0.43, 0.5, 0.61, 0.57, 0.56,
      0.51, 0.59, 0.61, 0.53, 0.48, 0.5
    ]
  },
  {
    group: 'Job Level',
    segment: 'Mid-Level Leader',
    values: [
      0.69, 0.61, 0.5, 0.54, 0.67, 0.57, 0.58,
      0.55, 0.64, 0.64, 0.57, 0.49, 0.52
    ]
  },
  {
    group: 'Job Level',
    segment: 'First Level Supervisor/Manager',
    values: [
      0.72, 0.64, 0.49, 0.6, 0.72, 0.6, 0.62,
      0.59, 0.68, 0.69, 0.6, 0.54, 0.57
    ]
  },
  {
    group: 'Job Level',
    segment: 'Individual Contributor',
    values: [
      0.52, 0.46, 0.37, 0.4, 0.51, 0.43, 0.41,
      0.41, 0.49, 0.47, 0.43, 0.34, 0.37
    ]
  },

  {
    group: 'Business Unit',
    segment: 'Accounting and Finance',
    values: [
      0.72, 0.65, 0.52, 0.57, 0.7, 0.64, 0.63,
      0.63, 0.68, 0.67, 0.63, 0.57, 0.57
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Corporate Management',
    values: [
      0.69, 0.62, 0.41, 0.54, 0.67, 0.61, 0.6,
      0.58, 0.64, 0.66, 0.58, 0.51, 0.54
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Customer Service',
    values: [
      0.53, 0.47, 0.38, 0.43, 0.53, 0.46, 0.44,
      0.44, 0.51, 0.52, 0.45, 0.36, 0.41
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Human Resources',
    values: [
      0.66, 0.59, 0.44, 0.5, 0.62, 0.55, 0.56,
      0.52, 0.6, 0.63, 0.55, 0.46, 0.48
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Information Technology',
    values: [
      0.8, 0.74, 0.53, 0.67, 0.78, 0.71, 0.71,
      0.68, 0.75, 0.76, 0.7, 0.64, 0.67
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Marketing and Advertising',
    values: [
      0.64, 0.55, 0.44, 0.52, 0.63, 0.55, 0.56,
      0.53, 0.57, 0.59, 0.52, 0.47, 0.5
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Operations',
    values: [
      0.6, 0.55, 0.4, 0.48, 0.6, 0.52, 0.51,
      0.5, 0.57, 0.57, 0.49, 0.42, 0.46
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Production',
    values: [
      0.59, 0.51, 0.41, 0.46, 0.56, 0.49, 0.45,
      0.44, 0.54, 0.52, 0.46, 0.41, 0.43
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Purchasing',
    values: [
      0.62, 0.55, 0.39, 0.48, 0.58, 0.52, 0.54,
      0.47, 0.58, 0.55, 0.49, 0.41, 0.45
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Research and Development',
    values: [
      0.69, 0.66, 0.48, 0.59, 0.71, 0.62, 0.63,
      0.63, 0.66, 0.68, 0.61, 0.54, 0.56
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Sales',
    values: [
      0.62, 0.54, 0.41, 0.47, 0.59, 0.54, 0.52,
      0.48, 0.58, 0.58, 0.52, 0.41, 0.46
    ]
  },
  {
    group: 'Business Unit',
    segment: 'Other',
    values: [
      0.48, 0.42, 0.34, 0.37, 0.45, 0.4, 0.35,
      0.4, 0.45, 0.42, 0.39, 0.29, 0.34
    ]
  },

  {
    group: 'Industry',
    segment: 'Technology',
    values: [
      0.81, 0.76, 0.54, 0.7, 0.79, 0.77, 0.76,
      0.76, 0.76, 0.77, 0.76, 0.67, 0.68
    ]
  },
  {
    group: 'Industry',
    segment: 'Not for profit',
    values: [
      0.59, 0.54, 0.43, 0.45, 0.59, 0.47, 0.46,
      0.43, 0.53, 0.53, 0.44, 0.42, 0.43
    ]
  },
  {
    group: 'Industry',
    segment: 'Media and Entertainment',
    values: [
      0.68, 0.58, 0.45, 0.55, 0.64, 0.59, 0.6,
      0.61, 0.59, 0.63, 0.62, 0.48, 0.52
    ]
  },
  {
    group: 'Industry',
    segment: 'Retail',
    values: [
      0.57, 0.5, 0.42, 0.44, 0.54, 0.53, 0.47,
      0.43, 0.54, 0.55, 0.48, 0.38, 0.44
    ]
  },
  {
    group: 'Industry',
    segment: 'Sports',
    values: [
      0.7, 0.61, 0.45, 0.54, 0.68, 0.62, 0.59,
      0.6, 0.63, 0.64, 0.62, 0.5, 0.53
    ]
  },
  {
    group: 'Industry',
    segment: 'Travel, Hospitality and Leisure',
    values: [
      0.57, 0.51, 0.41, 0.48, 0.59, 0.49, 0.5,
      0.41, 0.54, 0.57, 0.46, 0.41, 0.46
    ]
  },
  {
    group: 'Industry',
    segment: 'Healthcare',
    values: [
      0.59, 0.53, 0.39, 0.48, 0.57, 0.5, 0.49,
      0.53, 0.54, 0.57, 0.45, 0.39, 0.43
    ]
  },
  {
    group: 'Industry',
    segment: 'Life Sciences',
    values: [
      0.67, 0.6, 0.44, 0.52, 0.64, 0.59, 0.56,
      0.53, 0.64, 0.63, 0.57, 0.48, 0.49
    ]
  },
  {
    group: 'Industry',
    segment: 'Financial Services',
    values: [
      0.73, 0.69, 0.5, 0.62, 0.74, 0.71, 0.68,
      0.73, 0.71, 0.69, 0.69, 0.62, 0.63
    ]
  },
  {
    group: 'Industry',
    segment: 'Industrial',
    values: [
      0.62, 0.54, 0.43, 0.49, 0.59, 0.5, 0.49,
      0.46, 0.57, 0.57, 0.48, 0.44, 0.47
    ]
  },
  {
    group: 'Industry',
    segment: 'Clean Technology',
    values: [
      0.73, 0.64, 0.47, 0.58, 0.71, 0.66, 0.66,
      0.66, 0.66, 0.67, 0.66, 0.59, 0.59
    ]
  },
  {
    group: 'Industry',
    segment: 'Government',
    values: [
      0.55, 0.51, 0.36, 0.41, 0.54, 0.41, 0.43,
      0.4, 0.51, 0.52, 0.4, 0.35, 0.39
    ]
  },
  {
    group: 'Industry',
    segment: 'Energy',
    values: [
      0.71, 0.62, 0.46, 0.53, 0.68, 0.57, 0.55,
      0.51, 0.65, 0.66, 0.52, 0.51, 0.54
    ]
  },
  {
    group: 'Industry',
    segment: 'Telecommunications',
    values: [
      0.7, 0.61, 0.5, 0.57, 0.69, 0.68, 0.66,
      0.61, 0.69, 0.69, 0.64, 0.53, 0.58
    ]
  },
  {
    group: 'Industry',
    segment: 'Professional Services',
    values: [
      0.58, 0.57, 0.37, 0.46, 0.58, 0.51, 0.51,
      0.52, 0.57, 0.58, 0.48, 0.42, 0.42
    ]
  },
  {
    group: 'Industry',
    segment: 'Consumer Goods',
    values: [
      0.61, 0.52, 0.39, 0.48, 0.59, 0.44, 0.47,
      0.44, 0.53, 0.57, 0.51, 0.41, 0.45
    ]
  },
  {
    group: 'Industry',
    segment: 'Utility',
    values: [
      0.61, 0.55, 0.43, 0.49, 0.61, 0.48, 0.48,
      0.4, 0.58, 0.55, 0.48, 0.43, 0.48
    ]
  },
  {
    group: 'Industry',
    segment: 'Other',
    values: [
      1, 1, 0.5, 0.5, 1, 1, 0.5,
      1, 1, 1, 1, null, 0.5
    ]
  },

  {
    group: 'Age Generation',
    segment: 'Gen Z',
    values: [
      0.73, 0.63, 0.52, 0.6, 0.72, 0.61, 0.62,
      0.6, 0.66, 0.67, 0.61, 0.55, 0.56
    ]
  },
  {
    group: 'Age Generation',
    segment: 'Millennial',
    values: [
      0.72, 0.65, 0.48, 0.58, 0.71, 0.63, 0.62,
      0.6, 0.68, 0.69, 0.61, 0.54, 0.58
    ]
  },
  {
    group: 'Age Generation',
    segment: 'Gen X',
    values: [
      0.57, 0.52, 0.38, 0.45, 0.55, 0.5, 0.49,
      0.47, 0.53, 0.54, 0.48, 0.4, 0.43
    ]
  },
  {
    group: 'Age Generation',
    segment: 'Baby Boomers',
    values: [
      0.38, 0.35, 0.26, 0.26, 0.36, 0.33, 0.31,
      0.31, 0.37, 0.38, 0.32, 0.23, 0.27
    ]
  },

  {
    group: 'No. Of Employees',
    segment: '1 - 50',
    values: [
      0.49, 0.44, 0.32, 0.39, 0.5, 0.43, 0.41,
      0.38, 0.49, 0.46, 0.41, 0.32, 0.34
    ]
  },
  {
    group: 'No. Of Employees',
    segment: '51 - 500',
    values: [
      0.66, 0.58, 0.45, 0.51, 0.63, 0.54, 0.54,
      0.52, 0.61, 0.62, 0.54, 0.47, 0.5
    ]
  },
  {
    group: 'No. Of Employees',
    segment: '501 - 5,000',
    values: [
      0.71, 0.63, 0.47, 0.57, 0.69, 0.61, 0.61,
      0.58, 0.66, 0.67, 0.6, 0.53, 0.56
    ]
  },
  {
    group: 'No. Of Employees',
    segment: '5,001 - 50,000',
    values: [
      0.67, 0.62, 0.47, 0.57, 0.65, 0.6, 0.61,
      0.58, 0.63, 0.65, 0.6, 0.53, 0.56
    ]
  },
  {
    group: 'No. Of Employees',
    segment: '50,001 - 100,000',
    values: [
      0.67, 0.63, 0.48, 0.54, 0.67, 0.63, 0.57,
      0.64, 0.61, 0.63, 0.58, 0.52, 0.55
    ]
  },
  {
    group: 'No. Of Employees',
    segment: '100,001 - 200,000',
    values: [
      0.71, 0.63, 0.51, 0.53, 0.67, 0.62, 0.65,
      0.65, 0.59, 0.64, 0.6, 0.49, 0.57
    ]
  },
  {
    group: 'No. Of Employees',
    segment: '200,001 - 300,000',
    values: [
      0.65, 0.65, 0.42, 0.55, 0.59, 0.65, 0.58,
      0.61, 0.6, 0.61, 0.6, 0.58, 0.54
    ]
  },
  {
    group: 'No. Of Employees',
    segment: '300,001 - 400,000',
    values: [
      0.7, 0.65, 0.53, 0.55, 0.68, 0.7, 0.66,
      0.68, 0.6, 0.61, 0.6, 0.57, 0.53
    ]
  },
  {
    group: 'No. Of Employees',
    segment: '400,001 - 500,000',
    values: [
      0.72, 0.69, 0.5, 0.61, 0.66, 0.61, 0.59,
      0.63, 0.69, 0.69, 0.58, 0.48, 0.59
    ]
  },
  {
    group: 'No. Of Employees',
    segment: 'Over 500,000',
    values: [
      0.51, 0.42, 0.47, 0.58, 0.62, 0.53, 0.51,
      0.56, 0.62, 0.62, 0.53, 0.47, 0.49
    ]
  },

  {
    group: 'Work Location',
    segment: 'USA',
    values: [
      0.64, 0.58, 0.46, 0.49, 0.61, 0.58, 0.54,
      0.54, 0.59, 0.6, 0.54, 0.48, 0.5
    ]
  },
  {
    group: 'Work Location',
    segment: 'UK',
    values: [
      0.66, 0.61, 0.38, 0.55, 0.68, 0.63, 0.59,
      0.57, 0.65, 0.66, 0.6, 0.52, 0.54
    ]
  },
  {
    group: 'Work Location',
    segment: 'France',
    values: [
      0.53, 0.5, 0.42, 0.41, 0.53, 0.48, 0.48,
      0.47, 0.5, 0.52, 0.46, 0.39, 0.42
    ]
  },
  {
    group: 'Work Location',
    segment: 'Germany',
    values: [
      0.59, 0.52, 0.41, 0.42, 0.54, 0.49, 0.46,
      0.46, 0.53, 0.52, 0.47, 0.42, 0.43
    ]
  },
  {
    group: 'Work Location',
    segment: 'UAE',
    values: [
      0.76, 0.65, 0.5, 0.62, 0.68, 0.62, 0.61,
      0.6, 0.66, 0.68, 0.59, 0.53, 0.58
    ]
  },
  {
    group: 'Work Location',
    segment: 'Saudi Arabia',
    values: [
      0.81, 0.7, 0.54, 0.65, 0.78, 0.67, 0.66,
      0.63, 0.73, 0.74, 0.65, 0.59, 0.6
    ]
  },
  {
    group: 'Work Location',
    segment: 'Singapore',
    values: [
      0.69, 0.64, 0.44, 0.51, 0.69, 0.54, 0.58,
      0.55, 0.65, 0.65, 0.56, 0.44, 0.5
    ]
  },
  {
    group: 'Work Location',
    segment: 'India',
    values: [
      0.86, 0.74, 0.6, 0.76, 0.81, 0.73, 0.74,
      0.7, 0.78, 0.8, 0.73, 0.69, 0.7
    ]
  },
  {
    group: 'Work Location',
    segment: 'Japan',
    values: [
      0.5, 0.4, 0.33, 0.31, 0.48, 0.41, 0.39,
      0.38, 0.44, 0.46, 0.38, 0.32, 0.34
    ]
  },
  {
    group: 'Work Location',
    segment: 'Australia',
    values: [
      0.56, 0.51, 0.38, 0.44, 0.57, 0.51, 0.5,
      0.48, 0.53, 0.54, 0.49, 0.39, 0.43
    ]
  },
  {
    group: 'Work Location',
    segment: 'Brazil',
    values: [
      0.73, 0.69, 0.4, 0.7, 0.74, 0.6, 0.63,
      0.58, 0.71, 0.7, 0.62, 0.48, 0.59
    ]
  }
];

/*
 * This transforms each numeric array into a values object
 * whose keys are the complete survey statements.
 */
export const SourceData = rawSegments.map(
  ({ group, segment, values }) => ({
    group,
    segment,
    values: Object.fromEntries(
      measures.map((measure, index) => [
        measure,
        values[index]
      ])
    )
  })
);

/*
 * Produces the selected scatter-plot coordinates.
 *
 * xMeasure and yMeasure should be the complete strings
 * selected from the exported `measures` array.
 */
export function getScatterData({
  xMeasure,
  yMeasure,
  groups = Object.keys(segmentGroups)
}) {
  return SourceData
    .filter((point) => groups.includes(point.group))
    .map((point) => ({
      group: point.group,
      segment: point.segment,
      x: point.values[xMeasure],
      y: point.values[yMeasure]
    }))
    .filter(
      (point) =>
        Number.isFinite(point.x) &&
        Number.isFinite(point.y)
    );
}

export default SourceData;