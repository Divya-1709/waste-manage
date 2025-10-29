import { useEffect, useState } from "react";
import axios from "axios";

export default function TrackStatus() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace this with actual user email (from auth context or localStorage)
  const userEmail = localStorage.getItem("userEmail"); 

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pickups", {
          params: { email: userEmail },
        });
        setPickups(res.data.data);
      } catch (err) {
        console.error("Error fetching pickups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPickups();
  }, [userEmail]);

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading...</div>;

  return (
    <div className="p-10 bg-blue-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6">Track Your Pickups</h2>

      {pickups.length === 0 ? (
        <p className="text-center text-gray-600">No pickup requests yet.</p>
      ) : (
        <div className="space-y-6">
          {pickups.map((pickup, index) => (
            <div key={index} className="bg-white shadow-md p-6 rounded-2xl border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold">{pickup.wasteType}</h3>
              <p className="text-gray-700">Address: {pickup.address}</p>
              <p className="text-gray-700">Status: 
                <span className={`ml-2 font-medium ${
                  pickup.status === "Completed" ? "text-green-600" : 
                  pickup.status === "In Progress" ? "text-yellow-500" : "text-gray-600"
                }`}>
                  {pickup.status}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Requested on: {new Date(pickup.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
