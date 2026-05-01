import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import Execution from '../models/execution';
import mongoose from 'mongoose';

const router = Router();

// ─── GET /agent/export/pdf/:id ────────────────────────────────────────────────
router.get('/pdf/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const queryId = req.params.id;
  const orConditions: any[] = [{ id: queryId }];
  if (mongoose.Types.ObjectId.isValid(queryId)) {
    orConditions.push({ _id: queryId });
  }
  const item = await Execution.findOne({ $or: orConditions });
  
  if (!item) {
    res.status(404).json({ success: false, error: 'Execution record not found.' });
    return;
  }

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Execution_Report_${item.id}.pdf"`);
  doc.pipe(res);

  // Professional Agentic Brand Header
  doc.rect(0, 0, doc.page.width, 85).fill('#0f172a');
  doc.fillColor('#38bdf8').fontSize(22).font('Helvetica-Bold').text('Agentic AI Execution Report', 50, 25);
  doc.fillColor('#94a3b8').fontSize(11).font('Helvetica').text(`ID: ${item.id}  |  Quality Score: ${item.qualityScore}/100`, 50, 52);
  
  doc.moveDown(3);
  doc.fillColor('#000000');
  doc.fontSize(10).font('Helvetica-Bold').text(`Status: ${item.status?.toUpperCase()} | Date: ${new Date(item.timestamp).toLocaleString()}`);
  doc.moveDown(2);

  const addSection = (title: string, content?: string | null) => {
    if (!content || content.trim() === '') return;
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text(title);
    doc.moveDown(0.5);
    
    let inCodeBlock = false;
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        doc.moveDown(0.5);
        continue;
      }
      
      if (inCodeBlock) {
        doc.fontSize(10).font('Courier').fillColor('#334155').text(line, { lineGap: 2 });
      } else {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
          doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text(trimmed.replace(/^#\s/, ''), { lineGap: 4 });
        } else if (trimmed.startsWith('## ')) {
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#334155').text(trimmed.replace(/^##\s/, ''), { lineGap: 3 });
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          doc.fontSize(11).font('Helvetica').fillColor('#475569').text(`  • ${trimmed.substring(2)}`, { lineGap: 2 });
        } else if (trimmed === '') {
          doc.moveDown(0.5);
        } else {
          doc.fontSize(11).font('Helvetica').fillColor('#475569').text(line, { lineGap: 2 });
        }
      }
    }
    doc.moveDown(1.5);
  };

  addSection('Execution Goal', item.goal);
  addSection('Orchestrator Plan', item.plan);
  addSection('Final Response', item.refinedResult || item.executionResult);
  
  if (item.refinedPlan) {
    addSection('Refined Plan', item.refinedPlan);
  }

  // Add Critic Feedback
  const critique: any = item.critique;
  if (critique) {
    const feedback = `• Score: ${critique.qualityScore}/100\n• Satisfactory: ${critique.isSatisfactory ? 'YES' : 'NO'}\n• Issues: ${critique.issuesFound?.join(', ') || 'None'}\n• Focus: ${critique.refinementFocus || 'General improvement'}`;
    addSection('Critic Evaluation', feedback);
  }

  // Add Memory Section
  if (item.memoryUpdate && item.memoryUpdate !== 'No memory update.') {
    addSection('Learning & Memory Persistence', item.memoryUpdate);
  }

  doc.end();
});

