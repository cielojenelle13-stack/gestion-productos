import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── Categorías con emoji ─────────────────────────────────────────────────────
const CATEGORIAS = [
  { value: 'Electrónica',          label: '💻 Electrónica' },
  { value: 'Ropa',                 label: '👕 Ropa' },
  { value: 'Alimentos',            label: '🍔 Alimentos' },
  { value: 'Hogar',                label: '🏠 Hogar' },
  { value: 'Deportes',             label: '⚽ Deportes' },
  { value: 'Software Empresarial', label: '🖥️ Software Empresarial' },
  { value: 'Otros',                label: '📦 Otros' },
]

const CAMPOS_INICIALES = {
  nombre: '', sku: '', categoria: '', precio: '', stock: '', descripcion: '',
}

const PRODUCTOS_POR_PAGINA = 5
const CAMPOS_REQUERIDOS = ['nombre', 'sku', 'categoria', 'precio', 'stock']

// ─── Validaciones ─────────────────────────────────────────────────────────────
const validar = {
  nombre: (v) => {
    if (!v.trim()) return 'El nombre es obligatorio'
    if (v.trim().length < 3) return 'Mínimo 3 caracteres'
    if (v.trim().length > 80) return 'Máximo 80 caracteres'
    return false
  },
  sku: (v) => {
    if (!v.trim()) return 'El SKU es obligatorio'
    if (!/^[A-Z0-9-]{3,20}$/i.test(v.trim())) return 'Solo letras, números y guiones (3-20 caracteres)'
    return false
  },
  categoria: (v) => (!v ? 'Selecciona una categoría' : false),
  precio: (v) => {
    if (v === '') return 'El precio es obligatorio'
    const n = parseFloat(v)
    if (isNaN(n) || n <= 0) return 'Debe ser mayor a 0'
    if (n > 999999) return 'Precio demasiado alto'
    return false
  },
  stock: (v) => {
    if (v === '') return 'El stock es obligatorio'
    const n = parseInt(v, 10)
    if (isNaN(n) || n < 0) return 'Debe ser 0 o más'
    return false
  },
  descripcion: (v) => (v.length > 300 ? 'Máximo 300 caracteres' : false),
}

