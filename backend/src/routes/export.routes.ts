import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { getHistory } from '../orchestrator/pipeline';

const router = Router();

// ─── GET /agent/export/pdf/:id ────────────────────────────────────────────────
router.get('/pdf/:id', (req: Request, res: Response): void => {
  const item = getHistory().find(x => x.id === req.params.id);
  if (!item) {
    res.status(404).json({ success: false, error: 'Execution record not found.' });
    return;
  }

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${item.id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('Agentic AI Execution Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).font('Helvetica').text(`ID: ${item.id} | Status: ${item.status.toUpperCase()} | Score: ${item.qualityScore}/100`);
  doc.text(`Date: ${new Date(item.timestamp).toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text('Goal');
  doc.fontSize(11).font('Helvetica').text(item.goal);
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text('Plan');
  doc.fontSize(11).font('Helvetica').text(item.plan, { lineGap: 2 });
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text('Result');
  doc.fontSize(11).font('Helvetica').text(item.refinedResult || item.executionResult, { lineGap: 2 });

  if (item.refinedPlan) {
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('Refined Plan');
    doc.fontSize(11).font('Helvetica').text(item.refinedPlan, { lineGap: 2 });
  }

  doc.end();
});

// ─── GET /agent/export/docx/:id ───────────────────────────────────────────────
router.get('/docx/:id', async (req: Request, res: Response): Promise<void> => {
  const item = getHistory().find(x => x.id === req.params.id);
  if (!item) {
    res.status(404).json({ success: false, error: 'Execution record not found.' });
    return;
  }

  const children: Paragraph[] = [
    new Paragraph({ text: 'Agentic AI Execution Report', heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: `ID: ${item.id}  |  Status: ${item.status.toUpperCase()}  |  Quality Score: ${item.qualityScore}/100`, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: `Date: ${new Date(item.timestamp).toLocaleString()}` })] }),
    new Paragraph({}),
    new Paragraph({ text: 'Goal', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: item.goal }),
    new Paragraph({}),
    new Paragraph({ text: 'Plan', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: item.plan }),
    new Paragraph({}),
    new Paragraph({ text: 'Execution Result', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: item.refinedResult || item.executionResult }),
  ];

  if (item.refinedPlan) {
    children.push(new Paragraph({}));
    children.push(new Paragraph({ text: 'Refined Plan', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({ text: item.refinedPlan }));
  }

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${item.id}.docx"`);
  res.send(buffer);
});

export default router;
