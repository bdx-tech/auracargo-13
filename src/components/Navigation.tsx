
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useMobile from "@/hooks/use-mobile";
import { Menu, X, LogIn } from 'lucide-react';

const Navigation = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navbarClasses = `
    fixed top-0 left-0 right-0 z-50 px-4 md:px-8 lg:px-16 py-4 transition-all duration-300
    ${scrolled || location.pathname !== '/' ? 'bg-white shadow-md' : 'bg-transparent'}
  `;

  const linkClasses = `
    font-medium hover:text-primary transition-colors duration-200
    ${scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-gray-100'}
  `;

  const renderDesktopNav = () => (
    <div className="hidden lg:flex w-full items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/1e21aeaa-540f-4dde-8a28-4ab829e83c16.png" 
          alt="AuraCargo Logo" 
          className="h-10 w-auto" 
        />
        <span className={`font-bold text-xl ${scrolled || location.pathname !== '/' ? 'text-gray-800' : 'text-white'}`}>
          AuraCargo
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-8">
        <Link to="/" className={linkClasses}>Home</Link>
        <Link to="/services" className={linkClasses}>Services</Link>
        <Link to="/projects" className={linkClasses}>Projects</Link>
        <Link to="/track" className={linkClasses}>Track Shipment</Link>
        <Link to="/contact" className={linkClasses}>Contact</Link>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {isAdmin && (
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard
              </Button>
            )}
            <Button 
              variant="default" 
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" className={scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'}>
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
            <Link to="/admin-signup">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <LogIn size={16} className="mr-2" />
                Admin Access
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );

  const renderMobileNav = () => (
    <div className="lg:hidden flex w-full items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/1e21aeaa-540f-4dde-8a28-4ab829e83c16.png" 
          alt="AuraCargo Logo" 
          className="h-8 w-auto" 
        />
        <span className={`font-bold text-lg ${scrolled || location.pathname !== '/' ? 'text-gray-800' : 'text-white'}`}>
          AuraCargo
        </span>
      </Link>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu}
            className={scrolled || location.pathname !== '/' ? 'text-gray-700' : 'text-white'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[380px]">
          <nav className="flex flex-col h-full py-6">
            <div className="space-y-4 mb-8">
              <Link 
                to="/" 
                className="block py-2 text-lg font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="block py-2 text-lg font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/projects" 
                className="block py-2 text-lg font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
              <Link 
                to="/track" 
                className="block py-2 text-lg font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Shipment
              </Link>
              <Link 
                to="/contact" 
                className="block py-2 text-lg font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
            
            <div className="mt-auto space-y-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Button 
                      className="w-full justify-center"
                      onClick={() => {
                        navigate('/admin');
                        setIsMenuOpen(false);
                      }}
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  <Button 
                    className="w-full justify-center"
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMenuOpen(false);
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Log In
                  </Button>
                  <Button 
                    className="w-full justify-center"
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => {
                      navigate('/admin-signup');
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogIn size={16} className="mr-2" />
                    Admin Access
                  </Button>
                </>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <header className={navbarClasses}>
      {isMobile ? renderMobileNav() : renderDesktopNav()}
    </header>
  );
};

export default Navigation;
