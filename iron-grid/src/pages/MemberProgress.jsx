import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MemberProgress = ({ memberId }) => {
  const [progressEntries, setProgressEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    bodyFatPercentage: "",
    muscleMass: "",
    measurements: {
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
    },
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleDeleteEntry = async (entryId) => {
    if (!entryId) {
      setMessage("Invalid entry ID");
      setShowPopup(true);
      return;
    }

    if (
      !window.confirm("Are you sure you want to delete this progress entry?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/progress/${entryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setMessage("Entry deleted successfully");
        // Refresh the entries list
        setProgressEntries((prev) =>
          prev.filter((entry) => entry.entry_id !== entryId)
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      setMessage(error.message);
    } finally {
      setShowPopup(true);
    }
  };

  useEffect(() => {
    const fetchProgressEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/progress/${memberId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);
          setProgressEntries(data.entries || []);
        } else {
          throw new Error("Failed to fetch progress entries");
        }
      } catch (error) {
        console.error("Error fetching progress entries:", error);
        setMessage(error.message);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchProgressEntries();
    }
  }, [memberId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name in formData.measurements) {
      setFormData((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          member_id: memberId,
          weight: parseFloat(formData.weight),
          body_fat_percentage: parseFloat(formData.bodyFatPercentage),
          muscle_mass: parseFloat(formData.muscleMass),
          measurements: formData.measurements,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Progress entry added successfully!");
        setProgressEntries((prev) => [data.entry, ...prev]);
        setShowForm(false);
        setFormData({
          weight: "",
          bodyFatPercentage: "",
          muscleMass: "",
          measurements: {
            chest: "",
            waist: "",
            hips: "",
            arms: "",
            thighs: "",
          },
          notes: "",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add progress entry");
      }
    } catch (error) {
      console.error("Error adding progress entry:", error);
      setMessage(error.message);
    } finally {
      setIsLoading(false);
      setShowPopup(true);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-red-400">
          Progress Tracking
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-400 hover:bg-red-300 text-white font-bold py-2 px-4 rounded hover:cursor-pointer"
        >
          {showForm ? "Cancel" : "Add New Entry"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Add Progress Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="bodyFatPercentage"
                  value={formData.bodyFatPercentage}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Muscle Mass (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="muscleMass"
                  value={formData.muscleMass}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2 mt-4">
              Measurements (cm)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chest</label>
                <input
                  type="number"
                  step="0.1"
                  name="chest"
                  value={formData.measurements.chest}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Waist</label>
                <input
                  type="number"
                  step="0.1"
                  name="waist"
                  value={formData.measurements.waist}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hips</label>
                <input
                  type="number"
                  step="0.1"
                  name="hips"
                  value={formData.measurements.hips}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Arms</label>
                <input
                  type="number"
                  step="0.1"
                  name="arms"
                  value={formData.measurements.arms}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thighs</label>
                <input
                  type="number"
                  step="0.1"
                  name="thighs"
                  value={formData.measurements.thighs}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
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
              {isLoading ? "Saving..." : "Save Entry"}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Progress History</h2>
        {progressEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Weight (kg)</th>
                  <th className="px-4 py-2 text-left">Body Fat (%)</th>
                  <th className="px-4 py-2 text-left">Muscle (kg)</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                  <th className="px-4 py-2 text-left">Actions</th>{" "}
                  {/* Added Actions column */}
                </tr>
              </thead>
              <tbody>
                {progressEntries.map((entry) => (
                  <tr
                    key={entry?.entry_id || Math.random()}
                    className="border-t border-gray-600 hover:bg-gray-600"
                  >
                    <td className="px-4 py-2">
                      {entry?.entry_date ? formatDate(entry.entry_date) : "N/A"}
                    </td>
                    <td className="px-4 py-2">{entry?.weight || "N/A"}</td>
                    <td className="px-4 py-2">
                      {entry?.body_fat_percentage || "N/A"}
                    </td>
                    <td className="px-4 py-2">{entry?.muscle_mass || "N/A"}</td>
                    <td className="px-4 py-2 max-w-xs truncate">
                      {entry?.notes || "No notes"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteEntry(entry.entry_id)}
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
        ) : (
          <p className="text-gray-400">
            No progress entries yet. Add your first entry to track your
            progress!
          </p>
        )}
      </div>

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

export default MemberProgress;
