import { FastifyReply } from 'fastify';
import * as ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export class ExportUtils {
  /**
   * Stream an Excel file through Fastify
   */
  static async toExcel(
    reply: FastifyReply,
    filename: string,
    data: Record<string, any>[],
    columns: { header: string; key: string; width?: number }[],
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PEL ERP';
    workbook.created = new Date();

    const ws = workbook.addWorksheet('Data');
    ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 20 }));

    // Header row styling
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    };

    ws.addRows(
      data.map((row) => {
        const clean: Record<string, any> = {};
        for (const col of columns) {
          const val = row[col.key];
          // Convert Date objects to readable strings
          clean[col.key] = val instanceof Date ? val.toLocaleDateString('en-GB') : val ?? '';
        }
        return clean;
      }),
    );

    const buffer = await workbook.xlsx.writeBuffer();
    reply
      .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', `attachment; filename="${filename}.xlsx"`)
      .send(buffer);
  }

  /**
   * Send a CSV response through Fastify
   */
  static toCsv(
    reply: FastifyReply,
    filename: string,
    data: Record<string, any>[],
  ): void {
    // Flatten data so nested objects don't break CSV
    const flat = data.map((row) => {
      const r: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) continue; // skip relations
        r[k] = v instanceof Date ? v.toLocaleDateString('en-GB') : (Array.isArray(v) ? v.join(';') : v ?? '');
      }
      return r;
    });

    const csv = stringify(flat, { header: true });
    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${filename}.csv"`)
      .send(csv);
  }

  /**
   * Generate a simple PDF (text-based table) through Fastify using pdfkit
   */
  static async toPdf(
    reply: FastifyReply,
    filename: string,
    title: string,
    data: Record<string, any>[],
    columns: { header: string; key: string }[],
  ): Promise<void> {
    // Dynamically import pdfkit (CJS module)
    const PDFDocument = (await import('pdfkit')).default;

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', `attachment; filename="${filename}.pdf"`)
          .send(pdfBuffer);
        resolve();
      });
      doc.on('error', reject);

      // ─── Title ───────────────────────────────────────────────
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(title, { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#666666')
        .text(`Generated: ${new Date().toLocaleString('en-PK')}  |  Total records: ${data.length}`, { align: 'center' });
      doc.moveDown(1);
      doc.fillColor('#000000');

      // ─── Column Headers ───────────────────────────────────────
      const colWidth = (doc.page.width - 80) / columns.length;
      const headerY = doc.y;
      doc.rect(40, headerY, doc.page.width - 80, 16).fill('#1E3A5F');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      columns.forEach((col, i) => {
        doc.text(col.header, 40 + i * colWidth + 3, headerY + 4, { width: colWidth - 6, ellipsis: true });
      });
      doc.moveDown(1);

      // ─── Rows ─────────────────────────────────────────────────
      doc.fontSize(8).font('Helvetica').fillColor('#000000');
      data.forEach((row, idx) => {
        if (doc.y > doc.page.height - 60) doc.addPage();

        const rowY = doc.y;
        if (idx % 2 === 0) {
          doc.rect(40, rowY, doc.page.width - 80, 14).fill('#F5F8FF');
          doc.fillColor('#000000');
        }

        columns.forEach((col, i) => {
          let val = row[col.key];
          if (val instanceof Date) val = val.toLocaleDateString('en-GB');
          else if (val && typeof val === 'object') val = ''; // skip nested
          doc.text(String(val ?? ''), 40 + i * colWidth + 3, rowY + 3, { width: colWidth - 6, ellipsis: true });
        });

        doc.y = rowY + 14;
      });

      doc.end();
    });
  }
}
