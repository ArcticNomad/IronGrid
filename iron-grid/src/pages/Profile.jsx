import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          throw new Error("Please login to view your profile");
        }

        const response = await fetch(
          `/profile?user_id=${encodeURIComponent(user_id)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to load profile");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("login")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!profile) return <div className="p-8">No profile data available</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-extrabold mb-10 text-white">User Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Full Name</h3>
          <p className="text-2xl font-bold">{`${profile.first_name} ${profile.last_name}`}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Account Type</h3>
          <p className="text-2xl font-bold">{profile.account_type}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Member Since</h3>
          <p className="text-2xl font-bold">
            {formatDate(profile.registration_date)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <div className="space-y-3">
            <p>
              <strong>Username:</strong> {profile.username}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Gender:</strong> {profile.gender || "Not specified"}
            </p>
          </div>
        </div>

        {/* Role-Specific Information */}
        {profile.account_type === "trainer" && profile.trainer_info && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Trainer Details</h2>
            <div className="space-y-3">
              <p>
                <strong>Specialization:</strong>{" "}
                {profile.trainer_info.specialization}
              </p>
              <p>
                <strong>Certification:</strong>{" "}
                {profile.trainer_info.certification}
              </p>
              <p>
                <strong>Experience:</strong>{" "}
                {profile.trainer_info.years_of_experience} years
              </p>
              <p>
                <strong>Hourly Rate:</strong> $
                {profile.trainer_info.hourly_rate}
              </p>
            </div>
          </div>
        )}

        {profile.account_type === "member" && (
          <>
            {profile.member_info && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Member Details</h2>
                <div className="space-y-3">
                  <p>
                    <strong>Fitness Goals:</strong>{" "}
                    {profile.member_info.fitness_goals}
                  </p>
                  <p>
                    <strong>Current Weight:</strong>{" "}
                    {profile.member_info.current_weight} kg
                  </p>
                  <p>
                    <strong>Target Weight:</strong>{" "}
                    {profile.member_info.target_weight} kg
                  </p>
                  <p>
                    <strong>Height:</strong> {profile.member_info.height} cm
                  </p>
                </div>
              </div>
            )}

            {profile.active_plans && profile.active_plans.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Active Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.active_plans.map((plan) => (
                    <div key={plan.plan_id} className="border p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">
                        {plan.plan_name}
                      </h3>
                      <p>
                        <strong>Status:</strong> {plan.status}
                      </p>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {formatDate(plan.start_date)}
                      </p>
                      <p>
                        <strong>End Date:</strong> {formatDate(plan.end_date)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
