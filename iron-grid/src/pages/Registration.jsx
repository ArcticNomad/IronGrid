import { useNavigate } from "react-router-dom";
import MemberRegistration from "./MemberRegister";
import { useState } from "react";
import { Link } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();

  // Gender options
  const genderOptions = [
    { id: "male", value: "Male", label: "Male" },
    { id: "female", value: "Female", label: "Female" },
  ];

  // User type options
  const userTypes = [
    { id: "member", value: "member" },
    { id: "trainer", value: "trainer" },
  ];

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    account_type: "member",
    date_of_birth: "",
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // In your Registration component
  const adminAccessCode = "GYM123"; // Temporary - should be server-side validated
  const [showTrainerOption, setShowTrainerOption] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  const verifyAccessCode = () => {
    if (accessCode === adminAccessCode) {
      setShowTrainerOption(true);
    }
  };

  // Handle radio button selection for gender
  const handleGenderChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      gender: value.target.value,
    }));
  };
  const handleDate = (value) => {
    setFormData((prev) => ({
      ...prev,
      date_of_birth: value.target.value,
    }));
  };
  // Handle user type selection
  const handleUserTypeClick = (value) => {
    setFormData((prev) => ({
      ...prev,
      account_type: value,
    }));
  };

  // Form submission

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      console.log("trying to submit data to backend "); // test

      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // Parse response first

      if (!response.ok) {
        //       if (data.error === 'USER_EXISTS') {
        //   alert(data.message || 'This user already exists');
        // }
        throw new Error(data.message || "Registration failed");
      }

      alert(`Registration Successfull !`);

      console.log("Registration successful", data);
      // Redirect or show success message here

      if (formData.account_type == "member") {
        navigate("/MemberRegistration");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed:", error.message);
      alert(`Registration failed: ${error.message}`);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Gender Selection */}
            <div>
              <h2 className="block text-sm font-medium text-gray-700">
                Gender
              </h2>
              <div className="mt-2 space-y-2">
                {genderOptions.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="radio"
                      id={option.id}
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      required
                      onChange={handleGenderChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor={option.id}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {/* Date Selection */}
            <div>
              <h1 className="block text-sm font-medium text-gray-700">
                Date Of Birth
              </h1>
              <input
                type="date"
                name="date_of_birth"
                id="date_of_birth"
                required
                value={formData.date_of_birth}
                onChange={handleDate}
              />
            </div>
            {/* User Type Selection */}

            {!showTrainerOption && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Trainer Access Code
                </label>
                <div className="flex">
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={verifyAccessCode}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {showTrainerOption && (
              <div className="mt-4">
                <h3 className="block text-sm font-medium text-gray-700">
                  Account Type
                </h3>
                <div className="flex space-x-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleUserTypeClick("member")}
                    className={`px-12 py-4 border rounded-md ${
                      formData.account_type === "member"
                        ? "bg-blue-100 border-blue-500"
                        : ""
                    }`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserTypeClick("trainer")}
                    className={`px-12 py-4 border rounded-md ${
                      formData.account_type === "trainer"
                        ? "bg-blue-100 border-blue-500"
                        : ""
                    }`}
                  >
                    Trainer
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;
