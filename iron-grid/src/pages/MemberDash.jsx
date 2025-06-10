// Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";

export default function MemberDash() {
  const [showPopup, setShowPopup] = useState(false);
  let [mess,setmess]=useState('')
  const[showButton, SetShowButton]=useState(true);
  const [userInfo, setUserInfo] = useState({ user_id: "", accountType: "" });
  const navigate = useNavigate();

  useEffect(() => {
      const user_id = localStorage.getItem("user_id");
      const accountType = localStorage.getItem("account_type");
  
      if (!user_id) {
        setShowPopup(true); // Show popup
        SetShowButton(false);
        setmess('Please Log in First')
        setTimeout(() => {
          navigate("/login");
        }, 2000); // navigate after 1.5s
      } else {
        setUserInfo({ user_id, accountType });
        setmess('Please fill out the member registration form before continuing.');
        SetShowButton(true);
      }
    }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="p-6">
         {showPopup && (
                <Popup
                  onClose={() => setShowPopup(false)}
                  mes={mess}
                  SetShowButton
                />
              )}
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
        <p className="mb-2">
          <strong>User ID:</strong> {userInfo.user_id}
        </p>
        <p className="mb-4">
          <strong>Account Type:</strong> {userInfo.accountType}
        </p>

        {userInfo.accountType === "member" && (
          <div className="p-4 bg-green-100 rounded">🏋️ Member-specific features here</div>
        )}

        {userInfo.accountType === "trainer" && (
          <div className="p-4 bg-blue-100 rounded">📚 Trainer-specific features here</div>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
