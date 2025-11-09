import React from 'react';
import { Link } from 'react-router-dom';
import { FaAmbulance, FaUserNurse, FaPills, FaStethoscope, FaWheelchair } from 'react-icons/fa';

const Home = () => {
  const services = [
    {
      icon: <FaAmbulance className="text-5xl" />,
      title: 'Home Care',
      description: 'Professional home healthcare services at your doorstep'
    },
    {
      icon: <FaUserNurse className="text-5xl" />,
      title: 'Nurse Care',
      description: 'Experienced nurses for personalized care'
    },
    {
      icon: <FaPills className="text-5xl" />,
      title: 'Medicine Delivery',
      description: 'Fast and reliable medicine delivery service'
    },
    {
      icon: <FaStethoscope className="text-5xl" />,
      title: 'Doctor on Call',
      description: 'Consult with doctors from the comfort of your home'
    },
    {
      icon: <FaWheelchair className="text-5xl" />,
      title: 'Equipment Rental',
      description: 'Medical equipment rental for your needs'
    }
  ];

  const testimonials = [
    {
      name: 'Fatema Rahman',
      comment: 'Excellent service! The nurse was very professional and caring.',
      rating: 5
    },
    {
      name: 'Kamal Hossain',
      comment: 'Medicine delivery was fast and convenient. Highly recommend!',
      rating: 5
    },
    {
      name: 'Ayesha Siddique',
      comment: 'Great experience with home care services. Very satisfied!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl animate-slideUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Modern Healthcare, Delivered to Your Doorstep
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed">
              Professional healthcare services in Dhaka. Book nurses, doctors, medicine delivery, and medical equipment rental.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/services" className="bg-white text-primary-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 transform text-center hover:shadow-xl">
                Book a Service
              </Link>
              <Link to="/register?role=staff" className="border-2 border-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 hover:scale-105 transform text-center">
                Apply as Staff
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 animate-fadeIn">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-children">
            {services.map((service, index) => (
              <div key={index} className="card text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <div className="text-primary-600 flex justify-center mb-4 animate-pulse-subtle">
                  {service.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 md:mt-12 animate-fadeIn">
            <Link to="/services" className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 inline-block hover:scale-105 transform">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 animate-fadeIn">What Our Patients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 stagger-children">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card hover:-translate-y-2 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl animate-pulse-subtle">★</span>
                  ))}
                </div>
                <p className="text-sm md:text-base text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-slideUp">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">About DHS</h2>
            <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6 leading-relaxed">
              Dhaka Health Service (DHS) is your trusted partner in healthcare, inspired by the UK's NHS and modern healthcare platforms. We provide professional healthcare services right at your doorstep.
            </p>
            <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 leading-relaxed">
              Our mission is to make quality healthcare accessible to everyone in Dhaka through our network of verified healthcare professionals and efficient service delivery.
            </p>
            <Link to="/about" className="btn-primary inline-block hover:scale-105 transform transition-all duration-300">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Ready to Get Started?</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 px-4">Join thousands of satisfied patients who trust DHS for their healthcare needs</p>
          <Link to="/register" className="bg-white text-primary-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 text-base md:text-lg inline-block hover:scale-105 transform hover:shadow-xl">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
