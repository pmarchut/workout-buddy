import { renderHook, act } from "@testing-library/react";
import { useLogin } from "../src/hooks/useLogin";

// mock kontekstu Auth
const mockDispatch = jest.fn();

jest.mock("../src/hooks/useAuthContext", () => ({
  useAuthContext: () => ({
    dispatch: mockDispatch
  })
}));

// mock fetch
globalThis.fetch = jest.fn();

// mock localStorage
beforeEach(() => {
  mockDispatch.mockReset();
  fetch.mockReset();

  Storage.prototype.setItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();
});

describe("useLogin hook", () => {
  test("successful login updates context + localStorage", async () => {
    const fakeUser = { email: "test@test.com", token: "abc123" };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeUser
    });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login("test@test.com", "password123");
    });

    // fetch called correctly
    expect(fetch).toHaveBeenCalledWith(
      "/api/users/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@test.com",
          password: "password123"
        })
      }
    );

    // localStorage updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify(fakeUser)
    );

    // context dispatched
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "LOGIN",
      payload: fakeUser
    });

    // loading finished
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test("failed login sets error and does NOT dispatch", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" })
    });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login("wrong@test.com", "wrongpass");
    });

    // no dispatch
    expect(mockDispatch).not.toHaveBeenCalled();

    // no localStorage
    expect(localStorage.setItem).not.toHaveBeenCalled();

    // sets error
    expect(result.current.error).toBe("Invalid credentials");

    // loading finished
    expect(result.current.isLoading).toBe(false);
  });

  test("sets isLoading to true during request", async () => {
    // fetch resolves po chwili
    let resolveFetch;
    fetch.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.login("test@test.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    // kończymy fetch
    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({ email: "test@test.com" })
      });
    });
  });
});
