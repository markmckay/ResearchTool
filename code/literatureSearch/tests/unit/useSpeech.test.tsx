import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSpeech } from "@/hooks/useSpeech";

class MockUtterance {
  text: string;
  rate = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

function SpeechHarness() {
  const { speak, stop, speaking, currentKey, toggleSpeak, isSpeakingKey } = useSpeech();

  return (
    <div>
      <div data-testid="state">{JSON.stringify({ speaking, currentKey })}</div>
      <div data-testid="top5-speaking">{String(isSpeakingKey("top5"))}</div>
      <button type="button" onClick={() => speak("Hello world", "greeting")}>
        Speak greeting
      </button>
      <button type="button" onClick={() => toggleSpeak("Top five", "top5")}>
        Toggle top five
      </button>
      <button type="button" onClick={stop}>
        Stop
      </button>
    </div>
  );
}

describe("useSpeech", () => {
  const originalSpeechSynthesis = window.speechSynthesis;
  const originalUtterance = window.SpeechSynthesisUtterance;

  beforeEach(() => {
    const synth = {
      cancel: vi.fn(),
      speak: vi.fn((utterance: MockUtterance) => {
        utterance.onstart?.();
      }),
    };

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: synth,
    });

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: MockUtterance,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: originalSpeechSynthesis,
    });

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: originalUtterance,
    });
  });

  it("speaks text, tracks the active key, and stops current playback", async () => {
    const user = userEvent.setup();
    render(<SpeechHarness />);

    await user.click(screen.getByRole("button", { name: /speak greeting/i }));

    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("state")).toHaveTextContent('"speaking":true');
    expect(screen.getByTestId("state")).toHaveTextContent('"currentKey":"greeting"');

    await user.click(screen.getByRole("button", { name: /stop/i }));

    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("state")).toHaveTextContent('"speaking":false');
    expect(screen.getByTestId("state")).toHaveTextContent('"currentKey":null');
  });

  it("toggles the same speech key off after it starts speaking", async () => {
    const user = userEvent.setup();
    render(<SpeechHarness />);

    await user.click(screen.getByRole("button", { name: /toggle top five/i }));

    expect(screen.getByTestId("top5-speaking")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: /toggle top five/i }));

    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("top5-speaking")).toHaveTextContent("false");
  });
});
