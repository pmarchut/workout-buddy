import { render, screen, fireEvent } from "@testing-library/react"
import Navbar from "../src/components/Navbar"
import { MemoryRouter } from "react-router-dom"

import { useAuthContext } from "../src/hooks/useAuthContext"
import { useLogout } from "../src/hooks/useLogout"

// mocki
jest.mock("../src/hooks/useAuthContext")
jest.mock("../src/hooks/useLogout")

const setup = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("shows Login and Signup when no user", () => {
    useAuthContext.mockReturnValue({ user: null })
    useLogout.mockReturnValue({ logout: jest.fn() })

    setup()

    expect(screen.getByText("Login")).toBeInTheDocument()
    expect(screen.getByText("Signup")).toBeInTheDocument()

    expect(screen.queryByText(/log out/i)).not.toBeInTheDocument()
  })

  test("shows email and Log out when user exists", () => {
    useAuthContext.mockReturnValue({
      user: { email: "test@example.com" }
    })
    useLogout.mockReturnValue({ logout: jest.fn() })

    setup()

    expect(screen.getByText("test@example.com")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument()

    expect(screen.queryByText("Login")).not.toBeInTheDocument()
    expect(screen.queryByText("Signup")).not.toBeInTheDocument()
  })

  test("calls logout when clicking Log out", () => {
    const mockLogout = jest.fn()

    useAuthContext.mockReturnValue({
      user: { email: "test@example.com" }
    })
    useLogout.mockReturnValue({ logout: mockLogout })

    setup()

    fireEvent.click(screen.getByRole("button", { name: /log out/i }))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
