import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail } from "lucide-react";

const Contact = () => {
  return (
    <div className="bg-white">
      <Navigation />
      
      <section className="pt-28 pb-16 bg-kargon-blue/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-kargon-dark mb-6">Contact Us</h1>
            <p className="text-lg text-gray-600">
              We're here to answer your questions and help with your logistics needs
            </p>
          </div>
        </div>
      </section>
      
      <ContactForm />
      
      <section className="py-16 bg-kargon-blue/5">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-kargon-dark mb-8 text-center">Our Global Offices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-kargon-dark mb-2">New York (HQ)</h3>
              <p className="text-gray-600 mb-4">
                123 Logistics Avenue<br />
                Cargo District, NY 10001<br />
                United States
              </p>
              <p className="text-gray-600">
                Phone: +1 (555) 123-4567<br />
                Email: newyork@kargon.com
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-kargon-dark mb-2">London</h3>
              <p className="text-gray-600 mb-4">
                45 Shipping Lane<br />
                Docklands, E14 5HQ<br />
                United Kingdom
              </p>
              <p className="text-gray-600">
                Phone: +44 20 1234 5678<br />
                Email: london@kargon.com
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-kargon-dark mb-2">Singapore</h3>
              <p className="text-gray-600 mb-4">
                78 Harbor Road<br />
                Marina Bay, 018956<br />
                Singapore
              </p>
              <p className="text-gray-600">
                Phone: +65 6123 4567<br />
                Email: singapore@kargon.com
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;
