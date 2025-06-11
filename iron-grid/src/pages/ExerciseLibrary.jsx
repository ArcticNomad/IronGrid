import { useState } from 'react';

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([
    // Cardio
    { name: 'Jumping Jacks', category: 'Cardio', equipment: 'None', difficulty: 'Beginner', calories: 8.0 },
    { name: 'Burpees', category: 'Cardio', equipment: 'None', difficulty: 'Advanced', calories: 10.0 },
    { name: 'High Knees', category: 'Cardio', equipment: 'None', difficulty: 'Intermediate', calories: 9.0 },
    { name: 'Mountain Climbers', category: 'Cardio', equipment: 'None', difficulty: 'Intermediate', calories: 8.5 },
    { name: 'Skaters', category: 'Cardio', equipment: 'None', difficulty: 'Intermediate', calories: 8.0 },
    
    // Strength
    { name: 'Push-Ups', category: 'Strength', equipment: 'None', difficulty: 'Intermediate', calories: 7.5 },
    { name: 'Pull-Ups', category: 'Strength', equipment: 'Bar', difficulty: 'Advanced', calories: 8.0 },
    { name: 'Squats', category: 'Strength', equipment: 'None', difficulty: 'Beginner', calories: 6.0 },
    { name: 'Lunges', category: 'Strength', equipment: 'None', difficulty: 'Beginner', calories: 6.5 },
    { name: 'Deadlifts', category: 'Strength', equipment: 'Barbell', difficulty: 'Advanced', calories: 7.0 },
    
    // Flexibility
    { name: 'Hamstring Stretch', category: 'Flexibility', equipment: 'Mat', difficulty: 'Beginner', calories: 2.0 },
    { name: 'Cat-Cow Stretch', category: 'Flexibility', equipment: 'Mat', difficulty: 'Beginner', calories: 2.0 },
    { name: 'Child\'s Pose', category: 'Flexibility', equipment: 'Mat', difficulty: 'Beginner', calories: 1.5 },
    { name: 'Shoulder Rolls', category: 'Flexibility', equipment: 'None', difficulty: 'Beginner', calories: 1.0 },
    { name: 'Side Bend', category: 'Flexibility', equipment: 'None', difficulty: 'Beginner', calories: 1.2 },
    
    // Balance
    { name: 'Single-Leg Stand', category: 'Balance', equipment: 'None', difficulty: 'Beginner', calories: 3.0 },
    { name: 'Tree Pose', category: 'Balance', equipment: 'Mat', difficulty: 'Beginner', calories: 2.5 },
    { name: 'Bosu Ball Squats', category: 'Balance', equipment: 'Bosu Ball', difficulty: 'Intermediate', calories: 5.5 },
    { name: 'Heel-To-Toe Walk', category: 'Balance', equipment: 'None', difficulty: 'Beginner', calories: 2.0 },
    { name: 'Stork Stance', category: 'Balance', equipment: 'None', difficulty: 'Beginner', calories: 2.0 }
  ]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    category: 'Cardio',
    equipment: 'None',
    difficulty: 'Beginner',
    calories: 0,
    instructions: ''
  });

  const categories = ['All', 'Cardio', 'Strength', 'Flexibility', 'Balance'];
  const equipmentOptions = ['None', 'Mat', 'Bar', 'Barbell', 'Dumbbells', 'Kettlebells', 'Resistance Bands', 'Bosu Ball', 'Medicine Ball'];
  const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];

  const filteredExercises = activeCategory === 'All' 
    ? exercises 
    : exercises.filter(ex => ex.category === activeCategory);

  const handleAddExercise = (exerciseName) => {
    console.log(`Added ${exerciseName} to workout`);
    // You would implement your actual add logic here
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise(prev => ({
      ...prev,
      [name]: name === 'calories' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmitExercise = (e) => {
    e.preventDefault();
    setExercises(prev => [...prev, newExercise]);
    setNewExercise({
      name: '',
      category: 'Cardio',
      equipment: 'None',
      difficulty: 'Beginner',
      calories: 0,
      instructions: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Main Content */}
      <section className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className='text-3xl font-bold text-white border-2 px-2 py-2 rounded-lg  bg-gray-900'>Exercise Library</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Add New Exercise
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">{activeCategory} Exercises</h2>
          
          {/* Category Filter */}
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold ${activeCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Add Exercise Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Add New Exercise</h3>
              <form onSubmit={handleSubmitExercise}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Exercise Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newExercise.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={newExercise.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {categories.filter(c => c !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Equipment Needed</label>
                  <select
                    name="equipment"
                    value={newExercise.equipment}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {equipmentOptions.map(equipment => (
                      <option key={equipment} value={equipment}>{equipment}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Difficulty</label>
                  <select
                    name="difficulty"
                    value={newExercise.difficulty}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {difficultyOptions.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Calories per Minute</label>
                  <input
                    type="number"
                    name="calories"
                    value={newExercise.calories}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Instructions (Optional)</label>
                  <textarea
                    name="instructions"
                    value={newExercise.instructions}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Exercise Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExercises.map((exercise, index) => (
            <div key={index} className="bg-gradient-to-b from-gray-100 to-gray-400 rounded-lg shadow-md p-8 relative hover:shadow-lg transition-all duration-300 w-full h-96">
              <button 
                onClick={() => handleAddExercise(exercise.name)}
                className="absolute top-4 right-4 text-blue-600 hover:text-blue-800"
                title="Add to workout"
                
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:h-7 hover:w-7 transition-all hover:bg-white hover: rounded-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
               
              </button>
              
              <h3 className="text-xl font-bold mb-2">{exercise.name}</h3>
              <p className="text-gray-600 mb-1"><span className="font-medium">Category:</span> {exercise.category}</p>
              <p className="text-gray-600 mb-1"><span className="font-medium">Equipment:</span> {exercise.equipment}</p>
              <p className="text-gray-600 mb-1"><span className="font-medium">Difficulty:</span> {exercise.difficulty}</p>
              <p className="text-gray-600 mb-4"><span className="font-medium">Calories/min:</span> {exercise.calories}</p>
              
              {exercise.instructions && (
                <div className="mb-3">
                  <p className="text-gray-600"><span className="font-medium">Instructions:</span> {exercise.instructions}</p>
                </div>
              )}
              
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 font-medium inline-block mt-2 "
              >
                View Instructions
              </a>
            
            <div className='absolute bottom-1 right-1'>

              <button className=' border-2 text-white border-black rounded-lg bg-red-700 font-semibold px-1 py-1 hover:px-2 hover:py-2 transition-all hover:bg-red-500'>
                delete
              </button>
            </div>


            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExerciseLibrary;