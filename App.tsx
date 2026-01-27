import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Members } from "./pages/Members";
import { Messaging } from "./pages/Messaging";
import { Defaulters } from "./pages/Defaulters";
import { Login } from "./pages/Login";
import { AuthInitializer } from "./components/AuthInitializer";
import { useAppSelector } from "./store/hooks";

const App: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <AuthInitializer>
      {!isAuthenticated ? (
        <Login />
      ) : (

        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/defaulters" element={<Defaulters />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route
                path="/payments"
                element={
                  <div className="p-12 text-center text-slate-400 italic font-medium">
                    Payment reconciliation module initializing...
                  </div>
                }
              />
              <Route
                path="/settings"
                element={
                  <div className="p-12 text-center text-slate-400 italic font-medium">
                    Administrative settings portal...
                  </div>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      )}
    </AuthInitializer>
  );
};

export default App;
