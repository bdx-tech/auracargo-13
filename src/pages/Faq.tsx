
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq = () => {
  return (
    <div className="bg-white min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-kargon-dark">Frequently Asked Questions</h1>
          
          <p className="text-gray-600 mb-10">
            Find answers to commonly asked questions about our services, shipping processes, and policies.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-medium">
                How do I track my shipment?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                You can track your shipment by entering your tracking number in the tracking form on our website's homepage. 
                You'll receive real-time updates on your shipment's location and status.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-medium">
                What shipping methods do you offer?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We offer various shipping methods, including standard shipping, express shipping, and premium shipping. 
                The available options depend on your location and the destination of your shipment.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-medium">
                How are shipping rates calculated?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Shipping rates are calculated based on several factors, including the weight and dimensions of your package, 
                the shipping method selected, the origin and destination locations, and any additional services you choose.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-medium">
                Do you ship internationally?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes, we offer international shipping services to most countries worldwide. International shipments may 
                require additional documentation and may be subject to customs duties and taxes.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-medium">
                What items are prohibited from shipping?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Prohibited items include but are not limited to hazardous materials, illegal substances, firearms, explosives, 
                flammable items, perishable goods (without proper arrangements), and counterfeit merchandise. Please contact 
                our customer service for a complete list of prohibited items.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left font-medium">
                What should I do if my shipment is delayed?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                If your shipment is delayed, please check the tracking information for updates. If there's no explanation for 
                the delay, contact our customer service team with your tracking number, and we'll investigate the status of your shipment.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left font-medium">
                Is insurance available for my shipment?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes, we offer shipping insurance to protect your items against loss or damage during transit. You can add insurance 
                when creating your shipment for an additional fee based on the declared value of your items.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left font-medium">
                How do I pay for shipping services?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We accept various payment methods, including credit/debit cards and bank transfers. For business customers, 
                we also offer invoicing options. Payment must be completed before a shipment can be processed.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left font-medium">
                What is your refund policy?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Refunds may be available for shipments that have not yet been processed. Once a shipment is in transit, 
                refunds are generally not available. For specific refund requests, please contact our customer service team.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left font-medium">
                How can I contact customer support?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                You can contact our customer support team by phone at +1 (234) 567-890, by email at support@auracargo.com, 
                or through the contact form on our website. Our support team is available Monday through Friday, 9 AM to 6 PM EST.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              If you couldn't find the answer to your question, please feel free to contact our customer service team. 
              We're here to help!
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center text-kargon-red hover:text-kargon-red/90 font-medium"
            >
              Contact Us <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Faq;
