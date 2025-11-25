import { render, screen, fireEvent } from '@testing-library/react'
import Signup from '../src/pages/Signup'
import { useSignup } from '../src/hooks/useSignup'

jest.mock('../src/hooks/useSignup')

describe('Signup', () => {
  it('calls signup with email and password', async () => {
    const signupMock = jest.fn()
    useSignup.mockReturnValue({
      signup: signupMock,
      error: null,
      isLoading: false
    })

    render(<Signup />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '123456' }
    })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(signupMock).toHaveBeenCalledWith('test@example.com', '123456')
  })

  it('disables button when loading', () => {
    useSignup.mockReturnValue({
      signup: jest.fn(),
      error: null,
      isLoading: true
    })

    render(<Signup />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows error when hook returns error', () => {
    useSignup.mockReturnValue({
      signup: jest.fn(),
      error: 'Signup failed',
      isLoading: false
    })

    render(<Signup />)

    expect(screen.getByText('Signup failed')).toBeInTheDocument()
  })
})
