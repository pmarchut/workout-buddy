import { renderHook, act } from '@testing-library/react'
import { useSignup } from '../src/hooks/useSignup'
import { useAuthContext } from '../src/hooks/useAuthContext'
import { API_URL } from "../src/config";

// mockowanie kontekstu
jest.mock('../src/hooks/useAuthContext')

// mock fetch
globalThis.fetch = jest.fn()

// mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useSignup hook', () => {
  let dispatchMock

  beforeEach(() => {
    dispatchMock = jest.fn()
    useAuthContext.mockReturnValue({ dispatch: dispatchMock })
    fetch.mockReset()
    localStorage.clear()
  })

  it('handles successful signup', async () => {
    const fakeUser = { email: 'john@example.com', token: '123' }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeUser
    })

    const { result } = renderHook(() => useSignup())

    await act(async () => {
      await result.current.signup('john@example.com', 'password123')
    })

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
      })
    })

    // loading powinno wrócić na false
    expect(result.current.isLoading).toBe(false)

    // brak błędu
    expect(result.current.error).toBe(null)

    // zapis do localStorage
    expect(window.localStorage.getItem('user')).toEqual(JSON.stringify(fakeUser))

    // dispatch został wywołany
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'LOGIN',
      payload: fakeUser,
    })
  })

  it('handles signup failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email already exists' })
    })

    const { result } = renderHook(() => useSignup())

    await act(async () => {
      await result.current.signup('john@example.com', 'password123')
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('Email already exists')

    // nic nie zapisano do localStorage
    expect(window.localStorage.getItem('user')).toBe(null)

    // dispatch nie powinien się wykonać
    expect(dispatchMock).not.toHaveBeenCalled()
  })
})
