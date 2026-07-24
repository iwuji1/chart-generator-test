import rawData from '$lib/datasets/stat_1.tsv?raw';

export const segments = [
  'Job Level',
  'Business Unit',
  'Industry',
  'Age Generation',
  'No. Of Employees',
  'Work Location'
];

export const segmentOptions = {
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
    'Industry — Other'
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
    '5,001 -  50,000',
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

function splitTsvLine(line) {
  return line
    .split('\t')
    .map((value) => value.trim());
}

function toPercentage(value) {
  const cleanedValue = String(value ?? '')
    .trim()
    .replace('%', '');

  if (
    cleanedValue === '' ||
    cleanedValue === '-'
  ) {
    return null;
  }

  const number = Number(cleanedValue);

  if (!Number.isFinite(number)) {
    return null;
  }

  /*
   * Supports both:
   * 61%  → 61
   * 0.61 → 61
   */
  return number <= 1
    ? Math.round(number * 100)
    : Math.round(number);
}

function createSegmentValues(rowByColumn) {
  return Object.fromEntries(
    segments.map((segment) => {
      const values = Object.fromEntries(
        segmentOptions[segment]
          .map((cohort) => [
            cohort,
            toPercentage(
              rowByColumn[cohort]
            )
          ])
          .filter(([, value]) =>
            Number.isFinite(value)
          )
      );

      return [
        segment,
        values
      ];
    })
  );
}

export function formatSubsegmentLabel(
  subsegment
) {
  return subsegment ===
    'Industry — Other'
    ? 'Other'
    : subsegment;
}

export function parseStat1Data(
  tsv = rawData
) {
  const lines = tsv
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  /*
   * The first row contains the broad segment names.
   * The second row contains the actual column names.
   */
  const columnHeaderIndex =
    lines.findIndex((line) =>
      line.startsWith('Measure\t')
    );

  if (columnHeaderIndex === -1) {
    throw new Error(
      'Could not find the stat_1.tsv column header.'
    );
  }

  const rawColumns = splitTsvLine(
    lines[columnHeaderIndex]
  );

  /*
   * Both Business Unit and Industry contain a
   * column named "Other". Rename the second one.
   */
  const duplicateCounts = new Map();

  const columns = rawColumns.map(
    (column) => {
      const count =
        duplicateCounts.get(column) ?? 0;

      duplicateCounts.set(
        column,
        count + 1
      );

      if (
        column !== 'Other' ||
        count === 0
      ) {
        return column;
      }

      return 'Industry — Other';
    }
  );

  return lines
    .slice(columnHeaderIndex + 1)
    .map(splitTsvLine)
    .map((cells, rowIndex) => {
      const rowByColumn =
        Object.fromEntries(
          columns.map(
            (column, columnIndex) => [
              column,
              cells[columnIndex] ?? ''
            ]
          )
        );

      return {
        id: `stat-1-${rowIndex}`,
        measure:
          rowByColumn.Measure?.trim(),

        total: toPercentage(
          rowByColumn.ALL
        ),

        segments:
          createSegmentValues(
            rowByColumn
          )
      };
    })
    .filter(
      (row) =>
        row.measure &&
        Number.isFinite(row.total)
    );
}

export const SourceData =
  parseStat1Data();

export function createLongData(
  sourceData = SourceData,
  activeSegment = segments[0]
) {
  return sourceData.flatMap(
    (row, rowIndex) => {
      const cohortValues =
        row.segments[
          activeSegment
        ] ?? {};

      const totalPoint = {
        id: `${row.id}-total`,
        measure: row.measure,
        rowIndex,
        segment: activeSegment,
        cohort: 'Total',
        value: row.total
      };

      const cohortPoints =
        Object.entries(cohortValues)
          .map(([cohort, value]) => ({
            id:
              `${row.id}-${activeSegment}-${cohort}`,

            measure: row.measure,
            rowIndex,
            segment: activeSegment,
            cohort,
            value: Number(value)
          }))
          .filter((point) =>
            Number.isFinite(point.value)
          );

      return [
        totalPoint,
        ...cohortPoints
      ];
    }
  );
}

export default SourceData;