// ─── GET /agent/export/docx/:id ───────────────────────────────────────────────
router.get('/docx/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const queryId = req.params.id;
  const orConditions: any[] = [{ id: queryId }];
  if (mongoose.Types.ObjectId.isValid(queryId)) {
    orConditions.push({ _id: queryId });
  }
  const item = await Execution.findOne({ $or: orConditions });
  
  if (!item) {
    res.status(404).json({ success: false, error: 'Execution record not found.' });
    return;
  }

  const parseMarkdown = (text: string): Paragraph[] => {
    if (!text) return [];
    const lines = text.split('\n');
    const paras: Paragraph[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('```')) {
        if (inCodeBlock && codeLines.length > 0) {
          paras.push(new Paragraph({
            children: [new TextRun({ text: codeLines.join('\n'), font: 'Courier New', size: 20 })],
            shading: { fill: "F1F5F9" },
            spacing: { before: 120, after: 120 }
          }));
          codeLines = [];
        }
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        paras.push(new Paragraph({ text: trimmed.replace(/^#\s/, ''), heading: HeadingLevel.HEADING_1 }));
      } else if (trimmed.startsWith('## ')) {
        paras.push(new Paragraph({ text: trimmed.replace(/^##\s/, ''), heading: HeadingLevel.HEADING_2 }));
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        paras.push(new Paragraph({ text: trimmed.substring(2), bullet: { level: 0 } }));
      } else if (trimmed !== '') {
        paras.push(new Paragraph({ text: trimmed }));
      }
    }
    return paras;
  };

  const children: Paragraph[] = [
    new Paragraph({ text: 'Agentic AI Execution Report', heading: HeadingLevel.TITLE }),
    new Paragraph({ 
      children: [
        new TextRun({ text: `ID: ${item.id}  |  Status: ${item.status?.toUpperCase() ?? 'UNKNOWN'}`, bold: true }),
        new TextRun({ text: `  |  Quality Score: ${item.qualityScore}/100`, bold: true, color: '38BDF8' })
      ] 
    }),
    new Paragraph({ children: [new TextRun({ text: `Timestamp: ${new Date(item.timestamp).toLocaleString()}` })] }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '1. Goal', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: item.goal || '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '2. Plan', heading: HeadingLevel.HEADING_1 }),
    ...parseMarkdown(item.plan || ''),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '3. Execution Result', heading: HeadingLevel.HEADING_1 }),
    ...parseMarkdown((item.refinedResult || item.executionResult) || ''),
  ];

  const critique: any = item.critique;
  if (critique) {
    children.push(new Paragraph({ text: '' }));
    children.push(new Paragraph({ text: '4. Critic Feedback', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({ text: `Score: ${critique.qualityScore}/100` }));
    children.push(new Paragraph({ text: `Satisfactory: ${critique.isSatisfactory ? 'YES' : 'NO'}` }));
    children.push(new Paragraph({ text: `Issues Detected: ${critique.issuesFound?.join(', ') || 'None'}` }));
    if (critique.refinementFocus) {
      children.push(new Paragraph({ text: `Refinement Focus: ${critique.refinementFocus}` }));
    }
  }

  if (item.refinedPlan) {
    children.push(new Paragraph({ text: '' }));
    children.push(new Paragraph({ text: '5. Refined Plan', heading: HeadingLevel.HEADING_1 }));
    children.push(...parseMarkdown(item.refinedPlan));
  }

  if (item.memoryUpdate && item.memoryUpdate !== 'No memory update.') {
    children.push(new Paragraph({ text: '' }));
    children.push(new Paragraph({ text: '6. Learning & Memory Update', heading: HeadingLevel.HEADING_1 }));
    children.push(...parseMarkdown(item.memoryUpdate));
  }

  const doc = new Document({
    styles: {
      default: {
        heading1: { run: { color: "1E293B", size: 32, bold: true, font: "Helvetica" }, paragraph: { spacing: { before: 240, after: 120 } } },
        heading2: { run: { color: "334155", size: 28, bold: true, font: "Helvetica" }, paragraph: { spacing: { before: 240, after: 120 } } },
        title: { run: { color: "0F172A", size: 44, bold: true, font: "Helvetica" }, paragraph: { spacing: { after: 240 } } },
        document: { run: { size: 22, font: "Helvetica", color: "475569" }, paragraph: { spacing: { after: 120 } } }
      }
    },
    sections: [{ children }]
  });

  const buffer = await Packer.toBuffer(doc);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="Execution_Report_${item.id}.docx"`);
  res.send(buffer);

});

export default router;
