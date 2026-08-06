import rawData from '$lib/datasets/stat_5.tsv?raw';

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

function splitTsvLine(line) {
  return line
    .split('\t')
    .map((value) => value.trim());
}

function toPercentage(value) {
  const cleanedValue = String(
    value ?? ''
  )
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
   * Supports:
   * 61%  → 61
   * 0.61 → 61
   */
  return number <= 1
    ? Math.round(number * 100)
    : Math.round(number);
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



/*
 * Supports both "Key" and "Kay" in case
 * the spreadsheet currently contains the typo.
 */
function getColumn(
  row,
  ...possibleNames
) {
  for (
    const name of possibleNames
  ) {
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

  const firstCohort =
    String(
      getColumn(
        rowByColumn,
        'Key Stat 1 Who',
        'Kay Stat 1 Who'
      )
    ).trim();

  if (
    Number.isFinite(firstValue) &&
    firstCohort
  ) {
    headlines.push({
      index: 0,
      value: firstValue,
      cohort: firstCohort
    });
  }

  const secondValue =
    toPercentage(
      getColumn(
        rowByColumn,
        'Key Stat 2 Value'
      )
    );

  const secondCohort =
    String(
      getColumn(
        rowByColumn,
        'Key Stat 2 Who',
        'Kay Stat 2 Who'
      )
    ).trim();

  if (
    Number.isFinite(secondValue) &&
    secondCohort
  ) {
    headlines.push({
      index: 1,
      value: secondValue,
      cohort: secondCohort
    });
  }

  return headlines;
}

export function parseStat2Data(
  tsv = rawData
) {
  const lines = tsv
    .split(/\r?\n/)
    .map((line) =>
      line.trimEnd()
    )
    .filter(Boolean);

  /*
   * New files have a broad grouping row first,
   * followed by the actual column names.
   *
   * Rather than assuming the row starts with
   * "Measure", find the row containing the
   * required columns.
   */
  const columnHeaderIndex =
    lines.findIndex((line) => {
      const cells =
        splitTsvLine(line);

      return (
        cells.includes('Measure') &&
        cells.includes('AVERAGE')
      );
    });

  if (columnHeaderIndex === -1) {
    throw new Error(
      'Could not find the stat_1.tsv column header.'
    );
  }

  const rawColumns =
    splitTsvLine(
      lines[columnHeaderIndex]
    );

  /*
   * Business Unit and Industry both contain
   * "Other".
   *
   * Keep the first as "Other", rename the
   * subsequent one for Industry.
   */
  const duplicateCounts =
    new Map();

  const columns =
    rawColumns.map(
      (column) => {
        const count =
          duplicateCounts.get(
            column
          ) ?? 0;

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
    .slice(
      columnHeaderIndex + 1
    )
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

        const total =
          toPercentage(
            /*
             * New dataset uses TOTAL.
             * ALL fallback keeps this compatible
             * with older versions.
             */
            rowByColumn.AVERAGE ??
              rowByColumn.ALL
          );

        const headlineText =
          String(
            getColumn(
              rowByColumn,
              'Just sharing the text these selections are based on'
            )
          ).trim();

        return {
          id:
            `stat-2-${rowIndex}`,

          reportSection:
            rowByColumn
              .ReportSection ??
            '',

          order:
            rowByColumn.Order ??
            '',

          subHeading:
            rowByColumn[
              'Sub-Heading'
            ]?.trim() ?? '',

          measure:
            rowByColumn
              .Measure
              ?.trim(),

          total,

          headlineText,

          headlines:
            createHeadlineStats(
              rowByColumn
            ),

          segments:
            createSegmentValues(
              rowByColumn
            )
        };
      }
    )
    .filter(
      (row) =>
        row.measure &&
        Number.isFinite(
          row.total
        )
    );
}

export const SourceData =
  parseStat2Data();

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

      return Object.entries(
        cohortValues
      )
        .map(
          ([cohort, value]) => ({
            id:
              `${row.id}-${activeSegment}-${cohort}`,

            measure:
              row.measure,

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
    }
  );
}

export default SourceData;