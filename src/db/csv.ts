/**
 * Tiny RFC-4180 CSV reader (quotes, escaped quotes, CRLF, BOM). The artifacts are produced
 * by our own pipeline, but a quoted street name must never corrupt a row.
 */
export type CsvRow = Record<string, string>;

export function parseCsv(content: string): { headers: string[]; rows: CsvRow[] } {
  const text = content.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (char === "\r") continue;
    field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const headerRow = rows.shift();
  if (!headerRow) return { headers: [], rows: [] };
  const headers = headerRow.map((h) => h.trim());
  const parsed = rows
    .filter((cells) => cells.length > 1 || (cells[0] ?? "") !== "")
    .map((cells) => {
      const record: CsvRow = {};
      headers.forEach((header, index) => {
        record[header] = cells[index] ?? "";
      });
      return record;
    });
  return { headers, rows: parsed };
}
