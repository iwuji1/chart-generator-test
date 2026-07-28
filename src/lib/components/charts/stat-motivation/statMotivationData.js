import rawData
  from '$lib/datasets/stat_motivation.tsv?raw';

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

  const number =
    Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
}

export function parseMotivationData(
  tsv = rawData
) {
  const lines = tsv
    .split(/\r?\n/)
    .map((line) =>
      line.trimEnd()
    )
    .filter(Boolean);

  const headers =
    splitTsvLine(lines[0]);

  return lines
    .slice(1)
    .map(splitTsvLine)
    .map((cells) => {
      const row =
        Object.fromEntries(
          headers.map(
            (
              header,
              index
            ) => [
              header,
              cells[index] ?? ''
            ]
          )
        );

      return {
        cohort:
          row.Cohort,

        values: {
          2024:
            toPercentage(
              row['2024']
            ),

          2025:
            toPercentage(
              row['2025']
            ),

          2026:
            toPercentage(
              row['2026']
            )
        }
      };
    })
    .filter(
      (row) =>
        row.cohort
    );
}

export const SourceData =
  parseMotivationData();

export const cohorts =
  SourceData.map(
    (row) =>
      row.cohort
  );

export default SourceData;