import rawData from '$lib/datasets/stat_4.tsv?raw';

export const segments = [
  'Job Level',
  'Industry',
  'Generation',
  'Country'
];

export const segmentOptions = {
  'Job Level': [
    'CEO',
    'Senior Executive',
    'Senior Leader',
    'Mid-Level Leader',
    'First Level Supervisor/Manager',
    'Individual Contributor',
    'AVERAGE'
  ],

  'Industry': [
    'Communications Services',
    'Consumer Markets',
    'Energy',
    'Financial Services',
    'Government',
    'Healthcare',
    'Industrial',
    'Life Sciences',
    'Not for profit',
    'Professional Services',
    'Sports',
    'Technology',
    'Utility',
    'AVERAGE'
  ],

  'Generation': [
    'Baby Boomers',
    'Gen X',
    'Millennial',
    'Gen Z',
    'AVERAGE'
  ],

  'Country': [
    'Australia',
    'Brazil',
    'France',
    'Germany',
    'India',
    'Japan',
    'Saudi Arabia',
    'Singapore',
    'UAE',
    'UK',
    'USA',
    'AVERAGE'
  ]
};

export const topicOrder = [
  'IMPORTANT FACTORS FOR A NEW JOB',
  'IMPORTANT FACTORS FOR STAYING IN YOUR JOB',
  'IMPORTANT FACTORS FOR LEAVING YOUR JOB'
];

function splitTsvLine(line) {
  return line
    .split('\t')
    .map((value) => value.trim());
}

function toPercentage(value) {
  const cleaned = String(
    value ?? ''
  )
    .trim()
    .replace('%', '');

  if (
    cleaned === '' ||
    cleaned === '-'
  ) {
    return null;
  }

  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number <= 1
    ? Math.round(number * 100)
    : Math.round(number);
}

function getColumn(
  row,
  ...possibleNames
) {
  for (const name of possibleNames) {
    const value = row[name];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      return value;
    }
  }

  return '';
}

function normaliseTopic(
  subHeading
) {
  const value = String(
    subHeading ?? ''
  ).toLowerCase();

  if (
    value.includes('new job')
  ) {
    return 'IMPORTANT FACTORS FOR A NEW JOB';
  }

  if (
    value.includes('staying')
  ) {
    return 'IMPORTANT FACTORS FOR STAYING IN YOUR JOB';
  }

  if (
    value.includes('leaving')
  ) {
    return 'IMPORTANT FACTORS FOR LEAVING YOUR JOB';
  }

  return subHeading;
}

function createSegmentValues(
  rowByColumn
) {
  return Object.fromEntries(
    segments.map((segment) => {
      const values =
        Object.fromEntries(
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

  if (subsegment === 'AVERAGE') {
    return 'Global Average';
  }

  if (subsegment === 'Industry - Other') 
  {
    return 'Other';
  }
  return subsegment;
}

function createHeadlineStats(
  rowByColumn
) {
  const headlines = [];

  const firstValue =
    toPercentage(
      getColumn(
        rowByColumn,
        'Key Stat 1 Value'
      )
    );

  const firstWho =
    String(
      getColumn(
        rowByColumn,
        'Key Stat 1 Who',
        'Kay Stat 1 Who'
      )
    ).trim();

  if (
    Number.isFinite(firstValue) &&
    firstWho
  ) {
    headlines.push({
      index: 0,
      value: firstValue,
      cohort: firstWho
    });
  }

  const secondValue =
    toPercentage(
      getColumn(
        rowByColumn,
        'Key Stat 2 Value'
      )
    );

  const secondWho =
    String(
      getColumn(
        rowByColumn,
        'Key Stat 2 Who',
        'Kay Stat 2 Who'
      )
    ).trim();

  if (
    Number.isFinite(secondValue) &&
    secondWho
  ) {
    headlines.push({
      index: 1,
      value: secondValue,
      cohort: secondWho
    });
  }

  return headlines;
}

export function parseStat4Data(
  tsv = rawData
) {
  const lines = tsv
    .split(/\r?\n/)
    .map((line) =>
      line.trimEnd()
    )
    .filter(Boolean);

  /*
   * Find the actual column row, rather than relying
   * on its first field.
   */
  const headerIndex =
    lines.findIndex((line) => {
      const cells =
        splitTsvLine(line);

      return (
        cells.includes('Measure') &&
        cells.includes('AVERAGE')
      );
    });

  if (headerIndex === -1) {
    throw new Error(
      'Could not find stat_4.tsv header row.'
    );
  }

  const columns =
    splitTsvLine(
      lines[headerIndex]
    );

  return lines
    .slice(headerIndex + 1)
    .map(splitTsvLine)
    .map(
      (
        cells,
        rowIndex
      ) => {
        const rowByColumn =
          Object.fromEntries(
            columns.map(
              (
                column,
                columnIndex
              ) => [
                column,
                cells[
                  columnIndex
                ] ?? ''
              ]
            )
          );

        const average =
          toPercentage(
            rowByColumn.AVERAGE
          );

        return {
          id:
            `stat-4-${rowIndex}`,

          order:
            Number(
              rowByColumn.Order
            ) || rowIndex + 1,

          topic:
            normaliseTopic(
              rowByColumn[
                'Sub-Heading'
              ]
            ),

          reason:
            rowByColumn
              .Measure
              ?.trim() ?? '',

          headlineText:
            String(
              getColumn(
                rowByColumn,
                'Just sharing the text these selections are based on'
              )
            ).trim(),

          headlines:
            createHeadlineStats(
              rowByColumn
            ),

          average,

          segments:
            createSegmentValues(
              rowByColumn
            )
        };
      }
    )
    .filter(
      (row) =>
        row.topic &&
        row.reason &&
        Number.isFinite(
          row.average
        )
    )
    .sort(
      (a, b) =>
        a.order - b.order
    );
}

export const SourceData =
  parseStat4Data();

export function createLongData(
  sourceData = SourceData,
  activeSegment = segments[0]
) {
  return sourceData.flatMap(
    (row, rowIndex) => {
      const values =
        row.segments[
          activeSegment
        ] ?? {};

      const averagePoint = {
        id:
          `${row.id}-average`,

        topic:
          row.topic,

        reason:
          row.reason,

        rowIndex,

        segment:
          activeSegment,

        cohort:
          'Average',

        value:
          row.average
      };

      const cohortPoints =
        Object.entries(values)
          .map(
            ([cohort, value]) => ({
              id:
                `${row.id}-${activeSegment}-${cohort}`,

              topic:
                row.topic,

              reason:
                row.reason,

              rowIndex,

              segment:
                activeSegment,

              cohort,

              value:
                Number(value)
            })
          )
          .filter((point) =>
            Number.isFinite(
              point.value
            )
          );

      return [
        averagePoint,
        ...cohortPoints
      ];
    }
  );
}

export default SourceData;