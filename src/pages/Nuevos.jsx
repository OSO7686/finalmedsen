// src/pages/Nuevos.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useCartStore } from '../store/cartStore';
import { formatearPrecio } from '../utils/helpers';

// Cuántos productos "nuevos" mostrar
const LIMITE_NUEVOS = 12;

function Nuevos() {
  const agregarAlCarrito = useCartStore((state) => state.agregarAlCarrito);

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    async function obtenerNuevos() {
      setCargando(true);
      try {
        // Productos más recientes y surtibles (con proveedor), of la BD real.
        const { data, error } = await supabase
          .from('productos_medicos_v2')
          .select('*')
          .eq('tiene_proveedor', true)
          .order('created_at', { ascending: false })
          .limit(LIMITE_NUEVOS);

        if (error) throw error;
        setProductos(data || []);
      } catch (err) {
        console.error('Error cargando productos nuevos:', err);
        setError(err);
      } finally {
        setCargando(false);
      }
    }
    obtenerNuevos();
  }, []);

  // Precio a mostrar: sugerido con fallback al viejo (siempre USD)
  const precioDe = (p) => p.precio_venta_sugerido ?? p.precio;

  // Filtro en vivo del buscador of la barra lateral
  const termino = busqueda.trim().toLowerCase();
  const productosFiltrados = termino
    ? productos.filter(
        (p) =>
          (p.nombre || '').toLowerCase().includes(termino) ||
          (p.mi_sku || '').toLowerCase().includes(termino)
      )
    : productos;

  return (
    <div className="bg-gray-50 font-sans text-gray-900 min-h-screen flex flex-col">

      {/* Banner of Título */}
      <div className="bg-teal-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            New <span className="text-teal-300">Arrivals</span>
          </h1>
          <p className="mt-2 text-teal-100">The latest additions to our medical connectivity catalog.</p>
        </div>
      </div>

      {/* Contenedor Principal */}
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">

        {/* BARRA LATERAL */}
        <aside className="w-full md:w-1/4">
          <div className="bg-white p-6 border rounded shadow-sm sticky top-24">
            <h3 className="font-black uppercase tracking-widest text-sm mb-6 border-b pb-2">New Arrivals Filter</h3>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Quick search</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="e.g. SpO2 Sensor or SKU..."
                className="w-full border-2 border-gray-100 rounded py-2 px-3 focus:border-teal-500 outline-none text-sm"
              />
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {cargando
                ? 'Loading...'
                : `Showing ${productosFiltrados.length} of ${productos.length} new arrivals`}
            </p>
          </div>
        </aside>

        {/* CUADRÍCULA DE PRODUCTOS NUEVOS */}
        <section className="w-full md:w-3/4">

          {cargando && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <i className="fas fa-spinner fa-spin text-3xl text-teal-600"></i>
              <p className="text-gray-500 font-bold">Loading new arrivals...</p>
            </div>
          )}

          {!cargando && error && (
            <div className="text-center py-20">
              <p className="text-gray-700 font-bold">We couldn't load the new arrivals.</p>
              <p className="text-gray-400 text-sm">Please try again in a moment.</p>
            </div>
          )}

          {!cargando && !error && productosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-700 font-bold">
                {productos.length === 0 ? 'Aún no hay new arrivals disponibles.' : 'No results for your search.'}
              </p>
            </div>
          )}

          {!cargando && !error && productosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.mi_sku}
                  className="bg-white border rounded p-6 relative hover:shadow-lg transition-shadow group border-t-4 border-t-teal-500 flex flex-col"
                >
                  {/* Etiqueta "NEW" */}
                  <div className="absolute top-4 right-4 bg-teal-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest z-10 shadow-sm">
                    NUEVO
                  </div>

                  <Link to={`/producto/${producto.mi_sku}`} className="flex flex-col flex-1 cursor-pointer">
                    <div className="h-40 bg-gray-50 rounded flex items-center justify-center mb-4 overflow-hidden">
                      <img
                        src={producto.imagen_url || '/sin-imagen.svg'}
                        alt={producto.nombre}
                        className="max-h-full max-w-full object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <h4 className="font-bold text-sm mb-1 uppercase text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {producto.nombre}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      SKU: <span className="text-teal-600 font-bold">{producto.mi_sku}</span>
                    </p>
                  </Link>

                  <div className="text-teal-700 font-black text-lg mb-4 mt-auto">
                    {formatearPrecio(precioDe(producto))}
                  </div>

                  <button
                    onClick={() => agregarAlCarrito(producto)}
                    className="w-full bg-white border-2 border-teal-700 text-teal-700 py-2 text-xs font-bold uppercase tracking-widest hover:bg-teal-700 hover:text-white transition-colors"
                  >
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default Nuevos;
