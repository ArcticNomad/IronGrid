import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MemberWorkoutSession = ({ memberId }) => {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [activePlans, setActivePlans] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [sessionExercises, setSessionExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    actual_sets: "",
    actual_reps: "",
    weight_used: "",
    notes: "",
  });

  const [formData, setFormData] = useState({
    workout_plan_name: "",
    start_time: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  const [endSessionForm, setEndSessionForm] = useState({
    end_time: new Date().toISOString().slice(0, 16),
    total_calories: "",
    session_rating: "",
    completed_percentage: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!memberId) return;

      setIsLoading(true);
      try {
        // Fetch workout sessions
        const sessionResponse = await fetch(
          `/api/workout-sessions/${memberId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!sessionResponse.ok) {
          throw new Error("Failed to fetch workout sessions");
        }
        const sessionData = await sessionResponse.json();
        setSessions(sessionData.sessions || []);

        // Fetch active workout plans
        const planResponse = await fetch(
          `/api/member/${memberId}/workout-plans`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!planResponse.ok) {
          throw new Error("Failed to fetch workout plans");
        }
        const planData = await planResponse.json();
        setActivePlans(planData.plans || []);

        // Fetch all exercises for dropdown
        const exerciseResponse = await fetch("/api/exercises", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!exerciseResponse.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const exerciseData = await exerciseResponse.json();
        console.log("exercise data", exerciseData);
        setAllExercises(exerciseData.exercises || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [memberId]);

  const fetchSessionExercises = async (sessionId) => {
    try {
      const response = await fetch(
        `/api/workout-sessions/${sessionId}/exercises`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch session exercises");
      }
      const data = await response.json();
      setSessionExercises(data.exercises || []);
    } catch (error) {
      console.error("Error fetching session exercises:", error);
      setMessage(error.message);
      setShowPopup(true);
    }
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setExerciseForm({
      actual_sets: exercise.default_sets || "",
      actual_reps: exercise.default_reps || "",
      weight_used: "",
      notes: "",
    });
  };

  const handleExerciseFormChange = (e) => {
    const { name, value } = e.target;
    setExerciseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workout-sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete session");
      }

      setMessage("Session deleted successfully!");
      setSessions((prev) =>
        prev.filter((session) => session.session_id !== sessionId)
      );
      if (selectedSession?.session_id === sessionId) {
        setSelectedSession(null);
        setShowSessionDetails(false);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      setMessage(error.message);
    } finally {
      setIsLoading(false);
      setShowPopup(true);
    }
  };

  const handleSubmitExercise = async (e) => {
    e.preventDefault();
    if (!selectedSession || !selectedExercise) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/workout-sessions/${selectedSession.session_id}/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            exercise_id: selectedExercise.exercise_id,
            ...exerciseForm,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add exercise");
      }

      setMessage("Exercise added to session successfully!");
      await fetchSessionExercises(selectedSession.session_id);
      setShowAddExerciseModal(false);
      setSelectedExercise(null);
    } catch (error) {
      console.error("Error adding exercise:", error);
      setMessage(error.message);
    } finally {
      setIsLoading(false);
      setShowPopup(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEndSessionInputChange = (e) => {
    const { name, value } = e.target;
    setEndSessionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/workout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          member_id: memberId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start session");
      }

      const data = await response.json();
      setMessage("Workout session started successfully!");
      setSessions((prev) => [data.session, ...prev]);
      setShowForm(false);
      setFormData({
        workout_plan_name: "",
        start_time: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    } catch (error) {
      console.error("Error starting session:", error);
      setMessage(error.message);
    } finally {
      setIsLoading(false);
      setShowPopup(true);
    }
  };

  const handleViewSessionDetails = async (session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
    await fetchSessionExercises(session.session_id);
  };

  const handleEndSession = (session) => {
    setSelectedSession(session);
    setEndSessionForm({
      end_time: new Date().toISOString().slice(0, 16),
      total_calories: "",
      session_rating: "",
      completed_percentage: "",
      notes: session.notes || "",
    });
  };

  const handleSubmitEndSession = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/workout-sessions/${selectedSession.session_id}/end`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(endSessionForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to end session");
      }

      const data = await response.json();
      setMessage("Session ended successfully!");
      setSessions((prev) =>
        prev.map((session) =>
          session.session_id === selectedSession.session_id
            ? data.session
            : session
        )
      );
      setSelectedSession(null);
    } catch (error) {
      console.error("Error ending session:", error);
      setMessage(error.message);
    } finally {
      setIsLoading(false);
      setShowPopup(true);
    }
  };

  const handleAddExercise = (sessionId) => {
    const foundSession = sessions.find((s) => s.session_id === sessionId);
    if (!foundSession) return;
    console.log(foundSession);
    setSelectedSession(foundSession);
    setShowAddExerciseModal(true);
    setSelectedExercise(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const closeModal = () => {
    setShowSessionDetails(false);
    setSelectedSession(null);
    setShowAddExerciseModal(false);
    setSelectedExercise(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-red-400">
          Workout Sessions
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? "Cancel" : "Start New Session"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Start New Workout Session</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Workout Plan
                </label>
                <select
                  name="workout_plan_name"
                  value={formData.workout_plan_name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                >
                  <option value="">Select a plan (optional)</option>
                  {activePlans.map((plan) => (
                    <option key={plan.plan_name} value={plan.plan_name}>
                      {plan.plan_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                rows="3"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
            >
              {isLoading ? "Starting..." : "Start Session"}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Session History</h2>
        {isLoading && sessions.length === 0 ? (
          <p>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-400">
            No workout sessions yet. Start your first session to begin tracking!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Start Time</th>
                  <th className="px-4 py-2 text-left">Duration</th>
                  <th className="px-4 py-2 text-left">Plan</th>
                  <th className="px-4 py-2 text-left">Calories</th>
                  <th className="px-4 py-2 text-left">Completed</th>
                  <th className="px-4 py-2 text-left">Rating</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.session_id}
                    className="border-t border-gray-600 hover:bg-gray-600"
                  >
                    <td className="px-4 py-2">
                      {formatDate(session.start_time)}
                    </td>
                    <td className="px-4 py-2">
                      {calculateDuration(session.start_time, session.end_time)}
                    </td>
                    <td className="px-4 py-2">
                      {session.plan_name || "No Plan"}
                    </td>
                    <td className="px-4 py-2">
                      {session.total_calories || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {session.completed_percentage
                        ? `${session.completed_percentage}%`
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {session.session_rating
                        ? `${session.session_rating}/10`
                        : "-"}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleViewSessionDetails(session)}
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        Details
                      </button>
                      {!session.end_time && (
                        <button
                          onClick={() => handleEndSession(session)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="End session"
                        >
                          End
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSession(session.session_id)}
                        className="text-red-400 hover:text-red-600 transition-colors hover:cursor-pointer"
                        title="Delete entry"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">
                Session Details - {formatDate(selectedSession.start_time)}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Session Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Plan:</span>{" "}
                    {selectedSession.plan_name || "No Plan"}
                  </p>
                  <p>
                    <span className="font-medium">Start Time:</span>{" "}
                    {formatDate(selectedSession.start_time)}
                  </p>
                  <p>
                    <span className="font-medium">End Time:</span>{" "}
                    {formatDate(selectedSession.end_time) || "In Progress"}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {calculateDuration(
                      selectedSession.start_time,
                      selectedSession.end_time
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Calories Burned:</span>{" "}
                    {selectedSession.total_calories || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Completed:</span>{" "}
                    {selectedSession.completed_percentage
                      ? `${selectedSession.completed_percentage}%`
                      : "-"}
                  </p>
                  <p>
                    <span className="font-medium">Rating:</span>{" "}
                    {selectedSession.session_rating
                      ? `${selectedSession.session_rating}/10`
                      : "-"}
                  </p>
                </div>
                {selectedSession.notes && (
                  <div className="mt-4">
                    <h4 className="font-medium">Notes:</h4>
                    <p className="bg-gray-700 p-2 rounded">
                      {selectedSession.notes}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Exercises</h3>
                  {!selectedSession.end_time && (
                    <button
                      onClick={() =>
                        handleAddExercise(selectedSession.session_id)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded"
                    >
                      Add Exercise
                    </button>
                  )}
                </div>

                {sessionExercises.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700 rounded-lg">
                      <thead className="bg-gray-600">
                        <tr>
                          <th className="px-3 py-2 text-left">Exercise</th>
                          <th className="px-3 py-2 text-left">Sets</th>
                          <th className="px-3 py-2 text-left">Reps</th>
                          <th className="px-3 py-2 text-left">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionExercises.map((exercise) => (
                          <tr
                            key={exercise.exercise_id}
                            className="border-t border-gray-600"
                          >
                            <td className="px-3 py-2">
                              {exercise.exercise_name}
                            </td>
                            <td className="px-3 py-2">
                              {exercise.actual_sets}
                            </td>
                            <td className="px-3 py-2">
                              {exercise.actual_reps}
                            </td>
                            <td className="px-3 py-2">
                              {exercise.weight_used} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No exercises recorded for this session.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddExerciseModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Add Exercise to Session</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            {!selectedExercise ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allExercises.map((exercise) => (
                  <div
                    key={exercise.exercise_id}
                    onClick={() => handleExerciseSelect(exercise)}
                    className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors border border-gray-600"
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-400">
                          {exercise.exercise_name}
                        </h3>
                        <div className="mt-2 text-sm text-gray-300 space-y-1">
                          <div className="flex items-center">
                            <span className="font-medium w-24">Category:</span>
                            <span className="capitalize">
                              {exercise.category}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-24">Equipment:</span>
                            <span>{exercise.equipment_needed || "None"}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium w-24">
                              Difficulty:
                            </span>
                            <span className="capitalize">
                              {exercise.difficulty}
                            </span>
                          </div>
                          {exercise.default_sets && exercise.default_reps && (
                            <div className="flex items-center">
                              <span className="font-medium w-24">
                                Suggested:
                              </span>
                              <span>
                                {exercise.default_sets}x{exercise.default_reps}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {exercise.muscle_group && (
                        <span className="bg-red-600 text-xs text-white px-2 py-1 rounded-full self-start">
                          {exercise.muscle_group}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="mr-2 text-blue-400 hover:text-blue-600"
                  >
                    ← Back to exercises
                  </button>
                  <h3 className="text-xl font-semibold">
                    {selectedExercise.exercise_name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-gray-700 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">Exercise Details</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Category:</span>{" "}
                          {selectedExercise.category}
                        </p>
                        <p>
                          <span className="font-medium">Equipment:</span>{" "}
                          {selectedExercise.equipment_needed || "None"}
                        </p>
                        <p>
                          <span className="font-medium">Difficulty:</span>{" "}
                          {selectedExercise.difficulty}
                        </p>
                        {selectedExercise.default_sets &&
                          selectedExercise.default_reps && (
                            <p>
                              <span className="font-medium">
                                Suggested Sets/Reps:
                              </span>{" "}
                              {selectedExercise.default_sets}x
                              {selectedExercise.default_reps}
                            </p>
                          )}
                        {selectedExercise.description && (
                          <p>
                            <span className="font-medium">Description:</span>{" "}
                            {selectedExercise.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <form onSubmit={handleSubmitExercise}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Sets
                            </label>
                            <input
                              type="number"
                              name="actual_sets"
                              value={exerciseForm.actual_sets}
                              onChange={handleExerciseFormChange}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Reps
                            </label>
                            <input
                              type="number"
                              name="actual_reps"
                              value={exerciseForm.actual_reps}
                              onChange={handleExerciseFormChange}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                              min="1"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            name="weight_used"
                            value={exerciseForm.weight_used}
                            onChange={handleExerciseFormChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                            min="0"
                            step="0.5"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Notes
                          </label>
                          <textarea
                            name="notes"
                            value={exerciseForm.notes}
                            onChange={handleExerciseFormChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                            rows="2"
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setSelectedExercise(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
                        >
                          {isLoading ? "Adding..." : "Add Exercise"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* End Session Modal */}
      {selectedSession && !selectedSession.end_time && !showSessionDetails && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">End Workout Session</h2>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitEndSession}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={endSessionForm.end_time}
                    onChange={handleEndSessionInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Calories Burned
                    </label>
                    <input
                      type="number"
                      name="total_calories"
                      value={endSessionForm.total_calories}
                      onChange={handleEndSessionInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rating (1-10)
                    </label>
                    <input
                      type="number"
                      name="session_rating"
                      value={endSessionForm.session_rating}
                      onChange={handleEndSessionInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Completed %
                  </label>
                  <input
                    type="number"
                    name="completed_percentage"
                    value={endSessionForm.completed_percentage}
                    onChange={handleEndSessionInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Session Notes
                  </label>
                  <textarea
                    name="notes"
                    value={endSessionForm.notes}
                    onChange={handleEndSessionInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                    rows="3"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
                >
                  {isLoading ? "Ending..." : "End Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default MemberWorkoutSession;
