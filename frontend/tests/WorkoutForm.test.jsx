import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WorkoutForm from "../src/components/WorkoutForm";
import { API_URL } from "../src/config";

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

describe("WorkoutForm", () => {

  beforeEach(() => {
    mockDispatch = jest.fn();      // nowy mock PER TEST
    fetch.mockReset();
  });

  test("renders form elements", () => {
    render(<WorkoutForm />);

    expect(screen.getByText("Add a New Workout")).toBeInTheDocument();
    expect(screen.getByLabelText(/Exercise Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Load \(in kg\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reps/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Workout/i)).toBeInTheDocument();
  });

  test("allows typing in inputs", () => {
    render(<WorkoutForm />);

    const titleInput = screen.getByLabelText(/Exercise Title/i);
    const loadInput = screen.getByLabelText(/Load/i);
    const repsInput = screen.getByLabelText(/Reps/i);

    fireEvent.change(titleInput, { target: { value: "Bench Press" } });
    fireEvent.change(loadInput, { target: { value: "50" } });
    fireEvent.change(repsInput, { target: { value: "10" } });

    expect(titleInput.value).toBe("Bench Press");
    expect(loadInput.value).toBe("50");
    expect(repsInput.value).toBe("10");
  });

  test("submits form, resets fields and dispatches on success", async () => {
    // mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        _id: "1",
        title: "Bench Press",
        load: 50,
        reps: 10
      })
    });

    render(<WorkoutForm />);

    fireEvent.change(screen.getByLabelText(/Exercise Title/i), {
      target: { value: "Bench Press" }
    });
    fireEvent.change(screen.getByLabelText(/Load/i), {
      target: { value: "50" }
    });
    fireEvent.change(screen.getByLabelText(/Reps/i), {
      target: { value: "10" }
    });

    fireEvent.click(screen.getByText(/Add Workout/i));

    // expect fetch call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/workouts`,
        expect.objectContaining({
          method: "POST",
          headers: { 
            "Authorization": "Bearer TEST_TOKEN_123",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: "Bench Press",
            load: "50",
            reps: "10"
          })
        })
      );
    });

    // expect form reset
    await waitFor(() => {
      expect(screen.getByLabelText(/Exercise Title/i).value).toBe("");
      expect(screen.getByLabelText(/Load/i).value).toBe("");
      expect(screen.getByLabelText(/Reps/i).value).toBe("");
    });

    // ✨ expect dispatch call
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "CREATE_WORKOUT",
      payload: {
        _id: "1",
        title: "Bench Press",
        load: 50,
        reps: 10
      }
    });
  });

  test("shows error on failed submit and does NOT reset fields", async () => {
    // mock error response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "All fields must be filled",
        emptyFields: ["reps"]
      })
    });

    render(<WorkoutForm />);

    const titleInput = screen.getByLabelText(/Exercise Title/i);
    const loadInput = screen.getByLabelText(/Load/i);
    const button = screen.getByText(/Add Workout/i);

    fireEvent.change(titleInput, { target: { value: "Squat" } });
    fireEvent.change(loadInput, { target: { value: "100" } });

    fireEvent.click(button);

    // expect fetch call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    // expect error
    expect(await screen.findByText("All fields must be filled")).toBeInTheDocument();

    // fields should NOT be reset
    expect(titleInput.value).toBe("Squat");
    expect(loadInput.value).toBe("100");

    // ✨ dispatch should NOT be called
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test("adds error class to invalid fields on failed submit", async () => {
    // backend zwraca, że tytuł i load są puste
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Fields cannot be empty",
        emptyFields: ["title", "load"]
      })
    });

    render(<WorkoutForm />);

    fireEvent.click(screen.getByText(/Add Workout/i));

    const titleInput = screen.getByLabelText(/Exercise Title/i);
    const loadInput = screen.getByLabelText(/Load/i);
    const repsInput = screen.getByLabelText(/Reps/i);

    // czekamy aż component doda klasy
    await waitFor(() => {
      expect(titleInput.classList.contains("error")).toBe(true);
      expect(loadInput.classList.contains("error")).toBe(true);
      expect(repsInput.classList.contains("error")).toBe(false); // nie było go w emptyFields
    });

    // error message
    expect(screen.getByText("Fields cannot be empty")).toBeInTheDocument();
  });
});
