import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import Chatbot from "./pages/Chatbot";
import ChatbotSettings from "./pages/ChatbotSettings";
import LegalAISettings from "./pages/LegalAISettings";
import LawSimplify from "./pages/LawSimplify";
import DocumentQA from "./pages/DocumentQA";
import FindLawyer from "./pages/FindLawyer";
import PublicLawyerProfile from "./pages/PublicLawyerProfile";
import AppointmentBooking from "./pages/AppointmentBooking";
import ChatWithLawyer from "./pages/ChatWithLawyer";
import VideoCall from "./pages/VideoCall";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import LawyerDashboard from "./pages/LawyerDashboard";
import LawyerAppointments from "./pages/LawyerAppointments";
import LawyerAllAppointments from "./pages/LawyerAllAppointments";
import LawyerClients from "./pages/LawyerClients";
import LawyerMessages from "./pages/LawyerMessages";
import LawyerVideoCalls from "./pages/LawyerVideoCalls";
import LawyerDocuments from "./pages/LawyerDocuments";
import LawyerProfile from "./pages/LawyerProfile";
import LawyerPayments from "./pages/LawyerPayments";
import LawyerReviews from "./pages/LawyerReviews";
import LawyerSettings from "./pages/LawyerSettings";
import OtpVerification from "./pages/OtpVerification";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Component to handle scroll to top on route changes
const ScrollToTop = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-background">
            <Routes>
              {/* Public Routes with Navbar */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Index />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/about" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <About />
                  </main>
                  <Footer />
                </>
              } />
              {/* Chatbot Route without Footer */}
              <Route path="/chatbot" element={<Chatbot />} />
              {/* Chatbot Settings Route without Navbar/Footer */}
              <Route path="/chatbot-settings" element={<ChatbotSettings />} />
              {/* Legal AI Settings Route without Navbar/Footer */}
              <Route path="/legal-ai-settings" element={<LegalAISettings />} />
              <Route path="/lawsimplify" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <LawSimplify />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/document-qa" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <DocumentQA />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/find-lawyer" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <FindLawyer />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/lawyer/:id" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <PublicLawyerProfile />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/booking/:lawyerId" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <AppointmentBooking />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/chat/:lawyerId" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <ChatWithLawyer />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/video-call/:sessionId" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <VideoCall />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Contact />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/login" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Login />
                  </main>
                </>
              } />
              <Route path="/signup" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Signup />
                  </main>
                </>
              } />
              <Route path="/otp-verification" element={
                <>
                  <main className="flex-1">
                    <OtpVerification />
                  </main>
                </>
              } />
              
              {/* Lawyer Panel Routes (No Navbar/Footer) */}
              <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
              <Route path="/lawyer-appointments" element={<LawyerAppointments />} />
              <Route path="/lawyer-all-appointments" element={<LawyerAllAppointments />} />
              <Route path="/lawyer-clients" element={<LawyerClients />} />
              <Route path="/lawyer-messages" element={<LawyerMessages />} />
              <Route path="/lawyer-video-calls" element={<LawyerVideoCalls />} />
              <Route path="/lawyer-documents" element={<LawyerDocuments />} />
              <Route path="/lawyer-profile" element={<LawyerProfile />} />
              <Route path="/lawyer-payments" element={<LawyerPayments />} />
              <Route path="/lawyer-reviews" element={<LawyerReviews />} />
              <Route path="/lawyer-settings" element={<LawyerSettings />} />
              
              {/* Admin Panel Route (No Navbar/Footer) */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              
              {/* 404 Route */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <NotFound />
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
