import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import './i18n/config';

import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import PlantDetail from "./pages/PlantDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyNotes from "./pages/MyNotes";
import Bookmarks from "./pages/Bookmarks";
import Likes from "./pages/Likes";
import AISuggestions from "./pages/AISuggestions";
import QuizPage from "./pages/QuizPage";
import VirtualTours from "./pages/VirtualTours";
import Remedies from "./pages/Remedies";
import { VRGardenPage } from "./pages/VRGardenPage";
import TourDetail from "./pages/TourDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-notes" element={<MyNotes />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/likes" element={<Likes />} />
              <Route path="/ai-suggestions" element={<AISuggestions />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/tours" element={<VirtualTours />} />
              <Route path="/tours/:tourId" element={<TourDetail />} />
              <Route path="/remedies" element={<Remedies />} />
              <Route path="/vr-garden" element={<VRGardenPage />} />
              <Route path="/plant/:plantId" element={<PlantDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
