import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup"; // keep this only if you have it in a separate file


const MemberRegistration = () => {
  const [showPopup, setShowPopup] = useState(false);
  const[showButton, SetShowButton]=useState(true);
  const[pass, setPass]=useState();
  let [mess,setmess]=useState('')
  const [userInfo, setUserInfo] = useState({ user_id: "", accountType: "" });
  const navigate = useNavigate();

useEffect(() => {
  const user_id = localStorage.getItem("user_id");
  const accountType = localStorage.getItem("account_type");
  const member_id = localStorage.getItem("member_id");
  const memberStatus = localStorage.getItem("memberStatus");

  console.log(member_id);
  console.log("member status", memberStatus);

  let shouldPass = false;

  if (memberStatus === 'NEW_MEMBER') {
    setmess('Please fill out the member registration form before continuing.');
    SetShowButton(true);
    setShowPopup(true);
    setPass(true);
    shouldPass = true;
  } else {
    setPass(false);
  }

  if (!shouldPass) {
    setShowPopup(true);
    SetShowButton(false);
    setmess('Please Log in First');
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } else {
    setUserInfo({ user_id, accountType });
  }
}, [navigate]);


  const onClose = () => {
    setShowPopup(false);
  };
  

  const [formData, setFormData] = useState({
    username: "",
    height: "",
    current_weight: "",
    target_weight: "",
    fitness_level: 5,
    primary_goal: "maintenance",
    medical_conditions: "",
    dietary_preferences: "",
    member_plan:''
    
  });

  const fitnessLevels = [
    { 1: "Beginner" },
    { 2: "Novice" },
    { 3: "Intermediate" },
    { 4: "Advanced" },
    { 5: "Athlete" },
  ];

    const plans = [
    { value: "Basic", label: "Basic" },
    { value: "Powerpro", label: "PowerPro" }
  ];

  const goals = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "endurance", label: "Endurance" },
    { value: "maintenance", label: "Maintenance" },
  ];

  const [error, setError] = useState();

  const validateWeight = (name, value) => {
    const numValue = value;
    if (numValue <= 0) return "Weight must be positive";
    if (numValue < 20) return "Weight seems too low";
    if (numValue > 300) return "Weight seems too high";
    return "";
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name == "current_weight" || name == "target_weight") {
      setFormData((prev) => ({
        ...prev,
        [name]: validateWeight(name, value),
      }));
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [ShowInFeet, SetShowInFeet] = useState(false);

  const handleCmToFeet = (cm) => {
    if (!cm) return "";
    const feet = cm / 30.48;
    return feet.toFixed(1);
  };

  const toggleUnit = (e) => {
    e.preventDefault();
    SetShowInFeet(!ShowInFeet);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/MemberRegistration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          username: localStorage.getItem("username"),
          height: parseFloat(formData.height),
          current_weight: parseFloat(formData.current_weight),
          target_weight: parseFloat(formData.target_weight),
          fitness_level: parseInt(formData.fitness_level),
          member_plan: formData.member_plan
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      alert("Member registration complete!");

      if ((data.message = "Member Registered Succesfully")) {
        navigate("/MemberDash");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {showPopup && (
        <Popup
          onClose={() => setShowPopup(false)}
          mes={mess}
          showButton
        />
      )}

      <h2 className="text-2xl font-bold mb-6 text-center">
        Member Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Height */}
        <div className="flex gap-2 items-center">
          <label className="block text-sm font-medium text-gray-700">
            Height {ShowInFeet ? "(feet)" : "(cm)"}
          </label>
          <input
            type="number"
            step="0.1"
            name="height"
            value={
              ShowInFeet ? handleCmToFeet(formData.height) : formData.height
            }
            onChange={(e) => {
              const value = ShowInFeet
                ? parseFloat(e.target.value) * 30.48
                : e.target.value;
              setFormData((prev) => ({ ...prev, height: value }));
            }}
            className="mt-1 block w-full h-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            min={ShowInFeet ? "3" : "100"}
            max={ShowInFeet ? "8" : "250"}
          />

          <button
            className="ml-2 flex px-4 py-3 bg-blue-500 text-white rounded-md"
            onClick={toggleUnit}
          >
            {ShowInFeet ? "cm" : "Feet"}
          </button>
        </div>

        {/* Current Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Weight (kg)
          </label>
          <input
            type="number"
            step="0.01"
            name="current_weight"
            value={formData.current_weight}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            min="20"
            max="200"
          />
        </div>

        {/* Target Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Target Weight (kg)
          </label>
          <input
            type="number"
            step="0.01"
            name="target_weight"
            value={formData.target_weight}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            min="20"
            max="200"
          />
        </div>

        {/* Fitness Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fitness Level (1-5)
          </label>
          <select
            name="fitness_level"
            value={formData.fitness_level}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {fitnessLevels.map((obj) => {
              const [index, value] = Object.entries(obj)[0];

              return (
                <option key={index} value={index}>
                  {`${index}- ${value}`}
                </option>
              );
            })}
          </select>
        </div>

          {/* Updated Plan Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Choose Plan
        </label>
        <select
          name="member_plan" // Corrected name attribute
          value={formData.member_plan}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {plans.map((plan) => (
            <option key={plan.value} value={plan.value}>
              {plan.label}
            </option>
          ))}
        </select>
      </div>

        {/* Primary Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primary Goal
          </label>
          <div className="mt-2 space-y-2">
            {goals.map((goal) => (
              <div key={goal.value} className="flex items-center">
                <input
                  type="radio"
                  id={goal.value}
                  name="primary_goal"
                  value={goal.value}
                  checked={formData.primary_goal === goal.value}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor={goal.value}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {goal.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Medical Conditions (if any)
          </label>
          <textarea
            name="medical_conditions"
            value={formData.medical_conditions}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Dietary Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dietary Preferences
          </label>
          <input
            type="text"
            name="dietary_preferences"
            value={formData.dietary_preferences}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberRegistration;
