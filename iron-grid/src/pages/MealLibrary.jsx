import { useState } from 'react';

const MealLibrary = () => {
  const [meals, setMeals] = useState([
    // Breakfast
    { 
      name: 'Avocado Toast', 
      type: 'breakfast', 
      preparationTime: 10, 
      isVegetarian: true, 
      isVegan: false, 
      isGlutenFree: false,
      servingSize: '2 slices',
      calories: 350,
      protein: 10,
      carbs: 35,
      fat: 20,
      fiber: 7
    },
    { 
      name: 'Greek Yogurt Parfait', 
      type: 'breakfast', 
      preparationTime: 5, 
      isVegetarian: true, 
      isVegan: false, 
      isGlutenFree: true,
      servingSize: '1 bowl',
      calories: 280,
      protein: 15,
      carbs: 30,
      fat: 8,
      fiber: 4
    },
    
    // Lunch
    { 
      name: 'Quinoa Salad', 
      type: 'lunch', 
      preparationTime: 20, 
      isVegetarian: true, 
      isVegan: true, 
      isGlutenFree: true,
      servingSize: '1 bowl',
      calories: 400,
      protein: 12,
      carbs: 45,
      fat: 18,
      fiber: 8
    },
    { 
      name: 'Grilled Chicken Wrap', 
      type: 'lunch', 
      preparationTime: 15, 
      isVegetarian: false, 
      isVegan: false, 
      isGlutenFree: false,
      servingSize: '1 wrap',
      calories: 450,
      protein: 35,
      carbs: 30,
      fat: 22,
      fiber: 5
    },
    
    // Dinner
    { 
      name: 'Salmon with Vegetables', 
      type: 'dinner', 
      preparationTime: 25, 
      isVegetarian: false, 
      isVegan: false, 
      isGlutenFree: true,
      servingSize: '1 plate',
      calories: 500,
      protein: 40,
      carbs: 25,
      fat: 30,
      fiber: 6
    },
    
    // Snacks
    { 
      name: 'Protein Smoothie', 
      type: 'snack', 
      preparationTime: 5, 
      isVegetarian: true, 
      isVegan: false, 
      isGlutenFree: true,
      servingSize: '1 glass',
      calories: 250,
      protein: 25,
      carbs: 20,
      fat: 5,
      fiber: 3
    }
  ]);

  const [activeType, setActiveType] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'breakfast',
    preparationTime: 10,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    servingSize: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    recipeUrl: ''
  });

  const mealTypes = ['All', 'breakfast', 'lunch', 'dinner', 'snack'];

  const filteredMeals = activeType === 'All' 
    ? meals 
    : meals.filter(meal => meal.type === activeType);

  const handleAddMeal = (mealName) => {
    console.log(`Added ${mealName} to meal plan`);
    // You would implement your actual add logic here
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMeal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSubmitMeal = (e) => {
    e.preventDefault();
    setMeals(prev => [...prev, newMeal]);
    setNewMeal({
      name: '',
      type: 'breakfast',
      preparationTime: 10,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      servingSize: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      recipeUrl: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Main Content */}
      <section className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className='text-3xl font-bold text-white border-2 px-2 py-2 rounded-lg  bg-gray-900'>Meal Library</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Add New Meal
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white capitalize">{activeType === 'All' ? 'All' : activeType} Meals</h2>
          
          {/* Meal Type Filter */}
          <div className="flex space-x-2">
            {mealTypes.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-full capitalize font-semibold ${activeType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Add Meal Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Add New Meal</h3>
              <form onSubmit={handleSubmitMeal}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Meal Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newMeal.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Meal Type</label>
                  <select
                    name="type"
                    value={newMeal.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {mealTypes.filter(t => t !== 'All').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Preparation Time (minutes)</label>
                  <input
                    type="number"
                    name="preparationTime"
                    value={newMeal.preparationTime}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isVegetarian"
                      checked={newMeal.isVegetarian}
                      onChange={handleInputChange}
                      className="h-5 w-5"
                    />
                    <span>Vegetarian</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isVegan"
                      checked={newMeal.isVegan}
                      onChange={handleInputChange}
                      className="h-5 w-5"
                    />
                    <span>Vegan</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isGlutenFree"
                      checked={newMeal.isGlutenFree}
                      onChange={handleInputChange}
                      className="h-5 w-5"
                    />
                    <span>Gluten Free</span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Serving Size</label>
                  <input
                    type="text"
                    name="servingSize"
                    value={newMeal.servingSize}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Calories</label>
                    <input
                      type="number"
                      name="calories"
                      value={newMeal.calories}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Protein (g)</label>
                    <input
                      type="number"
                      name="protein"
                      value={newMeal.protein}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Carbs (g)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={newMeal.carbs}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Fat (g)</label>
                    <input
                      type="number"
                      name="fat"
                      value={newMeal.fat}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Fiber (g)</label>
                  <input
                    type="number"
                    name="fiber"
                    value={newMeal.fiber}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Recipe URL (Optional)</label>
                  <input
                    type="url"
                    name="recipeUrl"
                    value={newMeal.recipeUrl}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
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
                    Add Meal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMeals.map((meal, index) => (
            <div key={index} className="overflow-hidden bg-gradient-to-b from-gray-100 to-gray-400 rounded-lg shadow-md p-8 relative hover:shadow-lg transition-all duration-300 w-full h-96">
              <button 
                onClick={() => handleAddMeal(meal.name)}
                className="absolute top-4 right-4 text-blue-600 hover:text-blue-800"
                title="Add to meal plan"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:h-7 hover:w-7 transition-all hover:bg-white hover: rounded-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              
              <h3 className="text-xl font-bold mb-2 capitalize">{meal.name}</h3>
              <p className="text-gray-600 mb-1"><span className="font-medium">Type:</span> <span className="capitalize">{meal.type}</span></p>
              <p className="text-gray-600 mb-1"><span className="font-medium">Prep Time:</span> {meal.preparationTime} mins</p>
              <p className="text-gray-600 mb-1"><span className="font-medium">Serving:</span> {meal.servingSize}</p>
              
              <div className="my-3 p-2 bg-gray-200 rounded h-9 overflow-hidden hover:h-45 transition-all   ">
                <p className="text-gray-800 font-semibold">Nutrition</p>
                <p className="text-gray-600">Calories: {meal.calories}</p>
                <p className="text-gray-600">Protein: {meal.protein}g</p>
                <p className="text-gray-600">Carbs: {meal.carbs}g</p>
                <p className="text-gray-600">Fat: {meal.fat}g</p>
                <p className="text-gray-600">Fiber: {meal.fiber}g</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {meal.isVegetarian && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded overflow-hidden">Vegetarian</span>}
                {meal.isVegan && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded overflow-hidden">Vegan</span>}
                {meal.isGlutenFree && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded overflow-hidden">Gluten Free</span>}
              </div>
              
              {meal.recipeUrl && (
                <a 
                  href={meal.recipeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium inline-block mt-2"
                >
                  View Recipe
                </a>
              )}
              
              <div className='absolute bottom-1 right-1'>
                <button className='border-2 text-white border-black rounded-lg bg-red-700 font-semibold px-1 py-1 hover:px-2 hover:py-2 transition-all hover:bg-red-500'>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MealLibrary;