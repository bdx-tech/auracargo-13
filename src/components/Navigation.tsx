
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Truck, UserCircle, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-kargon-red rounded-full flex items-center justify-center">
                <Truck className="text-white" size={20} />
              </div>
              <span className={`ml-2 font-display font-bold text-xl ${isScrolled ? 'text-kargon-dark' : 'text-white'}`}>
                AURACARGO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`nav-link font-medium ${isScrolled ? 'text-kargon-dark' : 'text-white'} hover:text-kargon-red ${isActive('/') ? 'active' : ''}`}>
              HOME
            </Link>
            <Link to="/services" className={`nav-link font-medium ${isScrolled ? 'text-kargon-dark' : 'text-white'} hover:text-kargon-red ${isActive('/services') ? 'active' : ''}`}>
              SERVICES
            </Link>
            <Link to="/projects" className={`nav-link font-medium ${isScrolled ? 'text-kargon-dark' : 'text-white'} hover:text-kargon-red ${isActive('/projects') ? 'active' : ''}`}>
              PROJECTS
            </Link>
            <Link to="/contact" className={`nav-link font-medium ${isScrolled ? 'text-kargon-dark' : 'text-white'} hover:text-kargon-red ${isActive('/contact') ? 'active' : ''}`}>
              CONTACT
            </Link>
            {user && (
              <Link to="/dashboard" className={`nav-link font-medium ${isScrolled ? 'text-kargon-dark' : 'text-white'} hover:text-kargon-red ${isActive('/dashboard') ? 'active' : ''}`}>
                DASHBOARD
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`nav-link font-medium ${isScrolled ? 'text-kargon-dark' : 'text-white'} hover:text-kargon-red ${isActive('/admin') ? 'active' : ''}`}>
                ADMIN
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" className={`font-medium ${isScrolled ? 'text-kargon-dark hover:text-kargon-red' : 'text-white hover:text-white/80'} hover:bg-transparent`}>
                      <Shield className="mr-2 h-5 w-5" />
                      ADMIN
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="ghost" className={`font-medium ${isScrolled ? 'text-kargon-dark hover:text-kargon-red' : 'text-white hover:text-white/80'} hover:bg-transparent`}>
                    <UserCircle className="mr-2 h-5 w-5" />
                    MY ACCOUNT
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className={`font-medium ${isScrolled ? 'text-kargon-dark hover:text-kargon-red' : 'text-white hover:text-white/80'} hover:bg-transparent`}
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  LOGOUT
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className={`font-medium ${isScrolled ? 'text-kargon-dark hover:text-kargon-red' : 'text-white hover:text-white/80'} hover:bg-transparent`}>
                    LOGIN
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-kargon-red hover:bg-kargon-red/90 text-white rounded-md">
                    GET QUOTE
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className={isScrolled ? 'text-kargon-dark' : 'text-white'} size={24} />
            ) : (
              <Menu className={isScrolled ? 'text-kargon-dark' : 'text-white'} size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 animate-fade-in">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className={`font-medium text-kargon-dark hover:text-kargon-red py-2 ${isActive('/') ? 'text-kargon-red' : ''}`} onClick={() => setIsMenuOpen(false)}>
                HOME
              </Link>
              <Link to="/services" className={`font-medium text-kargon-dark hover:text-kargon-red py-2 ${isActive('/services') ? 'text-kargon-red' : ''}`} onClick={() => setIsMenuOpen(false)}>
                SERVICES
              </Link>
              <Link to="/projects" className={`font-medium text-kargon-dark hover:text-kargon-red py-2 ${isActive('/projects') ? 'text-kargon-red' : ''}`} onClick={() => setIsMenuOpen(false)}>
                PROJECTS
              </Link>
              <Link to="/contact" className={`font-medium text-kargon-dark hover:text-kargon-red py-2 ${isActive('/contact') ? 'text-kargon-red' : ''}`} onClick={() => setIsMenuOpen(false)}>
                CONTACT
              </Link>
              {user && (
                <Link to="/dashboard" className={`font-medium text-kargon-dark hover:text-kargon-red py-2 ${isActive('/dashboard') ? 'text-kargon-red' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  DASHBOARD
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className={`font-medium text-kargon-dark hover:text-kargon-red py-2 ${isActive('/admin') ? 'text-kargon-red' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  ADMIN
                </Link>
              )}
              
              {user ? (
                <div className="pt-2">
                  {isAdmin && (
                    <Link to="/admin" className="font-medium text-kargon-dark hover:text-kargon-red py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                      <Shield className="mr-2 h-5 w-5" /> ADMIN PANEL
                    </Link>
                  )}
                  <Link to="/dashboard" className="font-medium text-kargon-dark hover:text-kargon-red py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                    <UserCircle className="mr-2 h-5 w-5" /> MY ACCOUNT
                  </Link>
                  <button 
                    className="font-medium text-kargon-dark hover:text-kargon-red py-2 flex items-center" 
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" /> LOGOUT
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="font-medium text-kargon-dark hover:text-kargon-red py-2" onClick={() => setIsMenuOpen(false)}>
                    LOGIN
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-kargon-red hover:bg-kargon-red/90 text-white w-full rounded-md mt-4">
                      GET QUOTE
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
