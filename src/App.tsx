import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Appointments from "./pages/Appointments";
import Messages from "./pages/Messages";
import MessageThread from "./pages/MessageThread";
import Profile from "./pages/Profile";
import Documents from "./pages/Documents";
import PractitionerDetail from "./pages/PractitionerDetail";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:threadId" element={<MessageThread />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/practitioners/:id" element={<PractitionerDetail />} />
          <Route path="/booking/:practitionerId" element={<Booking />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
