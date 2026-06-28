import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ResumeAnalysis } from "@/types/resume";

/** Generates and downloads a resume analysis PDF report. */
export async function generateResumePDF(fileName: string, analysis: ResumeAnalysis) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([595, 842]);
  let y = 800;

  const drawText = (text: string, size = 11, isBold = false) => {
    if (y < 60) {
      page = doc.addPage([595, 842]);
      y = 800;
    }
    page.drawText(text, {
      x: 50,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: 495,
    });
    y -= size + 8;
  };

  drawText("PrepPilot AI — Resume Analysis Report", 18, true);
  drawText(`File: ${fileName}`, 10);
  drawText(`ATS Score: ${analysis.atsScore}/100`, 14, true);
  y -= 8;

  drawText("Summary", 13, true);
  drawText(analysis.summary);
  y -= 8;

  const sections = [
    { title: "Strengths", items: analysis.strengths },
    { title: "Weaknesses", items: analysis.weaknesses },
    { title: "Missing Skills", items: analysis.missingSkills },
    { title: "Suggestions", items: analysis.suggestions },
  ];

  for (const section of sections) {
    drawText(section.title, 13, true);
    for (const item of section.items) {
      drawText(`• ${item}`);
    }
    y -= 8;
  }

  const pdfBytes = await doc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume-analysis-${Date.now()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
