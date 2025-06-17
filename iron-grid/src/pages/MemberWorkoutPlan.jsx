import { useEffect, useState } from 'react';

const MemberWorkoutPlan = ({memberId}) => {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const member_id = memberId
        console.log(memberId);
        if (!memberId) throw new Error('Member ID not found');

        const response = await fetch(`/api/member/${memberId}/workout-plan`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch workout plan');
        }
        
        const data = await response.json();
        
        if (data.success && data.workoutPlan) {
          setWorkoutPlan(data.workoutPlan);
        } else {
          throw new Error(data.message || 'No workout plan data received');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, []);

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || `Day ${dayNum}`;
  };

  if (loading) return <div className="text-white text-center py-8">Loading workout plan...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  if (!workoutPlan) return <div className="text-white text-center py-8">No workout plan assigned</div>;

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{workoutPlan.plan_name}</h2>
        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          {workoutPlan.difficulty_level}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-gray-300">
          Duration: {workoutPlan.duration_weeks} weeks • {workoutPlan.duration_session} minutes per session
        </p>
        {workoutPlan.notes && (
          <p className="text-gray-400 mt-2">{workoutPlan.notes}</p>
        )}
      </div>

      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6, 7].map(dayNum => {
          const dayExercises = workoutPlan.exercises?.filter(ex => ex.day_num === dayNum) || [];
          if (dayExercises.length === 0) return null;

          return (
            <div key={dayNum} className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-600 px-4 py-3">
                <h3 className="font-semibold text-lg">
                  {getDayName(dayNum)}
                </h3>
              </div>
              <div className="divide-y divide-gray-600">
                {dayExercises.map(exercise => (
                  <div key={exercise.plan_exercise_id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{exercise.ex_name}</h4>
                        <p className="text-sm text-gray-300">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {exercise.category} • {exercise.equipment_needed || 'No equipment needed'}
                        </p>
                      </div>
                      <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                        {exercise.difficulty}
                      </span>
                    </div>
                    {exercise.instructions && (
                      <p className="mt-2 text-sm text-gray-300">{exercise.instructions}</p>
                    )}
                    {exercise.video_url && (
                      <a 
                        href={exercise.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                        </svg>
                        Watch demonstration
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberWorkoutPlan;