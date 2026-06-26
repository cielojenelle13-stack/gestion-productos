import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (email, password) => {
    if (email && password.length >= 6) {
      const fakeUser = { email, name: email.split('@')[0] }
      setUser(fakeUser)
      localStorage.setItem('user', JSON.stringify(fakeUser))
      return { success: true }
    }
    return { success: false, message: 'Credenciales inválidas' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}