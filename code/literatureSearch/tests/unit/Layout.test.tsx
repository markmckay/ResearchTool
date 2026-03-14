import { render, screen } from "@testing-library/react";
vi.mock("next/font/google", () => ({
  Playfair_Display: () => ({ variable: "--font-heading" }),
  Source_Sans_3: () => ({ variable: "--font-body" }),
}));

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("shows the current build label", () => {
    const originalBuildId = process.env.NEXT_PUBLIC_BUILD_ID;
    try {
      process.env.NEXT_PUBLIC_BUILD_ID = "testsha";

      render(RootLayout({ children: <div>Child</div> }));

      expect(screen.getByText("Build testsha")).toBeInTheDocument();
    } finally {
      process.env.NEXT_PUBLIC_BUILD_ID = originalBuildId;
    }
  });
});
