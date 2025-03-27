
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    // Preload the image
    const img = new Image();
    img.src = "/lovable-uploads/9bc9bb5d-5345-4122-9396-f69e5f467fc3.png";
    img.onload = () => setImageLoaded(true);
    
    // Add a fallback in case image takes too long
    const timer = setTimeout(() => {
      if (!imageLoaded) setImageLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-kargon-blue flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Low resolution placeholder that loads instantly */}
        <div 
          className="w-full h-full bg-cover bg-center bg-kargon-blue/70"
          style={{ 
            backgroundImage: "url('/lovable-uploads/9bc9bb5d-5345-4122-9396-f69e5f467fc3.png')", 
            backgroundSize: "cover",
            filter: !imageLoaded ? "blur(10px)" : "none",
            transition: "filter 0.3s ease-in-out"
          }}
        />
        
        {/* Main image that loads with priority */}
        <img 
          src="/lovable-uploads/9bc9bb5d-5345-4122-9396-f69e5f467fc3.png" 
          alt="Cargo Port with Containers" 
          className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="eager" 
          fetchPriority="high"
          width="1280" 
          height="720"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-kargon-dark/70 to-kargon-blue/30"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Transport your<br />cargo everywhere
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-lg">
            Reliable and efficient logistics solutions tailored to your business needs.
          </p>
          <Link to="/signup">
            <Button className="bg-kargon-red hover:bg-kargon-red/90 text-white rounded-md px-6 py-6 text-lg flex items-center gap-2">
              GET STARTED
              <ChevronRight size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
