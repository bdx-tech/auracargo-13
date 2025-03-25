
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-kargon-dark">Terms of Service</h1>
          
          <div className="prose max-w-none text-gray-700">
            <p className="lead mb-6">
              Welcome to AuraCargo. By using our website and services, you agree to these Terms of Service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AuraCargo's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Use of Services</h2>
            <p>
              Our services are available only to users who can form legally binding contracts under applicable law. By using our services, you represent that you are at least 18 years of age and have the legal authority to enter into this agreement.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for all activities that occur under your account.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Shipping and Delivery</h2>
            <p>
              AuraCargo will make reasonable efforts to deliver shipments within the estimated timeframes. However, we do not guarantee delivery times, and delays may occur due to various factors beyond our control, such as weather conditions, customs clearance, or other unforeseen circumstances.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Prohibited Items</h2>
            <p>
              You agree not to ship any items that are prohibited by law or AuraCargo's policies, including but not limited to illegal drugs, hazardous materials, firearms, or counterfeit goods.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall AuraCargo be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of our services.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless AuraCargo and its officers, directors, employees, and agents from any claims, losses, liabilities, expenses, or damages arising out of your use of our services or violation of these Terms of Service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Modifications to Terms</h2>
            <p>
              AuraCargo reserves the right to modify these Terms of Service at any time. We will notify users of any significant changes by updating the date at the top of this page or by other reasonable means.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@auracargo.com<br />
              Address: 123 Main Street, Suite 100, New York, NY 10001
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mt-12">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
