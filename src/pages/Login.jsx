import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (value === '') setErrors((p) => ({ ...p, email: null }))
    else if (!validateEmail(value)) setErrors((p) => ({ ...p, email: 'Correo inválido' }))
    else setErrors((p) => ({ ...p, email: false }))
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (value === '') setErrors((p) => ({ ...p, password: null }))
    else if (value.length < 6) setErrors((p) => ({ ...p, password: 'Mínimo 6 caracteres' }))
    else setErrors((p) => ({ ...p, password: false }))
  }

  const isFormValid = errors.email === false && errors.password === false

  const handleSubmit = (e) => {
    e.preventDefault()
    setAuthError('')
    if (!isFormValid) return
    const result = login(email, password)
    if (result.success) navigate('/dashboard')
    else setAuthError(result.message)
  }

  const inputBase = 'w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-lg text-sm outline-none transition-all'
  const getInputClass = (field) => {
    if (!errors[field] && errors[field] !== false) return `${inputBase} border-gray-200 focus:border-blue-800`
    if (errors[field]) return `${inputBase} border-red-400 focus:border-red-400`
    return `${inputBase} border-green-400 focus:border-green-400`
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">

      {/* Logo + nombre */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-blue-900">GestionaYa</h1>
        <p className="text-gray-500 text-sm mt-1">Acceso profesional a tu inventario</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Email */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="nombre@empresa.com"
              className={getInputClass('email')}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Contraseña
            </label>
            <span className="text-xs text-blue-800 cursor-pointer hover:underline">
              ¿Olvidaste tu contraseña?
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className={`${getInputClass('password')} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 accent-blue-900 cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">
            Mantener sesión iniciada
          </label>
        </div>

        {/* Auth error */}
        {authError && (
          <p className="text-red-500 text-sm text-center mb-4">{authError}</p>
        )}

        {/* Botón */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            isFormValid
              ? 'bg-blue-900 text-white hover:bg-blue-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Entrar
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Solicitar acceso */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400 mb-2">¿No tienes una cuenta?</p>
          <button className="text-sm border border-blue-900 text-blue-900 px-5 py-1.5 rounded-full hover:bg-blue-50 transition-all">
            Solicitar acceso
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-6 uppercase tracking-widest">
        © 2026 GestionaYa | Todos los derechos reservados
      </p>
    </div>
  )
}