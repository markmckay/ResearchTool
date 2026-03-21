import { extractConclusionFromText } from "@/lib/pdfConclusion";

describe("extractConclusionFromText", () => {
  it("extracts text under a conclusion heading", () => {
    const text = `
Introduction
This is the introduction.

Methods
This is the methods section.

Conclusion
This study found that audio-first paper triage reduced navigation overhead for low-vision researchers.
Participants completed screening tasks faster and reported lower cognitive load.
The findings suggest that spoken summaries and structured relevance cues can improve literature review workflows.

References
[1] Example citation
`;

    const conclusion = extractConclusionFromText(text);

    expect(conclusion).toContain("audio-first paper triage reduced navigation overhead");
    expect(conclusion).not.toContain("References");
  });

  it("returns null when no conclusion-like heading exists", () => {
    const text = `
Introduction
This paper explores interface patterns.

Methods
We ran a study with 12 participants.
`;

    expect(extractConclusionFromText(text)).toBeNull();
  });

  it("falls back to tail sentences when a paper uses prose instead of a formal heading", () => {
    const text = `
Introduction
This paper explores interface patterns for literature triage.

Results
Participants completed tasks faster and made fewer navigation errors.

We observed a marked decrease in friction during review sessions. In conclusion, audio-first triage reduced scanning effort and improved confidence for low-vision researchers. These findings suggest that structured spoken summaries and direct relevance cues are useful defaults for literature review systems. The approach appears especially effective during the first-pass screening stage.
`;

    const conclusion = extractConclusionFromText(text);

    expect(conclusion).toContain("In conclusion, audio-first triage reduced scanning effort");
  });
});
