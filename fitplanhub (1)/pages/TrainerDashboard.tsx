import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { Plan } from '../types';
import { getPlans, createPlan, deletePlan } from '../services/api';
import { generatePlanDescription } from '../services/geminiService';
import { Plus, Trash2, Wand2, Loader2, X, CheckCircle } from 'lucide-react';

const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMyPlans();
  }, [user]);

  const loadMyPlans = async () => {
    if (!user) return;
    try {
      const allPlans = await getPlans();
      const myPlans = allPlans.filter(p => p.trainerId === user.id);
      setPlans(myPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!title || !duration) {
      alert("Please enter a Title and Duration first.");
      return;
    }
    setGeneratingAi(true);
    const desc = await generatePlanDescription(title, parseInt(duration), user?.name || 'Trainer');
    setDescription(desc);
    setGeneratingAi(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await createPlan({
        trainerId: user.id,
        title,
        description,
        price: parseFloat(price),
        durationDays: parseInt(duration),
        tags: []
      }, user);
      
      // Reset and reload
      setTitle('');
      setDescription('');
      setPrice('');
      setDuration('');
      setIsModalOpen(false);
      loadMyPlans();

      // Show success message
      setSuccessMessage('Plan published successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      await deletePlan(id);
      loadMyPlans();
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-24 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-2 hover:bg-emerald-700 rounded-full p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Trainer Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your fitness content and track your plans.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Create New Plan
        </button>
      </div>

      {loading ? (
         <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6">
          {plans.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-gray-700">
               <p className="text-gray-400">You haven't created any plans yet.</p>
            </div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="bg-card p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-1">{plan.description}</p>
                  <div className="flex gap-4 mt-3 text-sm font-mono text-primary">
                    <span>${plan.price}</span>
                    <span className="text-gray-500">|</span>
                    <span>{plan.durationDays} Days</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Create Fitness Plan</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Plan Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Shred 2024"
                    className="w-full bg-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    className="w-full bg-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                   <label className="block text-sm font-medium text-gray-400">Description</label>
                   <button 
                     type="button"
                     onClick={handleGenerateAI}
                     disabled={generatingAi || !title || !duration}
                     className="text-xs flex items-center gap-1 text-secondary hover:text-blue-400 disabled:opacity-50"
                   >
                     {generatingAi ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>}
                     Generate with AI
                   </button>
                </div>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the workout plan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="49.99"
                  className="w-full bg-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Publish Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;