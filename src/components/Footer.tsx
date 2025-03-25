
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-kargon-dark text-white pt-16 pb-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 bg-kargon-red rounded-full flex items-center justify-center">
                <Truck className="text-white" size={20} />
              </div>
              <span className="ml-2 font-display font-bold text-xl text-white">AURACARGO</span>
            </div>
            <p className="text-gray-300 mb-6">
              We pride ourselves on providing the best logistics and transportation services worldwide.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-kargon-red shrink-0 mt-1" />
                <p className="text-gray-300">123 Main Street, Suite 100, New York, NY 10001</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-kargon-red" />
                <a href="tel:+1-234-567-890" className="text-gray-300 hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-kargon-red" />
                <a href="mailto:info@auracargo.com" className="text-gray-300 hover:text-white transition-colors">
                  info@auracargo.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="/" className="text-gray-300 hover:text-white transition-colors py-1 flex items-center">
                <ArrowRight size={14} className="mr-2 text-kargon-red" />
                Home
              </a>
              <a href="/services" className="text-gray-300 hover:text-white transition-colors py-1 flex items-center">
                <ArrowRight size={14} className="mr-2 text-kargon-red" />
                Services
              </a>
              <a href="/projects" className="text-gray-300 hover:text-white transition-colors py-1 flex items-center">
                <ArrowRight size={14} className="mr-2 text-kargon-red" />
                Projects
              </a>
              <a href="/contact" className="text-gray-300 hover:text-white transition-colors py-1 flex items-center">
                <ArrowRight size={14} className="mr-2 text-kargon-red" />
                Contact
              </a>
              <a href="/privacy" className="text-gray-300 hover:text-white transition-colors py-1 flex items-center">
                <ArrowRight size={14} className="mr-2 text-kargon-red" />
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-300 hover:text-white transition-colors py-1 flex items-center">
                <ArrowRight size={14} className="mr-2 text-kargon-red" />
                Terms of Service
              </a>
              <a href="/faq" className="text-gray-300 hover:text-white transition-colors py-1 flex items-center">
                <ArrowRight size={14} className="mr-2 text-kargon-red" />
                FAQ
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Our Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter to stay updated with the latest news and special offers.
            </p>
            <div className="flex gap-2 mb-6">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-kargon-dark/40 border-gray-700 focus:border-kargon-red focus:ring-0 text-white"
              />
              <Button className="bg-kargon-red hover:bg-kargon-red/90 px-4 shrink-0">
                Subscribe
              </Button>
            </div>
            <div className="flex gap-4">
              <a href="#" className="bg-gray-700 hover:bg-kargon-red transition-colors p-2 rounded-full">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-gray-700 hover:bg-kargon-red transition-colors p-2 rounded-full">
                <Twitter size={18} />
              </a>
              <a href="#" className="bg-gray-700 hover:bg-kargon-red transition-colors p-2 rounded-full">
                <Linkedin size={18} />
              </a>
              <a href="#" className="bg-gray-700 hover:bg-kargon-red transition-colors p-2 rounded-full">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} AuraCargo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
