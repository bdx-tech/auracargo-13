
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TrackOrder from "@/components/TrackOrder";
import ServicesCards from "@/components/ServicesCards";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import WorkflowSection from "@/components/WorkflowSection";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import UpdatesSection from "@/components/UpdatesSection";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import ChatBubble from "@/components/ChatBubble";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Initialize scroll animations
    const handleScroll = () => {
      const scrollAnimElements = document.querySelectorAll('.scroll-animate');
      scrollAnimElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight * 0.9) {
          element.classList.add('appear');
        }
      });
    };

    // Initial check on load
    setTimeout(handleScroll, 100);

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="bg-white">
      <Navigation />
      <HeroSection />
      <TrackOrder />
      <ServicesCards />
      <AboutSection />
      <ServicesSection />
      <WorkflowSection />
      <StatsSection />
      <TestimonialsSection />
      <UpdatesSection />
      <ContactForm />
      <Footer />
      
      {/* Chat Bubble Widget (only shown when user is logged in) */}
      {user && <ChatBubble />}
    </div>
  );
};

export default Index;
