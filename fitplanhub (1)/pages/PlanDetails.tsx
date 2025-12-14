import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Plan } from '../types';
import { getPlanById, checkAccess, subscribeToPlan } from '../services/api';
import { Lock, Unlock, CheckCircle, Clock, Calendar } from 'lucide-react';

const PlanDetails: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!planId) return;
      try {
        const p = await getPlanById(planId);
        setPlan(p);
        
        if (user && p) {
          const access = await checkAccess(user.id, p.id);
          setHasAccess(access);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [planId, user]);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!plan) return;

    setPurchasing(true);
    try {
      // Simulate API call and payment delay
      await subscribeToPlan(user.id, plan.id);
      setHasAccess(true);
      alert("Purchase successful! You now have full access.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-gray-500">Loading plan...</div>;
  if (!plan) return <div className="text-center p-12 text-red-500">Plan not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-card border border-gray-700 shadow-2xl">
        <div className="h-64 md:h-80 bg-gray-800 relative">
          <img 
            src={`https://picsum.photos/seed/${plan.id}/1200/600`} 
            alt={plan.title}
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 to-transparent p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{plan.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-300">
               <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                 <Clock className="w-4 h-4" /> {plan.durationDays} Days
               </span>
               <Link to={`/trainer/${plan.trainerId}`} className="hover:text-white underline">
                 By {plan.trainerName}
               </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">About this Plan</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{plan.description}</p>
              </div>

              {/* Conditional Content */}
              <div className={`mt-8 p-6 rounded-xl border ${hasAccess ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {hasAccess ? (
                    <Unlock className="text-primary w-6 h-6" />
                  ) : (
                    <Lock className="text-gray-400 w-6 h-6" />
                  )}
                  <h3 className="text-xl font-bold text-white">
                    {hasAccess ? "Full Program Schedule" : "Locked Content"}
                  </h3>
                </div>

                {hasAccess ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-darker rounded-lg border border-gray-700 flex gap-4">
                      <div className="bg-primary/20 text-primary w-12 h-12 rounded-full flex items-center justify-center font-bold">1</div>
                      <div>
                         <h4 className="font-bold text-white">Day 1: Assessment & Core</h4>
                         <p className="text-sm text-gray-400">Warmup, 3x10 Crunches, 3x60s Planks...</p>
                      </div>
                    </div>
                     <div className="p-4 bg-darker rounded-lg border border-gray-700 flex gap-4">
                      <div className="bg-primary/20 text-primary w-12 h-12 rounded-full flex items-center justify-center font-bold">2</div>
                      <div>
                         <h4 className="font-bold text-white">Day 2: Lower Body Power</h4>
                         <p className="text-sm text-gray-400">Warmup, 5x5 Squats, 3x12 Lunges...</p>
                      </div>
                    </div>
                    <div className="p-4 bg-darker rounded-lg border border-gray-700 flex gap-4 opacity-50">
                      <div className="bg-gray-700 text-gray-500 w-12 h-12 rounded-full flex items-center justify-center font-bold">...</div>
                      <div className="flex items-center">
                         <p className="text-sm text-gray-400">Remaining 28 days of content available.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-6">Subscribe to this plan to unlock the full 30-day schedule, video guides, and nutrition tips.</p>
                    <div className="filter blur-sm select-none opacity-50 space-y-2">
                       <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
                       <div className="h-4 bg-gray-600 rounded w-1/2 mx-auto"></div>
                       <div className="h-4 bg-gray-600 rounded w-5/6 mx-auto"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="md:col-span-1">
              <div className="bg-darker p-6 rounded-2xl border border-gray-700 sticky top-24">
                <div className="text-3xl font-bold text-white mb-2">${plan.price}</div>
                <div className="text-sm text-gray-400 mb-6">One-time payment • Lifetime access</div>
                
                {hasAccess ? (
                  <button disabled className="w-full bg-emerald-900/50 text-emerald-400 border border-emerald-500/50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-default">
                    <CheckCircle className="w-5 h-5" /> Plan Active
                  </button>
                ) : (
                  <button 
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition transform active:scale-95 disabled:opacity-50"
                  >
                    {purchasing ? 'Processing...' : 'Start Plan Now'}
                  </button>
                )}

                <div className="mt-6 space-y-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> Full Workout Schedule
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> Mobile Friendly
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> Trainer Support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;