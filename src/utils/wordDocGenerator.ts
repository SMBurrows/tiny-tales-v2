import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from "docx";
import { saveAs } from "file-saver";

interface StoryPage {
  pageNumber: number;
  text: string;
  drawingPrompt: string;
}

interface PremadeStory {
  _id: string;
  title: string;
  description: string;
  pages: StoryPage[];
  ageGroup: string;
  category: string;
}

export const generateStoryWordDoc = async (story: PremadeStory) => {
  try {
    // Create document sections - using simple structure for maximum compatibility
    const children: Paragraph[] = [];

    // Title page
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: story.title,
            bold: true,
            size: 48,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
        },
      }),
    new Paragraph({
      children: [
        new TextRun({
          text: story.description,
          size: 24, // 12pt
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 200,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Age Group: ${story.ageGroup}`,
          size: 20, // 10pt
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 200,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Category: ${story.category}`,
          size: 20, // 10pt
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Instructions:",
          bold: true,
          size: 24, // 12pt
        }),
      ],
      spacing: {
        after: 200,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• Read the story text on each page",
          size: 20, // 10pt
        }),
      ],
      spacing: {
        after: 100,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• Follow the drawing prompt to create your illustration",
          size: 20, // 10pt
        }),
      ],
      spacing: {
        after: 100,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• Use the space provided to draw your picture",
          size: 20, // 10pt
        }),
      ],
      spacing: {
        after: 100,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "• Have fun bringing the story to life!",
          size: 20, // 10pt
        }),
      ],
      spacing: {
        after: 400,
      },
    }),
  );

  // Add some space before story pages
  children.push(
    new Paragraph({
      children: [new TextRun({ text: " " })],
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: " " })],
      spacing: { after: 400 },
    })
  );

  // Add each story page
  story.pages.forEach((page, index) => {
    // Page number header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Page ${page.pageNumber}`,
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 300,
        },
      })
    );

    // Story text section
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Story Text:",
            bold: true,
            size: 24, // 12pt
          }),
        ],
        spacing: {
          after: 200,
        },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: page.text,
            size: 22, // 11pt
          }),
        ],
        spacing: {
          after: 400,
          line: 360, // 1.5 line spacing
        },
      })
    );

    // Drawing prompt section
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Drawing Prompt:",
            bold: true,
            size: 24, // 12pt
          }),
        ],
        spacing: {
          after: 200,
        },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: page.drawingPrompt,
            size: 22, // 11pt
            italics: true,
          }),
        ],
        spacing: {
          after: 400,
        },
      })
    );

    // Drawing space
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Your Drawing:",
            bold: true,
            size: 24, // 12pt
          }),
        ],
        spacing: {
          after: 200,
        },
      })
    );

    // Add empty space for drawing (multiple empty paragraphs)
    for (let i = 0; i < 8; i++) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "",
              size: 24,
            }),
          ],
          spacing: {
            after: 200,
          },
        })
      );
    }

    // Add space between pages
    if (index < story.pages.length - 1) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: " " })],
          spacing: { after: 600 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "---" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
        new Paragraph({
          children: [new TextRun({ text: " " })],
          spacing: { after: 600 },
        })
      );
    }
  });

    // Create the document with simplified structure
    const doc = new Document({
      sections: [
        {
          children: children,
        },
      ],
    });

    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    const fileName = `${story.title.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase()}_story_template.docx`;
    saveAs(blob, fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error("Error generating Word document:", error);
    throw new Error(`Failed to generate Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
