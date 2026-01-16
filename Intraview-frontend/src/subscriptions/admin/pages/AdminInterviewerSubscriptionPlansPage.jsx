// src/pages/admin/AdminInterviewerSubscriptionPlansPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  fetchPlans,
  createPlan,
  updatePlan,
  activatePlan,
  deactivatePlan,
  setFilter,
  setSelectedPlan,
} from '../../adminInterviewerSubscriptionSlice';

const AdminInterviewerSubscriptionPlansPage = () => {
  const dispatch = useDispatch();
  const { plans, selectedPlan, loading, error, filters } = useSelector(
    (state) => state.adminInterviewerSubscription
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price_inr: 0,
    billing_cycle_days: 30,
  });

  useEffect(() => {
    dispatch(fetchPlans({ page: 1, pageSize: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFilterChange = (active) => {
    dispatch(setFilter(active === 'all' ? null : active));
    dispatch(fetchPlans({ page: 1, pageSize: 20, active: active === 'all' ? null : active }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchPlans({ page, pageSize: plans.pageSize, active: filters.active }));
  };

  const handleCreatePlan = () => {
    dispatch(createPlan(formData))
      .unwrap()
      .then(() => {
        toast.success('Interviewer plan created successfully!');
        setShowCreateModal(false);
        resetForm();
        dispatch(fetchPlans({ page: 1, pageSize: 20 }));
      })
      .catch(toast.error);
  };

  const handleEditPlan = () => {
    dispatch(updatePlan({ id: selectedPlan.id, planData: formData }))
      .unwrap()
      .then(() => {
        toast.success('Interviewer plan updated successfully!');
        setShowEditModal(false);
      })
      .catch(toast.error);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      price_inr: 0,
      billing_cycle_days: 30,
    });
  };

  const handleToggleActive = (id, isActive) => {
    if (isActive) {
      dispatch(deactivatePlan(id)).unwrap().then(() => toast.success('Plan deactivated'));
    } else {
      dispatch(activatePlan(id)).unwrap().then(() => toast.success('Plan activated'));
    }
  };

  const statusColor = (isActive) => 
    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Interviewer Subscription Plans</h1>
          <p className="text-xl text-slate-600 mt-2">Manage interviewer pricing plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          disabled={loading}
        >
          + New Interviewer Plan
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-8">
        <select
          value={filters.active || 'all'}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-6 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-semibold"
          disabled={loading}
        >
          <option value="all">All Plans</option>
          <option value="true">Active Plans</option>
          <option value="false">Inactive Plans</option>
        </select>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : plans.results.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No interviewer plans found</h3>
            <p className="text-slate-600">Create your first interviewer subscription plan</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-bold text-slate-900">Plan Name</th>
                    <th className="px-6 py-6 text-left text-sm font-bold text-slate-900">Slug</th>
                    <th className="px-6 py-6 text-left text-sm font-bold text-slate-900">Price</th>
                    <th className="px-6 py-6 text-left text-sm font-bold text-slate-900">Cycle</th>
                    <th className="px-6 py-6 text-left text-sm font-bold text-slate-900">Status</th>
                    <th className="px-8 py-6 text-right text-sm font-bold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {plans.results.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{plan.name}</p>
                          <p className="text-sm text-slate-500">
                            Created {new Date(plan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <code className="bg-slate-100 px-3 py-1 rounded-xl text-sm font-mono text-slate-800">
                          {plan.slug}
                        </code>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-3xl font-bold text-indigo-600">₹{plan.price_inr}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-4 py-2 bg-slate-100 text-slate-800 rounded-2xl text-sm font-semibold">
                          {plan.billing_cycle_days} days
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-2 rounded-2xl font-bold text-sm ${statusColor(plan.is_active)}`}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setFormData({
                              name: plan.name,
                              slug: plan.slug,
                              price_inr: plan.price_inr,
                              billing_cycle_days: plan.billing_cycle_days,
                            });
                            dispatch(setSelectedPlan(plan));
                            setShowEditModal(true);
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(plan.id, plan.is_active)}
                          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md ${
                            plan.is_active
                              ? 'bg-rose-500 hover:bg-rose-600 text-white'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                          disabled={loading}
                        >
                          {plan.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {plans.totalPages > 1 && (
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {plans.pageSize * (plans.page - 1) + 1} to{' '}
                    {Math.min(plans.pageSize * plans.page, plans.count)} of {plans.count} plans
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(plans.page - 1)}
                      disabled={plans.page === 1 || loading}
                      className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-slate-600">
                      Page {plans.page} of {plans.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(plans.page + 1)}
                      disabled={plans.page === plans.totalPages || loading}
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
                {showCreateModal ? 'Create Interviewer Plan' : 'Edit Interviewer Plan'}
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
                <label className="block text-sm font-bold text-slate-900 mb-2">Plan Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Basic Interviewer"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="basic-interviewer"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_inr}
                    onChange={(e) => setFormData({ ...formData, price_inr: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Billing Cycle (days) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.billing_cycle_days}
                    onChange={(e) => setFormData({ ...formData, billing_cycle_days: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={showCreateModal ? handleCreatePlan : handleEditPlan}
                  disabled={loading || !formData.name || !formData.slug || !formData.price_inr || !formData.billing_cycle_days}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (showCreateModal ? 'Create Plan' : 'Update Plan')}
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

export default AdminInterviewerSubscriptionPlansPage;
