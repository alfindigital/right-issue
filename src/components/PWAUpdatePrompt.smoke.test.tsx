import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { PWAUpdatePrompt } from "./PWAUpdatePrompt";
import { OfflineIndicator } from "./OfflineIndicator";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Track registerSW options so we can trigger refresh events on demand.
const registerState: {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  updateSW: ReturnType<typeof vi.fn>;
} = {
  updateSW: vi.fn(async () => {}),
};

vi.mock("virtual:pwa-register", () => ({
  registerSW: (opts: {
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }) => {
    registerState.onNeedRefresh = opts.onNeedRefresh;
    registerState.onOfflineReady = opts.onOfflineReady;
    return registerState.updateSW;
  },
}));

const setOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
  window.dispatchEvent(new Event(value ? "online" : "offline"));
};

const renderApp = () =>
  render(
    <LanguageProvider>
      <OfflineIndicator />
      <PWAUpdatePrompt />
    </LanguageProvider>,
  );

describe("PWAUpdatePrompt smoke: refresh + online/offline", () => {
  beforeEach(() => {
    registerState.onNeedRefresh = undefined;
    registerState.onOfflineReady = undefined;
    registerState.updateSW.mockClear();
    setOnline(true);
  });

  afterEach(() => {
    setOnline(true);
  });

  it("survives a full app refresh (unmount + remount) without leaking prompt state", async () => {
    const first = renderApp();
    await waitFor(() => expect(registerState.onNeedRefresh).toBeTypeOf("function"));
    // No refresh signal yet -> nothing visible.
    expect(first.container.querySelector("button")).toBeNull();
    first.unmount();

    // Simulate reload: registerSW must be re-invoked on fresh mount and the
    // prompt must start hidden again (no stale "update available" carried
    // across the reload).
    registerState.onNeedRefresh = undefined;
    const second = renderApp();
    await waitFor(() => expect(registerState.onNeedRefresh).toBeTypeOf("function"));
    expect(second.container.querySelector("button")).toBeNull();

    // After the refresh, a new update signal should still surface correctly.
    act(() => registerState.onNeedRefresh!());
    expect(await screen.findByRole("button", { name: /update/i })).toBeInTheDocument();
    second.unmount();
  });

  it("shows the offline indicator when the network drops and hides it when restored", () => {
    renderApp();
    // Online by default -> indicator not rendered.
    expect(screen.queryByText(/offline|luring|tidak tersambung/i)).not.toBeInTheDocument();

    act(() => setOnline(false));
    // Some copy variant should now be visible; assert the WifiOff icon container exists.
    const offlineBar = document.querySelector(".bg-warning");
    expect(offlineBar).not.toBeNull();

    act(() => setOnline(true));
    expect(document.querySelector(".bg-warning")).toBeNull();
  });

  it("keeps the update prompt visible across online/offline transitions", async () => {
    renderApp();
    await waitFor(() => expect(registerState.onNeedRefresh).toBeTypeOf("function"));
    act(() => registerState.onNeedRefresh!());

    const updateBtn = await screen.findByRole("button", { name: /update/i });
    expect(updateBtn).toBeInTheDocument();

    // Toggle network — the update prompt is independent of connectivity and
    // must remain mounted so the user can still act on it when back online.
    act(() => setOnline(false));
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();

    act(() => setOnline(true));
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
  });

  it("does not surface an update prompt purely from going offline", async () => {
    const { container } = renderApp();
    await waitFor(() => expect(registerState.onNeedRefresh).toBeTypeOf("function"));

    act(() => setOnline(false));
    act(() => setOnline(true));

    // Only the offline indicator may toggle; no update button should appear
    // without an explicit onNeedRefresh signal from the SW.
    expect(container.querySelector("button")).toBeNull();
    expect(registerState.updateSW).not.toHaveBeenCalled();
  });
});