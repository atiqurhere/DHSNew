import React from 'react';

const ServiceCard = ({ service, onBook }) => {
  return (
    <div className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-2 transform animate-fadeIn">
      <div className="h-40 md:h-48 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden group">
        <span className="text-white text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">{service.icon || '🏥'}</span>
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2">{service.name}</h3>
      <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">{service.description}</p>
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="text-xl md:text-2xl font-bold text-primary-600">৳{service.price}</span>
        <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{service.duration}</span>
      </div>
      {service.features && (
        <ul className="mt-4 space-y-1">
          {service.features.slice(0, 3).map((feature, idx) => (
            <li key={idx} className="text-xs md:text-sm text-gray-600 flex items-center">
              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
              <span className="line-clamp-1">{feature}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => onBook && onBook(service)}
        className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        disabled={!service.isAvailable}
      >
        {service.isAvailable ? 'Book Now' : 'Unavailable'}
      </button>
    </div>
  );
};

export default ServiceCard;
