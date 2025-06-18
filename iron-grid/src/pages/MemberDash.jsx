import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberWorkoutPlan from "./MemberWorkoutPlan";
import MemberDietPlan from "./MemberDietPlan";
import MemberProgress from "./MemberProgress";
import MemberWorkoutSession from "./MemberWorkoutSession";

const MemberDash = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exercises, setExercises] = useState({});
  const [isLoading, setIsLoading] = useState({
    workout: false,
    diet: false,
  });
  const [memberData, setMemberData] = useState({
    name: "",
    currentWeight: 0,
    targetWeight: 0,
    fitnessLevel: 0,
    activeWorkoutPlan: "Not assigned",
    activeDietPlan: "Not assigned",
    memberId: "",
  });
  const [availablePlans, setAvailablePlans] = useState({
    workout: [],
    diet: [],
  });

  const fetchExercises = async (planId) => {
    setLoadingExercises(true);
    try {
      const response = await fetch(`/api/workout-plans/${planId}/exercises`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExercises((prev) => ({
          ...prev,
          [planId]: data.exercises || [],
        }));
      }
    } catch (err) {
      console.error("Error fetching exercises:", err);
    } finally {
      setLoadingExercises(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        const member_id = localStorage.getItem("member_id");
        console.log(member_id);

        if (!member_id || member_id == "undefined") {
          setShowPopup(true);
          setMessage("Please Log in First");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // Fetch member data
        const memberResponse = await fetch(`/api/member/${user_id}/data`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (memberResponse.ok) {
          const data = await memberResponse.json();
          console.log("API Response:", data);

          setMemberData((prev) => ({
            ...prev,
            name: data.name || prev.name,
            currentWeight:
              data.currentWeight !== undefined
                ? data.currentWeight
                : prev.currentWeight,
            targetWeight:
              data.targetWeight !== undefined
                ? data.targetWeight
                : prev.targetWeight,
            fitnessLevel:
              data.fitnessLevel !== undefined
                ? data.fitnessLevel
                : prev.fitnessLevel,
            activeWorkoutPlan: data.activeWorkoutPlan || prev.activeWorkoutPlan,
            activeDietPlan: data.activeDietPlan || prev.activeDietPlan,
            memberId: data.memberId || prev.memberId,
          }));

          if (data.memberId) {
            localStorage.setItem("member_id", data.memberId);
          }
        }

        // Fetch available plans when needed
        if (activeTab === "workout") {
          const workoutResponse = await fetch("/api/workout-plans/available", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (workoutResponse.ok) {
            const workoutPlans = await workoutResponse.json();
            console.log("Workout plans:", workoutPlans);
            setAvailablePlans((prev) => ({
              ...prev,
              workout: workoutPlans.plans || [],
            }));
          }
        }

        if (activeTab === "diet") {
          const dietResponse = await fetch("/api/diet-plans/available", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (dietResponse.ok) {
            const dietPlans = await dietResponse.json();
            setAvailablePlans((prev) => ({
              ...prev,
              diet: dietPlans.plans || [],
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setShowPopup(true);
        setMessage("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [navigate, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("member_id");
    navigate("/");
  };

  const assignPlan = async (type, planId) => {
    setIsLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const endpoint =
        type === "workout"
          ? "/api/member/assign-workout-plan"
          : "/api/member/assign-diet-plan";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          member_id: memberData.memberId,
          [`${type}_plan_id`]: planId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMemberData((prev) => ({
          ...prev,
          [`active${type.charAt(0).toUpperCase() + type.slice(1)}Plan`]:
            data.plan_name,
        }));
        setMessage(
          `${
            type === "workout" ? "Workout" : "Diet"
          } plan assigned successfully!`
        );
        setShowPopup(true);

        // Refresh the data
        const memberResponse = await fetch(
          `/api/member/${localStorage.getItem("user_id")}/data`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (memberResponse.ok) {
          const newData = await memberResponse.json();
          setMemberData(newData);
        }
      } else {
        setMessage(`Failed to assign ${type} plan`);
        setShowPopup(true);
      }
    } catch (err) {
      console.error(`Error assigning ${type} plan:`, err);
      setMessage(`Error assigning ${type} plan`);
      setShowPopup(true);
    } finally {
      setIsLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleChangePlan = (type) => {
    if (confirm(`Are you sure you want to change your ${type} plan?`)) {
      setMemberData((prev) => ({
        ...prev,
        [`active${type.charAt(0).toUpperCase() + type.slice(1)}Plan`]:
          "Not assigned",
      }));
    }
  };

  const handleDeletePlan = async (type) => {
    if (
      !confirm(`Are you sure you want to permanently delete your ${type} plan?`)
    ) {
      return;
    }

    setIsLoading((prev) => ({ ...prev, [type]: true }));

    try {
      const endpoint =
        type === "workout"
          ? "/api/member/delete-workout-plan"
          : "/api/member/delete-diet-plan";

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          member_id: memberData.memberId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMemberData((prev) => ({
          ...prev,
          [`active${type.charAt(0).toUpperCase() + type.slice(1)}Plan`]:
            "Not assigned",
        }));
        setMessage(
          `${
            type === "workout" ? "Workout" : "Diet"
          } plan deleted successfully!`
        );
        setShowPopup(true);

        // Refresh member data
        const user_id = localStorage.getItem("user_id");
        const memberResponse = await fetch(`/api/member/${user_id}/data`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (memberResponse.ok) {
          const newData = await memberResponse.json();
          setMemberData(newData);
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || `Failed to delete ${type} plan`);
        setShowPopup(true);
      }
    } catch (err) {
      console.error(`Error deleting ${type} plan:`, err);
      setMessage(`Error deleting ${type} plan`);
      setShowPopup(true);
    } finally {
      setIsLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Notification</h2>
            <p className="mb-4">{message}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <header className="bg-gray-800 shadow-md border-2 rounded-2xl m-2 absolute inset-x-0 top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold">Member Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative px-6 pt-14 lg:px-8">
        <section className="mb-8 mt-15 ">
          <h2 className="text-2xl font-bold mb-2">
            Welcome, {memberData.name}!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-2xl border-1 border-white ">
              <h3 className="text-lg font-semibold mb-2">Current Weight</h3>
              <p className="text-2xl font-extrabold">
                {memberData.currentWeight} kg
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-2xl border-1 border-white">
              <h3 className="text-lg font-semibold mb-2">Target Weight</h3>
              <p className="text-2xl font-extrabold">
                {memberData.targetWeight} kg
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-2xl border-1 border-white">
              <h3 className="text-lg font-semibold mb-2">Fitness Level</h3>
              <p className="text-2xl font-extrabold">
                {memberData.fitnessLevel}/5
              </p>
            </div>
          </div>
        </section>

        <div className="mb-8 border-b border-gray-700">
          <nav className="flex space-x-4 mt-8">
            <div className="flex justify-between items-center gap-2 flex-col">
              <div className="relative group">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`py-2 px-4 font-medium hover:cursor-pointer ${
                    activeTab === "dashboard"
                      ? "border-b-2 border-red-500 text-red-400 hover:cursor-pointer"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Dashboard
                </button>

                {/* Image that appears on button hover */}
                <img
                  className="mb-12 w-9 h-9 mt 3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                  src="dashboard.png"
                  alt="Workout report"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 flex-col">
              <div className="relative group">
                <button
                  onClick={() => setActiveTab("workout")}
                  className={`py-2 px-4 font-medium hover:cursor-pointer ${
                    activeTab === "workout"
                      ? "border-b-2 border-red-500 text-red-400 hover:cursor-pointer"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Workout Plan
                </button>

                {/* Image that appears on button hover */}
                <img
                  className="mb-12 w-9 h-9 mt 3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                  src="report2.png"
                  alt="Workout report"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 flex-col">
              <div className="relative group">
                <button
                  onClick={() => setActiveTab("diet")}
                  className={`py-2 px-4 font-medium  hover:cursor-pointer ${
                    activeTab === "diet"
                      ? "border-b-2 border-red-500 text-red-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Diet Plan
                </button>

                {/* Image that appears on button hover */}
                <img
                  className="mb-12 w-9 mt-3 h-9 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                  src="plan2.png"
                  alt="Workout report"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 flex-col">
              <div className="relative group">
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`py-2 px-4 font-medium  hover:cursor-pointer ${
                    activeTab === "progress"
                      ? "border-b-2 border-red-500 text-red-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Progress
                </button>

                {/* Image that appears on button hover */}
                <img
                  className="mb-12 w-9 mt-3 h-9 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                  src="roadmap.png"
                  alt="roadmap report"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 flex-col">
              <div className="relative group">
                <button
                  onClick={() => setActiveTab("sessions")}
                  className={`py-2 px-4 font-medium  hover:cursor-pointer ${
                    activeTab === "sessions"
                      ? "border-b-2 border-red-500 text-red-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Workout Sessions
                </button>

                {/* Image that appears on button hover */}
                <img
                  className="mb-12 w-9 mt-3 h-9 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                  src="weightlift.png"
                  alt="roadmap report"
                />
              </div>
            </div>
          </nav>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          {activeTab === "progress" && (
            <MemberProgress memberId={memberData.memberId} />
          )}
          {activeTab === "sessions" && (
            <MemberWorkoutSession memberId={memberData.memberId} />
          )}
          {activeTab === "dashboard" && (
            <div>
              <h1 className="text-3xl font-extrabold mb-6 text-red-400">
                Your Overview
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workout Plan Card */}
                <div className="bg-gray-700 p-6 rounded-lg border-2 border-white">
                  <h2 className="text-xl font-extrabold mb-6">
                    Current Workout Plan
                  </h2>
                  <div className="border-1 border-gray-400 shadow rounded-lg flex flex-col hover:translate-y-1 transition-all hover:shadow-2xl">
                    <div className="flex justify-center mb-2">
                      <p className="text-lg font-bold">
                        {memberData.activeWorkoutPlan}
                      </p>
                    </div>
                    {memberData.activeWorkoutPlan !== "Not assigned" ? (
                      <button
                        onClick={() => setActiveTab("workout")}
                        className="mt-4 bg-red-300 hover:bg-red-400 text-white font-bold py-2 px-4 rounded hover:cursor-pointer"
                      >
                        View Plan Details
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab("workout")}
                        className="mt-4 bg-red-300 hover:bg-red-400 text-white font-bold py-2 px-4 rounded hover:cursor-pointer"
                      >
                        Browse Plans
                      </button>
                    )}
                  </div>
                </div>

                {/* Diet Plan Card - Now matching Workout Plan styling */}
                <div className="bg-gray-700 p-6 rounded-lg border-2 border-white">
                  <h2 className="text-xl font-extrabold mb-6">
                    Current Diet Plan
                  </h2>
                  <div className="border-1 border-gray-400 shadow rounded-lg flex flex-col hover:translate-y-1 transition-all hover:shadow-2xl">
                    <div className="flex justify-center mb-2">
                      <p className="text-lg font-bold">
                        {memberData.activeDietPlan}
                      </p>
                    </div>
                    {memberData.activeDietPlan !== "Not assigned" ? (
                      <button
                        onClick={() => setActiveTab("diet")}
                        className="mt-4 bg-red-300 hover:bg-red-400 text-white font-bold py-2 px-4 rounded hover:cursor-pointer"
                      >
                        View Plan Details
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab("diet")}
                        className="mt-4 bg-red-300 hover:bg-red-400 text-white font-bold py-2 px-4 rounded hover:cursor-pointer"
                      >
                        Browse Diet Plans
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "workout" && (
            <div>
              {memberData.activeWorkoutPlan === "Not assigned" ? (
                <div>
                  <h1 className="text-3xl font-extrabold mb-6">
                    Select Workout Plan
                  </h1>
                  {availablePlans.workout.length === 0 ? (
                    <div className="text-center py-8 bg-gray-700 rounded-lg">
                      <p className="text-xl text-gray-300 mb-4">
                        No workout plans currently available
                      </p>
                      <p className="text-gray-400">
                        Please check back later or contact your trainer
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availablePlans.workout.map((plan) => (
                        <div
                          key={plan.workout_plan_id}
                          className="bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col"
                        >
                          <div className="p-4 flex-grow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="w-full">
                                <div className="flex justify-between items-center w-full">
                                  <h3 className="text-lg font-bold">
                                    {plan.plan_name}
                                  </h3>
                                  <button
                                    onClick={async () => {
                                      const newPreview =
                                        plan.workout_plan_id === preview
                                          ? false
                                          : plan.workout_plan_id;
                                      setPreview(newPreview);
                                      if (
                                        newPreview &&
                                        !exercises[plan.workout_plan_id]
                                      ) {
                                        await fetchExercises(
                                          plan.workout_plan_id
                                        );
                                      }
                                    }}
                                    className="w-7 h-7 hover:h-8 hover:w-8 hover:bg-white rounded-full hover:transition-all cursor-pointer"
                                  >
                                    <img
                                      src="eye.png"
                                      alt="Toggle preview"
                                      className="w-full h-full"
                                    />
                                  </button>
                                </div>
                                <div className="flex items-center mt-1">
                                  <span className="inline-block bg-blue-500 rounded-full px-2 py-1 text-xs font-semibold mr-2">
                                    {plan.difficulty_level}
                                  </span>
                                  <span className="text-sm text-gray-300">
                                    {plan.duration_weeks} wks •{" "}
                                    {plan.duration_session} min
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  By: {plan.trainer_name}
                                </p>
                              </div>
                            </div>
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-1">
                                Description:
                              </h4>
                              <p className="text-xs text-gray-300 line-clamp-3">
                                {plan.notes || "No description available"}
                              </p>
                            </div>

                            {/* Exercise preview section */}
                            {preview === plan.workout_plan_id && (
                              <div className="mt-4 border-t border-gray-600 pt-4">
                                <h4 className="font-semibold text-sm mb-2">
                                  Exercises:
                                </h4>
                                {loadingExercises ? (
                                  <p className="text-xs text-gray-400">
                                    Loading exercises...
                                  </p>
                                ) : exercises[plan.workout_plan_id] &&
                                  exercises[plan.workout_plan_id].length > 0 ? (
                                  <ul className="space-y-2">
                                    {exercises[plan.workout_plan_id].map(
                                      (exercise, index) => (
                                        <li
                                          key={index}
                                          className="text-xs text-gray-300"
                                        >
                                          <div className="flex justify-between">
                                            <span className="font-medium text-white">
                                              {exercise.ex_name}
                                            </span>
                                            <span>
                                              {exercise.sets}x{exercise.reps}
                                            </span>
                                          </div>
                                          {exercise.notes && (
                                            <p className="text-gray-400 italic">
                                              Notes: {exercise.notes}
                                            </p>
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-gray-400">
                                    No exercises details available
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="p-4 border-t border-gray-600">
                            <button
                              onClick={() =>
                                assignPlan("workout", plan.workout_plan_id)
                              }
                              disabled={isLoading.workout}
                              className={`w-full ${
                                isLoading.workout
                                  ? "bg-gray-600"
                                  : "bg-green-600 hover:bg-green-700"
                              } text-white py-2 px-4 rounded text-sm transition-colors`}
                            >
                              {isLoading.workout
                                ? "Assigning..."
                                : "Select Plan"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-red-400">
                      Your Workout Plan
                    </h1>
                    <div className="relative group">
                      {/* Settings icon - always visible */}
                      <img
                        className="w-9 h-9 hover:rounded-4xl hover:cursor-pointer transition-all hover:h-10 hover:w-10"
                        src="gear.png"
                        alt="settings"
                      />

                      {/* Buttons container - hidden by default, shown on hover */}
                      <div className="absolute right-0 mt-2 w-40 bg-red-400 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-1 ">
                        <div className="py-1 flex flex-col justify-center items-center">
                          <button
                            onClick={() => handleChangePlan("workout")}
                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 hover:cursor-pointer hover:rounded-2xl transition-all hover:w-[80%]"
                          >
                            Change Plan
                          </button>
                          <button
                            onClick={() => handleDeletePlan("workout")}
                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 hover:cursor-pointer hover:rounded-2xl transition-all hover:w-[80%]"
                          >
                            Delete Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <MemberWorkoutPlan memberId={memberData.memberId} />
                </div>
              )}
            </div>
          )}
          {activeTab === "diet" && (
            <div>
              {memberData.activeDietPlan === "Not assigned" ? (
                <div>
                  <h1 className="text-3xl font-extrabold mb-6">
                    Select Diet Plan
                  </h1>
                  {availablePlans.diet.length === 0 ? (
                    <div className="text-center py-8 bg-gray-700 rounded-lg">
                      <p className="text-xl text-gray-300 mb-4">
                        No diet plans currently available
                      </p>
                      <p className="text-gray-400">
                        Please check back later or contact your trainer
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availablePlans.diet.map((plan) => (
                        <div
                          key={plan.diet_plan_id}
                          className="bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col"
                        >
                          {/* Diet plan card content */}
                          <div className="p-4 flex-grow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-lg font-bold">
                                  {plan.plan_name}
                                </h3>
                                <div className="flex items-center mt-1">
                                  <span className="inline-block bg-blue-500 rounded-full px-2 py-1 text-xs font-semibold mr-2">
                                    {plan.difficulty_level}
                                  </span>
                                  <span className="text-sm text-gray-300">
                                    {plan.daily_calories} kcal/day •{" "}
                                    {plan.cuisine_preferences}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  By: {plan.trainer_name}
                                </p>
                              </div>
                            </div>
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-1">
                                Description:
                              </h4>
                              <p className="text-xs text-gray-300 line-clamp-3">
                                {plan.notes || "No description available"}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 border-t border-gray-600">
                            <button
                              onClick={() =>
                                assignPlan("diet", plan.diet_plan_id)
                              }
                              disabled={isLoading.diet}
                              className={`w-full ${
                                isLoading.diet
                                  ? "bg-gray-600"
                                  : "bg-green-600 hover:bg-green-700"
                              } text-white py-2 px-4 rounded text-sm transition-colors`}
                            >
                              {isLoading.diet ? "Assigning..." : "Select Plan"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-red-400">
                      Your Diet Plan
                    </h1>
                    <div className="relative group">
                      {/* Settings icon - always visible */}
                      <img
                        className="w-9 h-9 hover:rounded-4xl hover:cursor-pointer transition-all hover:h-10 hover:w-10"
                        src="gear.png"
                        alt="settings"
                      />

                      {/* Buttons container - hidden by default, shown on hover */}
                      <div className="absolute right-0 mt-2 w-40 bg-red-400 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-1 ">
                        <div className="py-1">
                          <button
                            onClick={() => handleChangePlan("workout")}
                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 hover:cursor-pointer hover:rounded-2xl transition-all hover:w-[80%]"
                          >
                            Change Plan
                          </button>
                          <button
                            onClick={() => handleDeletePlan("diet")}
                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 hover:cursor-pointer hover:rounded-2xl transition-all hover:w-[80%]"
                          >
                            Delete Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <MemberDietPlan memberId={memberData.memberId} />
                </div>
              )}
            </div>
          )}{" "}
        </div>
      </main>
    </div>
  );
};

export default MemberDash;
