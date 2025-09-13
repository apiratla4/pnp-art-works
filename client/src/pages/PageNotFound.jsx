// src/pages/PageNotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ShoppingBag, ArrowLeft } from 'lucide-react';
import FancyButton from '../components/FancyButton';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#f1efef' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card border-0 shadow-sm rounded-4 overflow-hidden"
              style={{ background: '#fff', color: '#000' }}
            >
              <div className="card-body p-4 p-lg-5 text-center">
                <div className="d-flex justify-content-center mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 72, height: 72, background: '#fff', color: '#000', border: '2px solid #000' }}
                  >
                    <AlertTriangle size={30} />
                  </div>
                </div>

                <h1 className="fw-bold display-6 mb-2" style={{ color: '#000' }}>Page not found</h1>
                <p className="mb-4" style={{ color: '#000' }}>
                  The page being requested doesn’t exist or may have been moved. Check the URL or use the options below.
                </p>

                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <FancyButton to="/" className="fancy-sm">
                    <Home size={18} />
                    Go Home
                  </FancyButton>

                  <FancyButton to="/shop" className="fancy-sm">
                    <ShoppingBag size={18} />
                    Browse Shop
                  </FancyButton>

                  <FancyButton as="button" type="button" className="fancy-sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    Go Back
                  </FancyButton>
                </div>

                <hr className="my-4" />

                <div className="small" style={{ color: '#000' }}>
                  Need help? Reach out from the Contact page or use the navigation links above.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
