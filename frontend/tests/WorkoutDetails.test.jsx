import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WorkoutDetails from "../src/components/WorkoutDetails";

let mockDispatch;

// mock hook
jest.mock("../src/hooks/useWorkoutsContext", () => ({
  useWorkoutsContext: () => ({
    dispatch: mockDispatch
  })
}));

jest.mock("../src/hooks/useAuthContext", () => ({
  useAuthContext: () => ({
    user: {
      email: "test@test.com",
      token: "TEST_TOKEN_123"
    }
  })
}));

// mock fetch
globalThis.fetch = jest.fn();

describe("WorkoutDetails", () => {
  const workout = {
    _id: "123",
    title: "Bench Press",
    load: 80,
    reps: 10,
    createdAt: "2025-01-01"
  };

  beforeEach(() => {
    mockDispatch = jest.fn();      // nowy mock PER TEST
    fetch.mockReset();
  });

  test("renders workout details", () => {
    render(<WorkoutDetails workout={workout} />);

    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("delete")).toBeInTheDocument();
  });

  test("calls fetch with correct DELETE URL on delete click", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deleted: true })
    });

    render(<WorkoutDetails workout={workout} />);

    const deleteButton = screen.getByText("delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/workouts/123",
        { 
          method: "DELETE",
          headers: {
            "Authorization": "Bearer TEST_TOKEN_123"
          }, 
        }
      );
    });
  });

  test("dispatches DELETE_WORKOUT action on successful delete", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: "123" })
    });

    render(<WorkoutDetails workout={workout} />);

    fireEvent.click(screen.getByText("delete"));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "DELETE_WORKOUT",
        payload: { _id: "123" }
      });
    });
  });

  test("does NOT dispatch on failed delete", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed" })
    });

    render(<WorkoutDetails workout={workout} />);

    fireEvent.click(screen.getByText("delete"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test("renders formatted date using formatDistanceToNow", () => {
    render(<WorkoutDetails workout={workout} />);

    // Szukamy fragmentu, który zawsze występuje
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });
});
