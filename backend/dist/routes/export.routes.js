"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdfkit_1 = __importDefault(require("pdfkit"));
const docx_1 = require("docx");
const pipeline_1 = require("../orchestrator/pipeline");
const router = (0, express_1.Router)();
// ─── GET /agent/export/pdf/:id ────────────────────────────────────────────────
router.get('/pdf/:id', (req, res) => {
    const item = (0, pipeline_1.getHistory)().find(x => x.id === req.params.id);
    if (!item) {
        res.status(404).json({ success: false, error: 'Execution record not found.' });
        return;
    }
    const doc = new pdfkit_1.default({ margin: 50 });
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
router.get('/docx/:id', async (req, res) => {
    const item = (0, pipeline_1.getHistory)().find(x => x.id === req.params.id);
    if (!item) {
        res.status(404).json({ success: false, error: 'Execution record not found.' });
        return;
    }
    const children = [
        new docx_1.Paragraph({ text: 'Agentic AI Execution Report', heading: docx_1.HeadingLevel.TITLE }),
        new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `ID: ${item.id}  |  Status: ${item.status.toUpperCase()}  |  Quality Score: ${item.qualityScore}/100`, bold: true })] }),
        new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Date: ${new Date(item.timestamp).toLocaleString()}` })] }),
        new docx_1.Paragraph({}),
        new docx_1.Paragraph({ text: 'Goal', heading: docx_1.HeadingLevel.HEADING_1 }),
        new docx_1.Paragraph({ text: item.goal }),
        new docx_1.Paragraph({}),
        new docx_1.Paragraph({ text: 'Plan', heading: docx_1.HeadingLevel.HEADING_1 }),
        new docx_1.Paragraph({ text: item.plan }),
        new docx_1.Paragraph({}),
        new docx_1.Paragraph({ text: 'Execution Result', heading: docx_1.HeadingLevel.HEADING_1 }),
        new docx_1.Paragraph({ text: item.refinedResult || item.executionResult }),
    ];
    if (item.refinedPlan) {
        children.push(new docx_1.Paragraph({}));
        children.push(new docx_1.Paragraph({ text: 'Refined Plan', heading: docx_1.HeadingLevel.HEADING_1 }));
        children.push(new docx_1.Paragraph({ text: item.refinedPlan }));
    }
    const doc = new docx_1.Document({ sections: [{ children }] });
    const buffer = await docx_1.Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${item.id}.docx"`);
    res.send(buffer);
});
exports.default = router;
//# sourceMappingURL=export.routes.js.map