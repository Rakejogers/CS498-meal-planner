import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabaseFetch } from "./fetch";

const futureTokenError = () =>
  Response.json({ code: "PGRST303", message: "JWT issued at future" }, { status: 401 });
const ok = () => Response.json([{ id: 1 }]);

describe("supabaseFetch", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("retries a fresh-token rejection until it succeeds", async () => {
    fetchMock.mockResolvedValueOnce(futureTokenError()).mockResolvedValueOnce(ok());

    const pending = supabaseFetch("https://db.test/rest/v1/profiles");
    await vi.runAllTimersAsync();
    const response = await pending;

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("gives up after two retries", async () => {
    fetchMock.mockImplementation(async () => futureTokenError());

    const pending = supabaseFetch("https://db.test/rest/v1/profiles");
    await vi.runAllTimersAsync();
    const response = await pending;

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry other 401s", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ code: "PGRST301", message: "JWT expired" }, { status: 401 }),
    );

    const response = await supabaseFetch("https://db.test/rest/v1/profiles");

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
