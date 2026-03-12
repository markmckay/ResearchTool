import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "@/components/SearchBar";

describe("SearchBar", () => {
  it("fills the input from a quick search without submitting", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} loading={false} />);

    await user.click(screen.getByRole("listitem", { name: /quick search: authorial control ai writing/i }));

    expect(screen.getByRole("searchbox", { name: /enter your research search query/i })).toHaveValue(
      "authorial control AI writing"
    );
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("submits the current query from the search button", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} loading={false} />);

    await user.type(screen.getByRole("searchbox", { name: /enter your research search query/i }), "accessible AI");
    await user.click(screen.getByRole("button", { name: /search for papers/i }));

    expect(onSearch).toHaveBeenCalledWith("accessible AI");
  });
});
