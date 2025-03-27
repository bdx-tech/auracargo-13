
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Define image paths
const HERO_IMAGE_WEBP = "/hero-optimized.webp";
const HERO_IMAGE_FALLBACK = "/lovable-uploads/9bc9bb5d-5345-4122-9396-f69e5f467fc3.png";

const HeroSection = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState(true); // Assume support initially
  
  useEffect(() => {
    // Check WebP support
    const checkWebPSupport = async () => {
      const webpSupported = await testWebP();
      setSupportsWebP(webpSupported);
    };
    
    checkWebPSupport();
    
    // Determine which image to use
    const imageSrc = supportsWebP ? HERO_IMAGE_WEBP : HERO_IMAGE_FALLBACK;
    
    // Preload the image
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setImageLoaded(true);
    
    // Add a fallback in case image takes too long
    const timer = setTimeout(() => {
      if (!imageLoaded) setImageLoaded(true);
    }, 500); // Reduced from 800ms to 500ms
    
    return () => clearTimeout(timer);
  }, [imageLoaded, supportsWebP]);

  // Helper function to test WebP support
  const testWebP = () => {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = function () {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  };

  // Determine which image to use
  const imageSrc = supportsWebP ? HERO_IMAGE_WEBP : HERO_IMAGE_FALLBACK;

  return (
    <section className="relative min-h-screen bg-kargon-blue flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Low resolution placeholder that loads instantly */}
        <div 
          className="w-full h-full bg-cover bg-center bg-kargon-blue/70"
          style={{ 
            backgroundImage: `url('${imageSrc}')`, 
            backgroundSize: "cover",
            filter: !imageLoaded ? "blur(10px)" : "none",
            transition: "filter 0.3s ease-in-out"
          }}
        />
        
        {/* Main image that loads with priority */}
        <picture>
          {supportsWebP && (
            <source srcSet={HERO_IMAGE_WEBP} type="image/webp" />
          )}
          <img 
            src={HERO_IMAGE_FALLBACK}
            alt="Cargo Port with Containers" 
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="eager" 
            fetchPriority="high"
            width="1280" 
            height="720"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
        </picture>
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
