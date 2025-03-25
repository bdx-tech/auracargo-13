
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-kargon-dark">Privacy Policy</h1>
          
          <div className="prose max-w-none text-gray-700">
            <p className="lead mb-6">
              At AuraCargo, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share your personal information.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, submit a form, or communicate with us. This may include your name, email address, phone number, shipping address, and payment information.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, including to:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>Process and manage your shipments</li>
              <li>Communicate with you about your orders and account</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new products and services</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Sharing Your Information</h2>
            <p>
              We may share the information we collect as follows:
            </p>
            <ul className="list-disc pl-6 my-4 space-y-2">
              <li>With vendors, service providers, and partners who need access to such information to carry out work on our behalf</li>
              <li>In response to a request for information if we believe disclosure is required by law</li>
              <li>If we believe your actions are inconsistent with our user agreements or policies</li>
              <li>To protect the rights, property, and safety of AuraCargo or others</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Data Security</h2>
            <p>
              We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your personal information.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
            <p>
              We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: privacy@auracargo.com<br />
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

export default Privacy;
