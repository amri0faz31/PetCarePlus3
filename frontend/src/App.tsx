import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage.tsx";
import RegistrationPage from "./features/auth/RegistrationPage.tsx";

import OwnerPage from "./features/owner/OwnerPage.tsx";
import VetPage from "./features/vet/VetPage.tsx";
import AdminDashboard from "./features/admin/AdminDashboard.tsx"; // updated import
import Unauthorized from "./pages/Unauthorized.tsx";
import NotFound from "./pages/NotFound.tsx";
import RequireAdmin from "./features/auth/RequireAdmin";
import RequireAuth from "./features/auth/RequireAuth";
import RequireRole from "./features/auth/RequireRole";
import AdminAddVetPage from "./features/admin/AdminAddVetPage.tsx";
import AdminVetListPage from "./features/admin/AdminVetListPage.tsx";
import AdminVetDetailsPage from "./features/admin/AdminVetDetailsPage.tsx";
import AdminUsersPage from "./features/admin/AdminUsersPage";
import AdminUserEditPage from "./features/admin/AdminUserEditPage";
import OwnerProfilePage from "./features/owner/OwnerProfilePage";
import { AdminPetsPage } from "./features/admin/pages";
import { OwnerPetsPage } from "./features/owner/pages";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Protected role-based routes */}
        <Route
          path="/owner"
          element={
            <RequireAuth>
              <RequireRole roles={["OWNER", "ADMIN", "VET"]}>
                <OwnerPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/vet"
          element={
            <RequireAuth>
              <RequireRole roles={["VET", "ADMIN"]}>
                <VetPage />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/pets"
          element={
            <RequireAdmin>
              <AdminPetsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/vets/new"
          element={
            <RequireAdmin>
              <AdminAddVetPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/vets"
          element={
            <RequireAdmin>
              <AdminVetListPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/vets/:id"
          element={
            <RequireAdmin>
              <AdminVetDetailsPage />
            </RequireAdmin>
          }
        />

        {/* Owner routes */}
        <Route
          path="/owner/pets"
          element={
            <RequireAuth>
              <RequireRole roles={["OWNER", "ADMIN"]}>
                <OwnerPetsPage />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Misc */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/:id" element={<AdminUserEditPage />} />
        <Route path="/owner/profile" element={<OwnerProfilePage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
