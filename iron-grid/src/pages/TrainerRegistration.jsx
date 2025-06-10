import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";
const TrainerRegistration = () => {
  function onClose() {
    setShowPopup = !showPopup;
  }

  let [showPopup, setShowPopup] = useState(true);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: localStorage.getItem("username"),
    certification: "",
    specialization: "",
    years_experience: "",
    hourly_rate: "",
    bio: "",
    is_admin: true,
  });

  const specializations = [
    "Strength Training",
    "Weight Loss",
    "Bodybuilding",
    "Yoga",
    "Rehabilitation",
    "Nutrition",
  ];

  const certifications = [
    "NASM Certified Personal Trainer",
    "ACE Personal Trainer",
    "ACSM Certified Exercise Physiologist",
    "ISSA Certified Fitness Trainer",
    "NSCA Certified Strength and Conditioning Specialist",
    "Other",
    "None",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/TrainerRegistration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Trainer registration successful!");

      if (data.success === true) {
        navigate("/TrainerDash");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {showPopup && (
        <Popup
          onClose={() => setShowPopup(false)}
          mes={
            "Please fill out the trainer registration form before continuing."
          }
        />
      )}
      <h2 className="text-2xl font-bold mb-6 text-center">
        Trainer Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Certification */}
        <div>
          <label
            htmlFor="certification"
            className="block text-sm font-medium text-gray-700"
          >
            Certification
          </label>
          <select
            id="certification"
            name="certification"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.certification}
            onChange={handleChange}
          >
            <option value="">Select your certification</option>
            {certifications.map((cert) => (
              <option key={cert} value={cert}>
                {cert}
              </option>
            ))}
          </select>
        </div>

        {/* Specialization */}
        <div>
          <label
            htmlFor="specialization"
            className="block text-sm font-medium text-gray-700"
          >
            Specialization
          </label>
          <select
            id="specialization"
            name="specialization"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.specialization}
            onChange={handleChange}
          >
            <option value="">Select your specialization</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Years of Experience */}
        <div>
          <label
            htmlFor="years_experience"
            className="block text-sm font-medium text-gray-700"
          >
            Years of Experience
          </label>
          <input
            id="years_experience"
            name="years_experience"
            type="number"
            min="0"
            max="50"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.years_experience}
            onChange={handleChange}
          />
        </div>

        {/* Hourly Rate */}
        <div>
          <label
            htmlFor="hourly_rate"
            className="block text-sm font-medium text-gray-700"
          >
            Hourly Rate ($)
          </label>
          <input
            id="hourly_rate"
            name="hourly_rate"
            type="number"
            step="0.01"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.hourly_rate}
            onChange={handleChange}
          />
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        {/* Admin Checkbox */}
        <div className="flex items-center">
          <input
            id="is_admin"
            name="is_admin"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={formData.is_admin}
            onChange={handleChange}
          />
          <label
            htmlFor="is_admin"
            className="ml-2 block text-sm text-gray-900"
          >
            Admin Privileges
          </label>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Trainer Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainerRegistration;
