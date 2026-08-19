import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ShoppingBag, ArrowLeft } from 'lucide-react';
import FancyButton from '../components/FancyButton';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1efef] py-8">
      <div className="w-full max-w-2xl px-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-3xl overflow-hidden"
        >
          <div className="p-7 md:p-12 text-center">
            <div className="flex justify-center mb-4">
              <span className="rounded-full border-2 border-black flex items-center justify-center"
                    style={{ width: 72, height: 72, background: "#fff", color: "#000" }}>
                <AlertTriangle size={32} />
              </span>
            </div>

            <h1 className="font-black text-3xl md:text-4xl mb-3 text-black tracking-tight">Page not found</h1>
            <p className="text-black mb-6 text-base md:text-lg">
              The page being requested doesn’t exist or may have been moved. Check the URL or use the options below.
            </p>

            {/* Actions Row */}
            <div className="flex flex-col md:flex-row gap-3 justify-center mb-6">
              <FancyButton to="/" className="fancy-sm flex items-center justify-center w-full md:w-60 text-lg font-bold gap-3">
               
                GO HOME
              </FancyButton>
              <FancyButton to="/shop" className="fancy-sm flex items-center justify-center w-full md:w-60 text-lg font-bold gap-3">
               
                BROWSE SHOP
              </FancyButton>
              <FancyButton as="button" type="button"
                className="fancy-sm flex items-center justify-center w-full md:w-60 text-lg font-bold gap-3"
                onClick={() => navigate(-1)}
              >
            
                GO BACK
              </FancyButton>
            </div>

            <hr className="my-5 border-black/10" />

            <div className="text-sm text-black">
              Need help? Reach out from the Contact page or use the navigation links above.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PageNotFound;
