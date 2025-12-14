import React, { useEffect, useState } from 'react';
import { Plan } from '../types';
import { getPlans } from '../services/api';
import { Link } from 'react-router-dom';
import { Clock, Tag, User } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
          Find Your Perfect Fitness Plan
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Connect with certified trainers and unlock expert-crafted workout routines designed to help you crush your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Link key={plan.id} to={`/plan/${plan.id}`} className="group relative bg-card rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border border-gray-800 hover:border-primary/50">
            <div className="h-48 bg-gray-700 relative overflow-hidden">
               <img 
                 src={`https://picsum.photos/seed/${plan.id}/600/400`} 
                 alt={plan.title} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
               />
               <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-primary font-bold">
                 ${plan.price}
               </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{plan.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                   <User className="w-4 h-4" />
                   <span>{plan.trainerName}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-1">
                   <Clock className="w-4 h-4" />
                   <span>{plan.durationDays} Days</span>
                </div>
                <div className="text-primary font-medium">View Details &rarr;</div>
              </div>
            </div>
          </Link>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No plans available yet. Check back later!
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;