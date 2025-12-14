import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { Plan } from '../types';
import { getUserSubscriptions, getFollowedPlans } from '../services/api';
import { Link } from 'react-router-dom';
import { PlayCircle, Star } from 'lucide-react';

const UserFeed: React.FC = () => {
  const { user } = useAuth();
  const [purchasedPlans, setPurchasedPlans] = useState<Plan[]>([]);
  const [feedPlans, setFeedPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [myPlans, feed] = await Promise.all([
          getUserSubscriptions(user.id),
          getFollowedPlans(user.id)
        ]);
        setPurchasedPlans(myPlans);
        // Filter out plans user already bought from the feed to avoid duplicates/confusion
        const myPlanIds = new Set(myPlans.map(p => p.id));
        setFeedPlans(feed.filter(p => !myPlanIds.has(p.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading your feed...</div>;

  return (
    <div className="space-y-12">
      {/* My Plans Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <PlayCircle className="text-primary" /> My Active Plans
        </h2>
        {purchasedPlans.length === 0 ? (
          <div className="bg-card p-8 rounded-xl border border-dashed border-gray-700 text-center">
            <p className="text-gray-400 mb-4">You haven't subscribed to any plans yet.</p>
            <Link to="/" className="text-primary font-medium hover:underline">Browse Marketplace</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedPlans.map(plan => (
              <Link key={plan.id} to={`/plan/${plan.id}`} className="block bg-card rounded-xl overflow-hidden border border-gray-700 hover:border-primary transition">
                <div className="h-32 bg-gray-800 relative">
                   <img src={`https://picsum.photos/seed/${plan.id}/600/300`} className="w-full h-full object-cover opacity-80" alt={plan.title} />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white drop-shadow-lg opacity-80" />
                   </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-white truncate">{plan.title}</h3>
                  <p className="text-sm text-gray-400">Continue training</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trainer Feed Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Star className="text-secondary" /> New from Trainers You Follow
        </h2>
        {feedPlans.length === 0 ? (
          <div className="text-gray-500 italic">
            No new plans from followed trainers. Try following more trainers!
          </div>
        ) : (
           <div className="space-y-4">
             {feedPlans.map(plan => (
               <div key={plan.id} className="bg-card p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row gap-6 hover:bg-gray-800/50 transition">
                  <div className="w-full md:w-48 h-32 bg-gray-700 rounded-lg overflow-hidden shrink-0">
                     <img src={`https://picsum.photos/seed/${plan.id}/400/300`} className="w-full h-full object-cover" alt={plan.title} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <div>
                         <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                         <Link to={`/trainer/${plan.trainerId}`} className="text-sm text-primary hover:underline block mb-2">{plan.trainerName}</Link>
                       </div>
                       <span className="font-bold text-white bg-gray-700 px-3 py-1 rounded-full text-sm">${plan.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{plan.description}</p>
                    <Link to={`/plan/${plan.id}`} className="text-sm font-bold text-white border border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition inline-block">
                      View Plan
                    </Link>
                  </div>
               </div>
             ))}
           </div>
        )}
      </section>
    </div>
  );
};

export default UserFeed;