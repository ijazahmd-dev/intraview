// src/pages/admin/AdminTokenPacksPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  fetchTokenPacks,
  createTokenPack,
  updateTokenPack,
  setFilters,
  setSelectedPack,
} from '../../adminTokenPackSlice';

const AdminTokenPacksPage = () => {
  const dispatch = useDispatch();
  const { packs, selectedPack, loading, error, filters } = useSelector(
    (state) => state.adminTokenPack
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price_inr: 0,
    tokens: 0,
  });

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      dispatch(setFilters({ search: searchValue }));
      dispatch(fetchTokenPacks({ 
        page: 1, 
        pageSize: 20, 
        ...filters, 
        search: searchValue 
      }));
    }, 300),
    [dispatch, filters]
  );

  useEffect(() => {
    dispatch(fetchTokenPacks({ page: 1, pageSize: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFiltersChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchTokenPacks({ page: 1, pageSize: 20, ...newFilters }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchTokenPacks({ page, pageSize: packs.pageSize, ...filters }));
  };

  const handleCreatePack = () => {
    dispatch(createTokenPack(formData))
      .unwrap()
      .then(() => {
        toast.success('Token pack created successfully!');
        setShowCreateModal(false);
        resetForm();
        dispatch(fetchTokenPacks({ page: 1, pageSize: 20, ...filters }));
      })
      .catch(toast.error);
  };

  const handleEditPack = () => {
    dispatch(updateTokenPack({ id: selectedPack.id, packData: formData }))
      .unwrap()
      .then(() => {
        toast.success('Token pack updated successfully!');
        setShowEditModal(false);
      })
      .catch(toast.error);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price_inr: 0,
      tokens: 0,
    });
  };

  const handleToggleActive = (id, isActive) => {
    const newStatus = !isActive;
    dispatch(updateTokenPack({ 
      id, 
      packData: { is_active: newStatus } 
    })).unwrap()
      .then(() => toast.success(`Token pack ${newStatus ? 'activated' : 'deactivated'}`))
      .catch(toast.error);
  };

  const statusColor = (isActive) => 
    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Token Packs</h1>
          <p className="text-xl text-slate-600 mt-2">Manage token purchase packages</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          disabled={loading}
        >
          + New Token Pack
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-3xl p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Status</label>
            <select
              value={filters.active || 'all'}
              onChange={(e) => handleFiltersChange({ active: e.target.value === 'all' ? null : e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500"
              disabled={loading}
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Min Price (₹)</label>
            <input
              type="number"
              min="0"
              value={filters.min_price || ''}
              onChange={(e) => handleFiltersChange({ min_price: e.target.value || null })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Max Price (₹)</label>
            <input
              type="number"
              min="0"
              value={filters.max_price || ''}
              onChange={(e) => handleFiltersChange({ max_price: e.target.value || null })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Search Name</label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500"
              placeholder="Starter Pack..."
            />
          </div>
        </div>
      </div>

      {/* Token Packs Table */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : packs.results.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No token packs found</h3>
            <p className="text-slate-600">Create your first token pack for users to purchase</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-bold text-slate-900">Pack Name</th>
                    <th className="px-6 py-6 text-right text-sm font-bold text-slate-900">Price</th>
                    <th className="px-6 py-6 text-right text-sm font-bold text-slate-900">Tokens</th>
                    <th className="px-6 py-6 text-left text-sm font-bold text-slate-900">Status</th>
                    <th className="px-8 py-6 text-right text-sm font-bold text-slate-900">Created</th>
                    <th className="px-8 py-6 text-right text-sm font-bold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {packs.results.map((pack) => (
                    <tr key={pack.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{pack.name}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(pack.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <p className="text-3xl font-bold text-amber-600">₹{pack.price_inr}</p>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <p className="text-3xl font-bold text-slate-900">{pack.tokens.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-2 rounded-2xl font-bold text-sm ${statusColor(pack.is_active)}`}>
                          {pack.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-sm text-slate-600">
                        {new Date(pack.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setFormData({
                              name: pack.name,
                              price_inr: pack.price_inr,
                              tokens: pack.tokens,
                            });
                            dispatch(setSelectedPack(pack));
                            setShowEditModal(true);
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(pack.id, pack.is_active)}
                          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md ${
                            pack.is_active
                              ? 'bg-rose-500 hover:bg-rose-600 text-white'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                          disabled={loading}
                        >
                          {pack.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {packs.totalPages > 1 && (
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {packs.pageSize * (packs.page - 1) + 1} to{' '}
                    {Math.min(packs.pageSize * packs.page, packs.count)} of {packs.count} packs
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(packs.page - 1)}
                                            disabled={packs.page === 1 || loading}
                      className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-slate-600">
                      Page {packs.page} of {packs.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(packs.page + 1)}
                      disabled={packs.page === packs.totalPages || loading}
                      className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                {showCreateModal ? 'Create Token Pack' : 'Edit Token Pack'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Pack Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Starter Pack"
                  maxLength={100}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    min="0.01"
                    max="100000"
                    step="0.01"
                    value={formData.price_inr}
                    onChange={(e) => setFormData({ ...formData, price_inr: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Tokens *</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.tokens}
                    onChange={(e) => setFormData({ ...formData, tokens: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={showCreateModal ? handleCreatePack : handleEditPack}
                  disabled={loading || !formData.name || formData.price_inr <= 0 || formData.tokens <= 0}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (showCreateModal ? 'Create Pack' : 'Update Pack')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-8 py-4 border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this utility function at the top of the file (before component)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default AdminTokenPacksPage;

