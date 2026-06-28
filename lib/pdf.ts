import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type RGB } from "pdf-lib";
import type { ResumeAnalysis } from "@/types/resume";
import type { ResumeReportAnalytics } from "@/types/report";
import { APP_NAME } from "@/lib/constants";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  accent: rgb(0.31, 0.27, 0.9),
  accentLight: rgb(0.94, 0.93, 0.99),
  text: rgb(0.07, 0.07, 0.07),
  muted: rgb(0.42, 0.42, 0.46),
  border: rgb(0.88, 0.88, 0.91),
  surface: rgb(0.97, 0.97, 0.98),
  white: rgb(1, 1, 1),
  success: rgb(0.09, 0.64, 0.38),
  warning: rgb(0.85, 0.47, 0.02),
};

interface TextOptions {
  size?: number;
  bold?: boolean;
  color?: RGB;
  indent?: number;
  lineGap?: number;
}

/** Wraps text to fit within a max width using font metrics. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

class PdfBuilder {
  private doc: PDFDocument;
  private page: PDFPage;
  private y: number;
  private font: PDFFont;
  private bold: PDFFont;

  constructor(doc: PDFDocument, font: PDFFont, bold: PDFFont) {
    this.doc = doc;
    this.font = font;
    this.bold = bold;
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  private drawLines(lines: string[], x: number, opts: Required<Pick<TextOptions, "size" | "lineGap">> & TextOptions) {
    const font = opts.bold ? this.bold : this.font;
    const lineHeight = opts.size + opts.lineGap;

    for (const line of lines) {
      this.ensureSpace(lineHeight);
      this.page.drawText(line, {
        x,
        y: this.y,
        size: opts.size,
        font,
        color: opts.color ?? COLORS.text,
      });
      this.y -= lineHeight;
    }
  }

  drawText(text: string, opts: TextOptions = {}) {
    const size = opts.size ?? 11;
    const lineGap = opts.lineGap ?? 5;
    const indent = opts.indent ?? 0;
    const maxWidth = CONTENT_WIDTH - indent;
    const lines = wrapText(text, opts.bold ? this.bold : this.font, size, maxWidth);
    this.drawLines(lines, MARGIN + indent, { ...opts, size, lineGap });
  }

  drawGap(gap = 12) {
    this.y -= gap;
  }

  drawRect(x: number, y: number, w: number, h: number, color: RGB) {
    this.page.drawRectangle({ x, y, width: w, height: h, color });
  }

  drawSectionTitle(title: string) {
    this.ensureSpace(36);
    this.drawGap(8);
    const barHeight = 22;
    const barY = this.y - barHeight + 6;
    this.drawRect(MARGIN, barY, CONTENT_WIDTH, barHeight, COLORS.accentLight);
    this.page.drawText(title, {
      x: MARGIN + 10,
      y: barY + 6,
      size: 12,
      font: this.bold,
      color: COLORS.accent,
    });
    this.y = barY - 10;
  }

  drawBulletList(items: string[]) {
    for (const item of items) {
      this.drawText(`•  ${item}`, { size: 10, indent: 8, color: COLORS.muted, lineGap: 4 });
      this.drawGap(2);
    }
  }

  drawNumberedList(items: string[]) {
    items.forEach((item, i) => {
      this.drawText(`${i + 1}.  ${item}`, { size: 10, indent: 4, color: COLORS.muted, lineGap: 4 });
      this.drawGap(2);
    });
  }

  drawStatRow(stats: { label: string; value: number; suffix?: string }[]) {
    const gap = 8;
    const cardW = (CONTENT_WIDTH - gap * (stats.length - 1)) / stats.length;
    const cardH = 52;
    this.ensureSpace(cardH + 8);

    const baseY = this.y;
    stats.forEach((stat, i) => {
      const x = MARGIN + i * (cardW + gap);
      this.drawRect(x, baseY - cardH, cardW, cardH, COLORS.surface);
      this.page.drawRectangle({
        x,
        y: baseY - cardH,
        width: cardW,
        height: cardH,
        borderColor: COLORS.border,
        borderWidth: 1,
      });
      this.page.drawText(stat.label.toUpperCase(), {
        x: x + 10,
        y: baseY - 18,
        size: 7,
        font: this.bold,
        color: COLORS.muted,
      });
      this.page.drawText(`${stat.value}${stat.suffix ?? ""}`, {
        x: x + 10,
        y: baseY - 38,
        size: 18,
        font: this.bold,
        color: COLORS.text,
      });
    });
    this.y = baseY - cardH - 12;
  }

  drawProgressBar(label: string, score: number, max = 100) {
    const barH = 8;
    const labelH = 16;
    this.ensureSpace(labelH + barH + 12);

    this.page.drawText(label, {
      x: MARGIN,
      y: this.y,
      size: 10,
      font: this.bold,
      color: COLORS.text,
    });
    this.page.drawText(`${score}/${max}`, {
      x: PAGE_WIDTH - MARGIN - 40,
      y: this.y,
      size: 10,
      font: this.bold,
      color: COLORS.accent,
    });
    this.y -= labelH;

    const barY = this.y - barH;
    this.drawRect(MARGIN, barY, CONTENT_WIDTH, barH, COLORS.border);
    const fillW = Math.max(0, Math.min(CONTENT_WIDTH, (score / max) * CONTENT_WIDTH));
    if (fillW > 0) {
      this.drawRect(MARGIN, barY, fillW, barH, COLORS.accent);
    }
    this.y = barY - 14;
  }

  drawHistoryBars(history: { date: string; score: number }[]) {
    if (history.length === 0) {
      this.drawText("No resume history yet.", { size: 10, color: COLORS.muted });
      return;
    }

    const rowH = 22;
    this.ensureSpace(history.length * rowH + 8);

    for (const entry of history.slice(-6)) {
      this.ensureSpace(rowH);
      const baseY = this.y;

      this.page.drawText(entry.date, {
        x: MARGIN,
        y: baseY - 14,
        size: 9,
        font: this.font,
        color: COLORS.muted,
      });

      const barX = MARGIN + 70;
      const barMaxW = CONTENT_WIDTH - 120;
      const barW = (entry.score / 100) * barMaxW;

      this.drawRect(barX, baseY - 16, barMaxW, 10, COLORS.border);
      this.drawRect(barX, baseY - 16, barW, 10, COLORS.accent);

      this.page.drawText(String(entry.score), {
        x: barX + barMaxW + 8,
        y: baseY - 14,
        size: 9,
        font: this.bold,
        color: COLORS.text,
      });

      this.y = baseY - rowH;
    }
  }

  drawHeader(fileName: string, generatedAt: string) {
    const headerH = 72;
    this.drawRect(0, PAGE_HEIGHT - headerH, PAGE_WIDTH, headerH, COLORS.accent);
    this.page.drawText(APP_NAME, {
      x: MARGIN,
      y: PAGE_HEIGHT - 32,
      size: 18,
      font: this.bold,
      color: COLORS.white,
    });
    this.page.drawText("Resume Analysis Report", {
      x: MARGIN,
      y: PAGE_HEIGHT - 52,
      size: 11,
      font: this.font,
      color: rgb(0.85, 0.85, 0.95),
    });
    this.y = PAGE_HEIGHT - headerH - 24;

    this.drawText(`File: ${fileName}`, { size: 10, color: COLORS.muted });
    this.drawText(`Generated: ${generatedAt}`, { size: 10, color: COLORS.muted });
    this.drawGap(8);
  }

  async save(): Promise<Uint8Array> {
    return this.doc.save();
  }
}

/** Generates and downloads a styled resume analysis PDF with analytics. */
export async function generateResumePDF(
  fileName: string,
  analysis: ResumeAnalysis,
  analytics: ResumeReportAnalytics,
) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pdf = new PdfBuilder(doc, font, bold);

  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  pdf.drawHeader(fileName, generatedAt);
  pdf.drawProgressBar("ATS Score", analysis.atsScore);
  pdf.drawGap(4);

  pdf.drawSectionTitle("Summary");
  pdf.drawText(analysis.summary, { size: 10, color: COLORS.muted, lineGap: 4 });

  pdf.drawSectionTitle("Strengths");
  pdf.drawBulletList(analysis.strengths);

  pdf.drawSectionTitle("Weaknesses");
  pdf.drawBulletList(analysis.weaknesses);

  if (analysis.missingSkills.length > 0) {
    pdf.drawSectionTitle("Missing Skills");
    pdf.drawBulletList(analysis.missingSkills);
  }

  if (analysis.projectFeedback.length > 0) {
    pdf.drawSectionTitle("Project Feedback");
    pdf.drawBulletList(analysis.projectFeedback);
  }

  pdf.drawSectionTitle("Actionable Suggestions");
  pdf.drawNumberedList(analysis.suggestions);

  pdf.drawSectionTitle("Preparation Analytics");
  pdf.drawText("Your overall interview readiness based on resume, mock interviews, and coding.", {
    size: 10,
    color: COLORS.muted,
  });
  pdf.drawGap(6);
  pdf.drawStatRow([
    { label: "Readiness", value: analytics.readinessScore, suffix: "%" },
    { label: "Resume", value: analytics.resumeScore },
    { label: "Interview Avg", value: analytics.interviewAvg, suffix: "%" },
  ]);
  pdf.drawStatRow([
    { label: "Coding Avg", value: analytics.codingAvg, suffix: "%" },
    {
      label: "Resume Change",
      value: analytics.recentPerformance.find((p) => p.label === "Resume Score")?.change ?? 0,
      suffix: "%",
    },
    {
      label: "Interview Change",
      value: analytics.recentPerformance.find((p) => p.label === "Interview Avg")?.change ?? 0,
      suffix: "%",
    },
  ]);

  pdf.drawGap(4);
  pdf.drawText("Resume score history", { size: 10, bold: true });
  pdf.drawGap(4);
  pdf.drawHistoryBars(analytics.resumeHistory);

  if (analytics.strongAreas.length > 0 || analytics.weakAreas.length > 0) {
    pdf.drawSectionTitle("Skill Areas");
    if (analytics.strongAreas.length > 0) {
      pdf.drawText("Strong areas", { size: 10, bold: true });
      pdf.drawGap(4);
      pdf.drawBulletList(analytics.strongAreas.map((a) => `${a.area} — ${a.score}%`));
    }
    if (analytics.weakAreas.length > 0) {
      pdf.drawGap(4);
      pdf.drawText("Areas to improve", { size: 10, bold: true });
      pdf.drawGap(4);
      pdf.drawBulletList(analytics.weakAreas.map((a) => `${a.area} — ${a.score}%`));
    }
  }

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume-analysis-${Date.now()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
