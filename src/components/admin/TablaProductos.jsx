import { useEffect, useState } from 'react';
import { buscarProductos, toggleProductoDestacado, eliminarProducto, toggleProductoNuevo } from '../../api/productos';

export default function TablaProductos({ onEdit, vista = 'catalogo' }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; 
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalDestacados, setTotalDestacados] = useState(0);
  const [busqueda, setBusqueda] = useState('');

  const fetchProducts = async (page, termino = '') => {
    setIsLoading(true);
    try {
      const response = await buscarProductos(termino, page, itemsPerPage, vista);
      let listado = response.productos || [];
      
      listado.sort((a, b) => {
        if (a.destacado === b.destacado) return 0;
        return a.destacado ? -1 : 1;
      });

      setProducts(listado);
      setTotalProducts(response.total || 0);

      const destacadosEnPagina = listado.filter(p => p.destacado).length;
      setTotalDestacados(destacadosEnPagina);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, busqueda);
  }, [currentPage, vista]); 

  const handleBuscar = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, busqueda);
  };

  const handleToggleDestacado = async (prod) => {
    try {
      if (!prod.destacado && totalDestacados >= 6) {
        alert("Ya tienes 6 productos destacados. Quita uno primero para poder agregar este.");
        return;
      }
      const nuevoEstado = !prod.destacado;
      setProducts(prev => {
        const nuevos = prev.map(p => p.mi_sku === prod.mi_sku ? { ...p, destacado: nuevoEstado } : p);
        return nuevos.sort((a, b) => (a.destacado === b.destacado ? 0 : a.destacado ? -1 : 1));
      });
      setTotalDestacados(prev => nuevoEstado ? prev + 1 : prev - 1);
      await toggleProductoDestacado(prod.mi_sku, prod.destacado);
    } catch (error) {
      console.error("Error cambiando destacado", error);
      fetchProducts(currentPage, busqueda);
    }
  };

  const handleToggleNuevo = async (prod) => {
    try {
      // Al desmarcarlo, lo sacamos visualmente de la tabla de "Nuevos" al instante
      setProducts(prev => prev.filter(p => p.mi_sku !== prod.mi_sku));
      setTotalProducts(prev => Math.max(0, prev - 1));
      
      await toggleProductoNuevo(prod.mi_sku, prod.es_nuevo);
    } catch (error) {
      console.error("Error cambiando estado nuevo", error);
      alert("Hubo un error al mover el producto. ¿Creaste la columna es_nuevo en Supabase?");
      fetchProducts(currentPage, busqueda);
    }
  };

  const handleEliminar = async (prod) => {
    const confirmar = window.confirm(`¿Seguro que quieres ELIMINAR este producto?\n\n${prod.nombre}\nSKU: ${prod.mi_sku}`);
    if (!confirmar) return;
    try {
      setProducts(prev => prev.filter(p => p.mi_sku !== prod.mi_sku));
      setTotalProducts(prev => Math.max(0, prev - 1));
      await eliminarProducto(prod.mi_sku);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      fetchProducts(currentPage, busqueda);
    }
  };

  return (
    <div className="bg-white">
      <form onSubmit={handleBuscar} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Buscar por SKU, nombre o competencia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors">
          Buscar
        </button>
      </form>

      {isLoading && products.length === 0 ? (
        <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i></div>
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider bg-gray-50">
                  
                  {/* --- CONDICIONAL DE COLUMNAS SEGÚN LA PESTAÑA --- */}
                  {vista === 'catalogo' && (
                    <th className="py-3 px-4 font-semibold text-center w-20">Destacado</th>
                  )}
                  
                  {vista === 'nuevos' && (
                    <th className="py-3 px-4 font-semibold text-center w-24">¿Es Nuevo?</th>
                  )}
                  {/* ------------------------------------------------ */}

                  <th className="py-3 px-4 font-semibold">Imagen</th>
                  <th className="py-3 px-4 font-semibold">SKU / Modelo</th>
                  <th className="py-3 px-4 font-semibold">Nombre del Producto</th>
                  <th className="py-3 px-4 font-semibold">Precio</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((prod) => (
                  <tr key={prod.mi_sku} className={`transition-colors ${prod.destacado ? 'bg-yellow-50/50 hover:bg-yellow-50' : 'hover:bg-blue-50'}`}>
                    
                    {/* --- CONDICIONAL DE BOTONES SEGÚN LA PESTAÑA --- */}
                    {vista === 'catalogo' && (
                      <td className="py-2 px-4 text-center">
                        <button 
                          onClick={() => handleToggleDestacado(prod)}
                          className={`text-xl transition-transform hover:scale-110 ${prod.destacado ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200 hover:text-yellow-200'}`}
                          title={prod.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                        >
                          <i className="fas fa-star"></i>
                        </button>
                      </td>
                    )}

                    {vista === 'nuevos' && (
                      <td className="py-2 px-4 text-center">
                        <button 
                          onClick={() => handleToggleNuevo(prod)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${prod.es_nuevo ? 'bg-blue-600' : 'bg-gray-300'}`}
                          title="Desmarcar para enviar al catálogo general"
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${prod.es_nuevo ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </td>
                    )}
                    {/* ------------------------------------------------ */}

                    <td className="py-2 px-4">
                      <img src={prod.imagen_url || 'https://via.placeholder.com/40'} alt={prod.nombre} className="w-10 h-10 object-contain bg-white rounded border border-gray-200" />
                    </td>
                    <td className="py-2 px-4 font-mono text-xs text-blue-600 font-medium">{prod.mi_sku}</td>
                    <td className="py-2 px-4 font-medium text-gray-800"><span className="line-clamp-1">{prod.nombre}</span></td>
                    <td className="py-2 px-4 font-semibold text-slate-900">${prod.precio}</td>
                    <td className="py-2 px-4 text-right space-x-1">
                      <button onClick={() => onEdit(prod)} className="text-gray-400 hover:text-blue-600 p-2 rounded" title="Editar">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleEliminar(prod)} className="text-gray-400 hover:text-red-600 p-2 rounded" title="Eliminar">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">Mostrando {products.length} de {totalProducts} componentes</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded text-xs font-semibold">Anterior</button>
              <span className="px-3 py-1 text-xs font-bold text-gray-700 bg-white border rounded">Pág {currentPage}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={products.length < itemsPerPage} className="px-3 py-1 bg-white border rounded text-xs font-semibold">Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}