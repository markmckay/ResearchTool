import type { Paper } from "@/types/paper";

export async function exportBookmarksToDocx(papers: Paper[]): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat } =
    await import("docx");
  const { saveAs } = await import("file-saver");

  const children: any[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun("Saved Research Papers")],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Exported ${new Date().toLocaleDateString()} · ${papers.length} papers`,
          color: "888888",
          size: 20,
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  papers.forEach((paper, i) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun(`${i + 1}. ${paper.title}`)],
        spacing: { before: 320 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: [paper.authors, paper.year, paper.venue].filter(Boolean).join(" · "),
            color: "666666",
            size: 20,
          }),
        ],
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Abstract", bold: true })],
      }),
      new Paragraph({
        children: [new TextRun({ text: paper.abstract, size: 20 })],
        spacing: { after: 120 },
      })
    );

    if (paper.doi) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "DOI: ", bold: true }),
            new TextRun({ text: `https://doi.org/${paper.doi}` }),
          ],
          spacing: { after: 80 },
        })
      );
    }

    if (paper.pdfUrl) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "PDF: ", bold: true }),
            new TextRun({ text: paper.pdfUrl }),
          ],
          spacing: { after: 80 },
        })
      );
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Source: ${paper.source} · Citations: ${paper.citations}`, color: "888888", size: 18 })],
        spacing: { after: 240 },
      })
    );
  });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: "1F3864" },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: "2E5FA3" },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const bytes = new Uint8Array(buffer);
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  saveAs(blob, `research-papers-${new Date().toISOString().slice(0, 10)}.docx`);
}
