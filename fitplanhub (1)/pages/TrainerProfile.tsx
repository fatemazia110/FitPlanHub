import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Plan, User, UserRole } from '../types';
import { getPlans, isFollowing, followTrainer, unfollowTrainer, getSession } from '../services/api';
import { UserCheck, UserPlus, Dumbbell } from 'lucide-react';

const TrainerProfile: React.FC = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [trainerName, setTrainerName] = useState('Trainer');
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!trainerId) return;
      try {
        const allPlans = await getPlans();
        const trainerPlans = allPlans.filter(p => p.trainerId === trainerId);
        setPlans(trainerPlans);
        if (trainerPlans.length > 0) {
            setTrainerName(trainerPlans[0].trainerName);
        } else {
            // In a real app we'd fetch user details by ID directly
            setTrainerName("Unknown Trainer"); 
        }

        if (user) {
          const isF = await isFollowing(user.id, trainerId);
          setFollowing(isF);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trainerId, user]);

  const toggleFollow = async () => {
    if (!user) return alert("Please login to follow trainers.");
    if (!trainerId) return;

    if (following) {
      await unfollowTrainer(user.id, trainerId);
      setFollowing(false);
    } else {
      await followTrainer(user.id, trainerId);
      setFollowing(true);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card border border-gray-700 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl overflow-hidden border-4 border-gray-600">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trainerId}`} alt="avatar" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-white">{trainerName}</h1>
             <p className="text-gray-400 mt-1 flex items-center gap-2">
               <Dumbbell className="w-4 h-4" /> Certified Personal Trainer
             </p>
             <div className="mt-4 flex gap-4 text-sm text-gray-500">
                <span>{plans.length} Plans</span>
                <span>•</span>
                <span>High Rating</span>
             </div>
           </div>
        </div>

        {user && user.id !== trainerId && (
          <button 
            onClick={toggleFollow}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition ${following ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-primary text-white hover:bg-emerald-600 shadow-lg shadow-primary/20'}`}
          >
            {following ? (
              <> <UserCheck className="w-5 h-5" /> Following </>
            ) : (
              <> <UserPlus className="w-5 h-5" /> Follow </>
            )}
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map(plan => (
           <Link key={plan.id} to={`/plan/${plan.id}`} className="bg-card border border-gray-700 rounded-xl p-6 hover:border-primary transition group">
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{plan.title}</h3>
              <p className="text-gray-400 mt-2 mb-4 line-clamp-2">{plan.description}</p>
              <div className="flex justify-between items-center text-sm font-medium">
                 <span className="text-white bg-gray-700 px-3 py-1 rounded-lg">${plan.price}</span>
                 <span className="text-gray-400">{plan.durationDays} Days</span>
              </div>
           </Link>
        ))}
        {plans.length === 0 && <p className="text-gray-500">No plans available.</p>}
      </div>
    </div>
  );
};

export default TrainerProfile;