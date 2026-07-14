import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { PWAUpdatePrompt } from "./PWAUpdatePrompt";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Capture the options passed to registerSW so tests can trigger onNeedRefresh
// on demand and assert that the update flow actually reacts to it.
const registerState: {
  onNeedRefresh?: () => void;
  updateSW: ReturnType<typeof vi.fn>;
} = {
  updateSW: vi.fn(async () => {}),
};

vi.mock("virtual:pwa-register", () => ({
  registerSW: (opts: { onNeedRefresh?: () => void; onOfflineReady?: () => void }) => {
    registerState.onNeedRefresh = opts.onNeedRefresh;
    return registerState.updateSW;
  },
}));

const renderPrompt = () =>
  render(
    <LanguageProvider>
      <PWAUpdatePrompt />
    </LanguageProvider>,
  );

describe("PWAUpdatePrompt integration", () => {
  beforeEach(() => {
    registerState.onNeedRefresh = undefined;
    registerState.updateSW.mockClear();
  });

  it("stays hidden until an update is available", async () => {
    const { container } = renderPrompt();
    await waitFor(() => expect(registerState.onNeedRefresh).toBeTypeOf("function"));
    // No refresh event yet -> prompt must not render anything.
    expect(container.firstChild).toBeNull();
  });

  it("shows the update prompt when onNeedRefresh fires", async () => {
    renderPrompt();
    await waitFor(() => expect(registerState.onNeedRefresh).toBeTypeOf("function"));

    act(() => registerState.onNeedRefresh!());

    // Both action buttons should be visible once the SW signals a refresh.
    expect(await screen.findByRole("button", { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /later|nanti/i })).toBeInTheDocument();
  });

  it('dismisses the prompt when "Later" is clicked', async () => {
    const { container } = renderPrompt();
    await waitFor(() => expect(registerState.onNeedRefresh).toBeTypeOf("function"));
    act(() => registerState.onNeedRefresh!());

    const laterBtn = await screen.findByRole("button", { name: /later|nanti/i });
    fireEvent.click(laterBtn);

    await waitFor(() => expect(container.firstChild).toBeNull());
    expect(registerState.updateSW).not.toHaveBeenCalled();
  });

  it("invokes the SW update function and reloads when Update is clicked", async () => {
    const reloadSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: reloadSpy },
    });

    try {
      renderPrompt();
      await waitFor(() => expect(registerState.onNeedRefresh).toBeTypeOf("function"));
      act(() => registerState.onNeedRefresh!());

      const updateBtn = await screen.findByRole("button", { name: /update/i });
      fireEvent.click(updateBtn);

      await waitFor(() => expect(registerState.updateSW).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(reloadSpy).toHaveBeenCalledTimes(1));
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  });
});