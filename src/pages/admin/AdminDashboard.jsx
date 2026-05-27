import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TablaProductos from '../../components/admin/TablaProductos';
import GestionCategorias from '../../components/admin/GestionCategorias';
import FormularioProducto from '../../components/admin/FormularioProducto';

export default function AdminDashboard() {
  const { logout, usuario } = useAuth();
  const [activeSection, setActiveSection] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null); 

  const handleEditClick = (product) => {
    // ESTO TE MOSTRARÁ EN F12 QUÉ ESTÁ LLEGANDO
    setProductToEdit(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProductToEdit(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* 🧭 SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-black tracking-wider text-blue-400">Catsen Admin</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Management Panel</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          <button 
            onClick={() => setActiveSection('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'products' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-box text-sm"></i>
            <span>Products</span>
          </button>
          
          <button 
            onClick={() => setActiveSection('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'categories' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className="fas fa-tags text-sm"></i>
            <span>Categories</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
          {usuario?.email && (
            <p className="text-[10px] text-slate-500 text-center truncate px-2">{usuario.email}</p>
          )}
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <i className="fas fa-external-link-alt"></i>
            <span>Back to Shop</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-all"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        <header className="bg-white border-b border-gray-200 py-5 px-8 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize tracking-tight">
              Manage {activeSection}
            </h1>
          </div>
          
          <button 
            onClick={() => {
              if (activeSection === 'products') {
                setShowModal(true);
              } else {
                alert('Please use the quick action buttons below inside the category area.');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <i className="fas fa-plus"></i>
            <span>Add {activeSection.slice(0, -1)}</span>
          </button>
        </header>

        <div className="flex-grow p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            
            {activeSection === 'products' && (
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">
                  Active Medical Components & Sensors Catalog
                </p>
                <TablaProductos onEdit={handleEditClick} />
              </div>
            )}

            {activeSection === 'categories' && (
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">
                  Main Menu Categories, Brands & Compatibility Setup
                </p>
                <GestionCategorias />
              </div>
            )}

          </div>
        </div>

        {showModal && activeSection === 'products' && (
          <FormularioProducto 
            onClose={handleCloseModal}
            productToEdit={productToEdit}
            onProductoGuardado={() => {
              handleCloseModal();
              window.location.reload();
            }}
          />
        )}
      </main>

    </div>
  );
}