// ─── Datos de demo ────────────────────────────────────────────────────────────
let nextId = 8
const PRODUCTOS_DEMO = [
  { id: 1, nombre: 'Hub de Datos Industrial v4',  sku: 'SKU-49201', categoria: 'Software Empresarial', precio: '1299.00', stock: '12', descripcion: 'Unidad de agregación de datos de alto rendimiento para entornos corporativos.' },
  { id: 2, nombre: 'Laptop Lenovo IdeaPad 3',     sku: 'LAP-001',  categoria: 'Electrónica',           precio: '2499.90', stock: '15', descripcion: 'Intel Core i5, 8GB RAM, 512GB SSD' },
  { id: 3, nombre: 'Zapatillas Nike Running',      sku: 'ZAP-022',  categoria: 'Deportes',              precio: '349.00',  stock: '0',  descripcion: '' },
  { id: 4, nombre: 'Polo Lacoste Piqué',           sku: 'CAM-044',  categoria: 'Ropa',                  precio: '189.90',  stock: '32', descripcion: 'Algodón piqué, talla M' },
  { id: 5, nombre: 'Mouse Inalámbrico Logitech',   sku: 'ELC-033',  categoria: 'Electrónica',           precio: '89.90',   stock: '22', descripcion: 'Bluetooth + USB, batería 18 meses' },
  { id: 6, nombre: 'Silla Ergonómica Ejecutiva',   sku: 'HOG-007',  categoria: 'Hogar',                 precio: '699.00',  stock: '8',  descripcion: 'Soporte lumbar regulable, reposabrazos 4D' },
  { id: 7, nombre: 'Pelota Fútbol Adidas',         sku: 'DEP-099',  categoria: 'Deportes',              precio: '120.00',  stock: '11', descripcion: 'Talla 5, FIFA Quality Pro' },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activePage, onNavigate }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { id: 'dashboard', label: 'Panel principal', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    )},
    { id: 'products', label: 'Productos', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
      </svg>
    )},
    { id: 'add', label: 'Agregar/Editar', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
    )},
    { id: 'upload', label: 'Carga masiva', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>
    )},
    { id: 'categories', label: 'Categorías', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
      </svg>
    )},
  ]

  return (
    <aside className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-gray-900">GestionaYa</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activePage === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <span className={activePage === item.id ? 'text-blue-600' : 'text-gray-400'}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

// ─── Vista: Editor de Producto ────────────────────────────────────────────────
function EditorProducto({ skusExistentes, productoEditar, onGuardar }) {
  const esModoEdicion = !!productoEditar

  const [campos, setCampos] = useState(
    productoEditar
      ? {
          nombre: productoEditar.nombre,
          sku: productoEditar.sku,
          categoria: productoEditar.categoria,
          precio: String(productoEditar.precio),
          stock: String(productoEditar.stock),
          descripcion: productoEditar.descripcion || '',
        }
      : { ...CAMPOS_INICIALES }
  )

  const [errores, setErrores] = useState({
    nombre: null, sku: null, categoria: null,
    precio: null, stock: null, descripcion: null,
  })

  const validarConSku = {
    ...validar,
    sku: (v) => {
      const base = validar.sku(v)
      if (base) return base
      const skuActual = productoEditar?.sku?.toUpperCase()
      if (skusExistentes.includes(v.toUpperCase()) && v.toUpperCase() !== skuActual)
        return 'Este SKU ya existe'
      return false
    },
  }

  const validarCampo = (campo, valor) =>
    setErrores((prev) => ({ ...prev, [campo]: validarConSku[campo](valor) }))

  const handleChange = (campo) => (e) => {
    const valor = e.target.value
    setCampos((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo] !== null) validarCampo(campo, valor)
  }

  const handleBlur = (campo) => () => validarCampo(campo, campos[campo])

  const formularioValido = CAMPOS_REQUERIDOS.every((c) => errores[c] === false)

  const handleGuardar = () => {
    const nuevosErrores = { ...errores }
    let ok = true
    CAMPOS_REQUERIDOS.forEach((c) => {
      const r = validarConSku[c](campos[c])
      nuevosErrores[c] = r
      if (r !== false) ok = false
    })
    nuevosErrores.descripcion = validar.descripcion(campos.descripcion)
    setErrores(nuevosErrores)
    if (ok) onGuardar(campos)
  }

  const handleDescartar = () => {
    setCampos(
      productoEditar
        ? { nombre: productoEditar.nombre, sku: productoEditar.sku, categoria: productoEditar.categoria, precio: String(productoEditar.precio), stock: String(productoEditar.stock), descripcion: productoEditar.descripcion || '' }
        : { ...CAMPOS_INICIALES }
    )
    setErrores({ nombre: null, sku: null, categoria: null, precio: null, stock: null, descripcion: null })
  }

  const fieldBorder = (campo) => {
    const e = errores[campo]
    if (e === null) return 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
    if (e)         return 'border-red-400 bg-red-50 focus:border-red-400'
    return 'border-green-400 focus:border-green-500'
  }

  const estadoValidacion = [
    { label: 'Nombre ingresado',   campo: 'nombre' },
    { label: 'Precio válido',      campo: 'precio' },
    { label: 'Categoría asignada', campo: 'categoria' },
    { label: 'SKU válido',         campo: 'sku' },
    { label: 'Stock definido',     campo: 'stock' },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-gray-100">
      {/* Barra superior */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Editor de Productos</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {esModoEdicion ? `Editando: ${productoEditar.sku}` : 'Nuevo producto'}
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="flex gap-6 max-w-5xl">

          {/* ── Formulario ───────────────────────────────────────────────────── */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="10"/>
                  <path strokeLinecap="round" d="M12 16v-4M12 8h.01"/>
                </svg>
                <h2 className="text-base font-semibold text-gray-800">Información General</h2>
              </div>

              {/* Nombre */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  NOMBRE DEL PRODUCTO <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={campos.nombre}
                  onChange={handleChange('nombre')}
                  onBlur={handleBlur('nombre')}
                  placeholder="Ej: Laptop Lenovo IdeaPad 3"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${fieldBorder('nombre')}`}
                />
                {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
              </div>

              {/* Precio + Categoría */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    PRECIO (S/) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">S/</span>
                    <input
                      type="number"
                      value={campos.precio}
                      onChange={handleChange('precio')}
                      onBlur={handleBlur('precio')}
                      placeholder="0.00"
                      min="0" step="0.01"
                      className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${fieldBorder('precio')}`}
                    />
                  </div>
                  {errores.precio && <p className="text-red-500 text-xs mt-1">{errores.precio}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    CATEGORÍA <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={campos.categoria}
                      onChange={handleChange('categoria')}
                      onBlur={handleBlur('categoria')}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none appearance-none bg-white transition-all ${fieldBorder('categoria')}`}
                    >
                      <option value="">Seleccionar…</option>
                      {CATEGORIAS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                  </div>
                  {errores.categoria && <p className="text-red-500 text-xs mt-1">{errores.categoria}</p>}
                </div>
              </div>

              {/* SKU + Stock */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    SKU <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={campos.sku}
                    onChange={handleChange('sku')}
                    onBlur={handleBlur('sku')}
                    placeholder="Ej: LAP-001"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none font-mono transition-all ${fieldBorder('sku')}`}
                  />
                  {errores.sku && <p className="text-red-500 text-xs mt-1">{errores.sku}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    STOCK <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={campos.stock}
                    onChange={handleChange('stock')}
                    onBlur={handleBlur('stock')}
                    placeholder="0"
                    min="0" step="1"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${fieldBorder('stock')}`}
                  />
                  {errores.stock && <p className="text-red-500 text-xs mt-1">{errores.stock}</p>}
                </div>
              </div>

              {/* Descripción (opcional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  DESCRIPCIÓN <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                </label>
                <textarea
                  value={campos.descripcion}
                  onChange={handleChange('descripcion')}
                  onBlur={handleBlur('descripcion')}
                  placeholder="Breve descripción del producto…"
                  rows={4}
                  maxLength={300}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none resize-none transition-all ${fieldBorder('descripcion')}`}
                />
                <div className="flex justify-between mt-0.5">
                  {errores.descripcion
                    ? <p className="text-red-500 text-xs">{errores.descripcion}</p>
                    : <span />}
                  <span className="text-xs text-gray-400 ml-auto">{campos.descripcion.length}/300</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-5 justify-end">
              <button
                onClick={handleDescartar}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Descartar cambios
              </button>
              <button
                onClick={handleGuardar}
                disabled={!formularioValido}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  formularioValido
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                Guardar producto
              </button>
            </div>
          </div>

          {/* ── Panel de validación ───────────────────────────────────────────── */}
          <div className="w-56 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                ESTADO DE VALIDACIÓN
              </p>
              <div className="space-y-2">
                {estadoValidacion.map(({ label, campo }) => {
                  const e = errores[campo]
                  const verificado = e === false
                  const conError   = e && e !== null && e !== false
                  return (
                    <div
                      key={campo}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all ${
                        verificado ? 'border-green-200 bg-green-50'
                        : conError ? 'border-red-200 bg-red-50'
                        :            'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {verificado ? (
                          <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </span>
                        ) : conError ? (
                          <span className="w-4 h-4 rounded-full border-2 border-red-400 flex items-center justify-center shrink-0">
                            <span className="text-red-400 text-xs font-bold leading-none">!</span>
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                        )}
                        <span className={verificado ? 'text-green-700' : conError ? 'text-red-600' : 'text-gray-500'}>
                          {label}
                        </span>
                      </div>
                      {verificado && (
                        <span className="text-green-600 text-xs font-semibold">OK</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Indicador global */}
              <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-semibold text-center transition-all ${
                formularioValido
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {formularioValido ? '✓ Listo para guardar' : 'Completa los campos requeridos'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Vista: Lista de Productos ────────────────────────────────────────────────
function ListaProductos({ productos, onEditar, onEliminar, onNuevo }) {
  const [busqueda, setBusqueda]           = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [paginaActual, setPaginaActual]   = useState(1)
  const [aEliminar, setAEliminar]         = useState(null)

  const filtrados = useMemo(() => {
    const t = busqueda.toLowerCase()
    return productos.filter((p) =>
      (!t || p.nombre.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)) &&
      (!filtroCategoria || p.categoria === filtroCategoria)
    )
  }, [productos, busqueda, filtroCategoria])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PRODUCTOS_POR_PAGINA))
  const pReal  = Math.min(paginaActual, totalPaginas)
  const pagina = filtrados.slice((pReal - 1) * PRODUCTOS_POR_PAGINA, pReal * PRODUCTOS_POR_PAGINA)

  const sinStock   = productos.filter((p) => parseInt(p.stock) === 0).length
  const emojiCat   = (val) => CATEGORIAS.find((c) => c.value === val)?.label.split(' ')[0] || '📦'

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-gray-100">
      {/* Barra superior */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Productos</h1>
        <button
          onClick={onNuevo}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      <div className="flex-1 p-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total productos', value: productos.length,                                              color: 'text-blue-600' },
            { label: 'Sin stock',       value: sinStock,                                                       color: 'text-red-500'  },
            { label: 'Categorías',      value: [...new Set(productos.map((p) => p.categoria))].length,         color: 'text-green-600'},
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4 flex gap-3 items-center">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1) }}
              placeholder="Buscar por nombre o SKU…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-all"
            />
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => { setFiltroCategoria(e.target.value); setPaginaActual(1) }}
            className="py-2 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white text-gray-600"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {(busqueda || filtroCategoria) && (
            <button
              onClick={() => { setBusqueda(''); setFiltroCategoria(''); setPaginaActual(1) }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Limpiar filtros
            </button>
          )}
          <span className="text-xs text-gray-400 whitespace-nowrap">{filtrados.length} resultados</span>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {pagina.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-medium text-gray-500">No se encontraron productos</p>
              <p className="text-sm mt-1">Intenta con otro término o agrega un nuevo producto</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Producto', 'SKU', 'Categoría', 'Precio', 'Stock', 'Acciones'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagina.map((p) => {
                    const stock = parseInt(p.stock)
                    return (
                      <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 text-sm">
                              {emojiCat(p.categoria)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 leading-tight">{p.nombre}</p>
                              {p.descripcion && <p className="text-xs text-gray-400 truncate max-w-xs">{p.descripcion}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                        <td className="px-5 py-3">
                          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                            {emojiCat(p.categoria)} {p.categoria}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-700 font-medium whitespace-nowrap">
                          S/ {parseFloat(p.precio).toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-bold ${stock === 0 ? 'text-red-500' : stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                            {stock === 0 ? '⚠️ 0' : stock}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditar(p)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setAEliminar(p)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-400">
                    Mostrando {(pReal - 1) * PRODUCTOS_POR_PAGINA + 1}–{Math.min(pReal * PRODUCTOS_POR_PAGINA, filtrados.length)} de {filtrados.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPaginaActual((n) => Math.max(1, n - 1))}
                      disabled={pReal === 1}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setPaginaActual(num)}
                        className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                          num === pReal ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => setPaginaActual((n) => Math.min(totalPaginas, n + 1))}
                      disabled={pReal === totalPaginas}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal eliminar */}
      {aEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">¿Eliminar producto?</h3>
              <p className="text-sm text-gray-500 mb-1">Estás a punto de eliminar:</p>
              <p className="text-sm font-semibold text-gray-800 mb-1">{aEliminar.nombre}</p>
              <p className="text-xs text-gray-400 mb-6">SKU: {aEliminar.sku} · Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setAEliminar(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { onEliminar(aEliminar.id); setAEliminar(null) }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Página raíz ──────────────────────────────────────────────────────────────
export default function Productos() {
  const [activePage, setActivePage]         = useState('add')
  const [productos, setProductos]           = useState(PRODUCTOS_DEMO)
  const [productoEditar, setProductoEditar] = useState(null)

  const skusExistentes = useMemo(
    () => productos.map((p) => p.sku.toUpperCase()),
    [productos]
  )

  const guardarProducto = (campos) => {
    if (productoEditar) {
      setProductos((prev) => prev.map((p) => p.id === productoEditar.id ? { ...p, ...campos } : p))
      setProductoEditar(null)
    } else {
      setProductos((prev) => [...prev, { id: nextId++, ...campos }])
    }
    setActivePage('products')
  }

  const eliminarProducto = (id) => setProductos((prev) => prev.filter((p) => p.id !== id))

  const handleEditar = (p) => { setProductoEditar(p); setActivePage('add') }
  const handleNuevo  = ()  => { setProductoEditar(null); setActivePage('add') }

  const handleNavigate = (page) => {
    if (page === 'add') setProductoEditar(null)
    setActivePage(page)
  }

  const showEditor = activePage !== 'products'

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      {showEditor ? (
        <EditorProducto
          skusExistentes={skusExistentes}
          productoEditar={productoEditar}
          onGuardar={guardarProducto}
        />
      ) : (
        <ListaProductos
          productos={productos}
          onEditar={handleEditar}
          onEliminar={eliminarProducto}
          onNuevo={handleNuevo}
        />
      )}
    </div>
  )
}
