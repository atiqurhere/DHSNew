import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="animate-fadeIn">
            <h3 className="text-xl font-bold mb-4">DHS</h3>
            <p className="text-gray-400 text-sm md:text-base">
              Modern healthcare, delivered to your doorstep. Your trusted partner in health and wellness.
            </p>
          </div>

          <div className="animate-fadeIn">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm md:text-base">Services</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm md:text-base">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm md:text-base">Contact</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block text-sm md:text-base">Careers</Link></li>
            </ul>
          </div>

          <div className="animate-fadeIn">
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm md:text-base">
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Home Care</li>
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Nurse Care</li>
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Medicine Delivery</li>
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Doctor on Call</li>
              <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Equipment Rental</li>
            </ul>
          </div>

          <div className="animate-fadeIn">
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-sm md:text-base">
              <li className="flex items-center space-x-2 hover:text-white transition-colors">
                <FaPhone />
                <span>+880 1234-567890</span>
              </li>
              <li className="flex items-center space-x-2 hover:text-white transition-colors">
                <FaEnvelope />
                <span className="break-all">info@dhs.com.bd</span>
              </li>
              <li className="flex items-center space-x-2 hover:text-white transition-colors">
                <FaMapMarkerAlt />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 transform">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400 text-sm md:text-base">
          <p>&copy; {new Date().getFullYear()} DHS - Dhaka Health Service. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
