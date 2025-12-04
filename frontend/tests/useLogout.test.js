import { renderHook, act } from "@testing-library/react";
import { useLogout } from "../src/hooks/useLogout";

// Mock useAuthContext
const mockDispatch = jest.fn();
const mockWorkoutsDispatch = jest.fn();

jest.mock("../src/hooks/useAuthContext", () => ({
  useAuthContext: () => ({
    dispatch: mockDispatch
  })
}));
jest.mock("../src/hooks/useWorkoutsContext", () => ({
  useWorkoutsContext: () => ({
    dispatch: mockWorkoutsDispatch
  })
}));

describe("useLogout", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    localStorage.clear();
  });

  test("removes user from localStorage", () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@test.com" }));

    const { result } = renderHook(() => useLogout());

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem("user")).toBeNull();
  });

  test("dispatches LOGOUT action", () => {
    const { result } = renderHook(() => useLogout());

    act(() => {
      result.current.logout();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: "LOGOUT" });
  });
});
