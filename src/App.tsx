import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/login/Login";
import Dashboard from "./pages/recruiter/Dashboard";
import ThemeEditor from "./pages/recruiter/ThemeEditor";
import SectionEditor from "./pages/recruiter/SectionEditor";
import ManageJobs from "./pages/recruiter/ManageJobs";
import PreviewPage from "./pages/recruiter/PreviewPage";
import CareersPage from "./pages/careers/CareersPage";
import JobDetails from "./pages/careers/JobDetails";

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, company } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            Careers Builder
          </Link>
          <nav className="flex space-x-4 items-center">
            {isAuthenticated ? (
              <>
                <span className="hidden lg:block text-sm text-gray-600">
                  {company?.name}
                </span>

                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 hidden lg:block "
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className=" bg-red-600 text-white   cursor-pointer inline-block px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                Recruiter Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected recruiter routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:companySlug/edit"
            element={
              <ProtectedRoute>
                <SectionEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:companySlug/theme"
            element={
              <ProtectedRoute>
                <ThemeEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:companySlug/jobs"
            element={
              <ProtectedRoute>
                <ManageJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:companySlug/preview"
            element={
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            }
          />

          {/* Public routes */}
          <Route path="/:companySlug/careers" element={<CareersPage />} />
          <Route path="/:companySlug/job/:jobSlug" element={<JobDetails />} />

          <Route
            path="*"
            element={
              <div className="text-center py-10">404 - Page Not Found</div>
            }
          />
        </Routes>
      </main>

      <footer className="bg-gray-100 border-t py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Careers Page Builder. All rights
        reserved.
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
