import { Link } from "react-router-dom";

const OwnerPage = () => {
  return (
    <main style={{ padding: 24 }}>
      <h1>Owner Dashboard</h1>
      <ul style={{ textAlign: "left", marginTop: 12 }}>
        <li>
          <Link className="text-blue-600 underline" to="/owner/pets">
            My Pets
          </Link>
        </li>
        <li>Medical History (read-only)</li>
        <li>Request Appointment</li>
        <li>My Appointments</li>
      </ul>
      <a className="text-blue-600 underline" href="/owner/profile">
        Edit my profile
      </a>
    </main>
  );
};
export default OwnerPage;
