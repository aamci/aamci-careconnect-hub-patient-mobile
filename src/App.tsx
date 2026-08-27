import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Main pages
import Index from "./pages/Index";
import Search from "./pages/Search";
import Appointments from "./pages/Appointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import Messages from "./pages/Messages";
import MessageThread from "./pages/MessageThread";
import Profile from "./pages/Profile";
import AddProfile from "./pages/AddProfile";
import Documents from "./pages/Documents";
import PractitionerDetail from "./pages/PractitionerDetail";
import Booking from "./pages/Booking";
import Teleconsultation from "./pages/Teleconsultation";
import Settings from "./pages/Settings";
import NotificationSettings from "./pages/NotificationSettings";
import NotFound from "./pages/NotFound";
import ProfileInfo from "./pages/ProfileInfo";
import ManagedProfiles from "./pages/ManagedProfiles";
import Help from "./pages/Help";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import HealthForm from "./pages/HealthForm";
import AIAssistant from "./pages/AIAssistant";
import HealthContent from "./pages/HealthContent";
import PostConsultationReview from "./pages/PostConsultationReview";
import PractitionerReviews from "./pages/PractitionerReviews";
import ReportPage from "./pages/ReportPage";
import ConsultationReport from "./pages/ConsultationReport";
import HealthMetrics from "./pages/HealthMetrics";
import ShareRecords from "./pages/ShareRecords";
import FacilityDetail from "./pages/FacilityDetail";
import Notifications from "./pages/Notifications";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:threadId" element={<ProtectedRoute><MessageThread /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/add" element={<ProtectedRoute><AddProfile /></ProtectedRoute>} />
            <Route path="/profile/info" element={<ProtectedRoute><ProfileInfo /></ProtectedRoute>} />
            <Route path="/profile/managed" element={<ProtectedRoute><ManagedProfiles /></ProtectedRoute>} />
            <Route path="/profile/edit/:id" element={<ProtectedRoute><ProfileInfo /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/reports/:id" element={<ProtectedRoute><ConsultationReport /></ProtectedRoute>} />
            <Route path="/health/metrics" element={<ProtectedRoute><HealthMetrics /></ProtectedRoute>} />
            <Route path="/share" element={<ProtectedRoute><ShareRecords /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/practitioners/:id" element={<ProtectedRoute><PractitionerDetail /></ProtectedRoute>} />
            <Route path="/booking/:practitionerId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/teleconsultation/:id" element={<ProtectedRoute><Teleconsultation /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
            <Route path="/profile/health" element={<ProtectedRoute><HealthForm /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/health-content" element={<ProtectedRoute><HealthContent /></ProtectedRoute>} />
            <Route path="/review/:appointmentId" element={<ProtectedRoute><PostConsultationReview /></ProtectedRoute>} />
            <Route path="/practitioners/:id/reviews" element={<ProtectedRoute><PractitionerReviews /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
            <Route path="/facilities/:id" element={<ProtectedRoute><FacilityDetail /></ProtectedRoute>} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
