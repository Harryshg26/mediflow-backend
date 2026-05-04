import { Routes, Route } from "react-router";
import Dashboard from "./pages/Dashboard";
import QueueManagement from "./pages/QueueManagement";
import Prescriptions from "./pages/Prescriptions";
import AIAnalytics from "./pages/AIAnalytics";
import PatientCheckIn from "./pages/PatientCheckIn";
import Staff from "./pages/Staff";
import Stock from "./pages/Stock";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/queue" element={<QueueManagement />} />
      <Route path="/prescriptions" element={<Prescriptions />} />
      <Route path="/analytics" element={<AIAnalytics />} />
      <Route path="/checkin" element={<PatientCheckIn />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/stock" element={<Stock />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
