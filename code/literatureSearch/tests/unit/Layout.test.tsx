import { render, screen } from "@testing-library/react";
vi.mock("next/font/google", () => ({
  Playfair_Display: () => ({ variable: "--font-heading" }),
  Source_Sans_3: () => ({ variable: "--font-body" }),
}));

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("shows the current build label and timestamp", () => {
    const originalBuildId = process.env.NEXT_PUBLIC_BUILD_ID;
    const originalBuildTimestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;
    try {
      process.env.NEXT_PUBLIC_BUILD_ID = "testsha";
      process.env.NEXT_PUBLIC_BUILD_TIMESTAMP = "2026-03-14T22:55:00.000Z";

      render(RootLayout({ children: <div>Child</div> }));

      expect(screen.getByText("Build testsha")).toBeInTheDocument();
      expect(screen.getByText(/Built 2026-03-14/)).toBeInTheDocument();
    } finally {
      process.env.NEXT_PUBLIC_BUILD_ID = originalBuildId;
      process.env.NEXT_PUBLIC_BUILD_TIMESTAMP = originalBuildTimestamp;
    }
  });
});
