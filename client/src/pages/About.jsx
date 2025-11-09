import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/supabaseAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaUsers, FaUserNurse, FaHeartbeat, FaCalendar, FaCheckCircle } from 'react-icons/fa';

const About = () => {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await pagesAPI.getBySlug("about");
      if (error) {
        console.error('API Error:', error);
        toast.error(error);
        return;
      }
      setSections(data.sections);
    } catch (error) {
      console.error('Error fetching about page:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      users: FaUsers,
      'user-nurse': FaUserNurse,
      heartbeat: FaHeartbeat,
      calendar: FaCalendar
    };
    const IconComponent = icons[iconName] || FaCheckCircle;
    return <IconComponent size={40} className="text-primary-600" />;
  };

  const renderSection = (section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div key={section.id} className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-bold mb-6 animate-fadeIn">{section.title}</h1>
                <p className="text-xl text-primary-100 leading-relaxed">{section.content}</p>
              </div>
            </div>
          </div>
        );

      case 'mission':
      case 'vision':
        return (
          <div key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">{section.title}</h2>
                  <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        );

      case 'values':
        return (
          <div key={section.id} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">{section.title}</h2>
                  <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.content.split('•').filter(v => v.trim()).map((value, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center space-x-3">
                        <FaCheckCircle className="text-primary-600 flex-shrink-0" size={24} />
                        <span className="text-gray-800 font-medium">{value.trim()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div key={section.id} className="py-20 bg-primary-600 text-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
                <p className="text-xl text-primary-100">{section.content}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {section.stats?.map((stat, idx) => (
                  <div key={idx} className="text-center transform hover:scale-110 transition-transform duration-300">
                    <div className="flex justify-center mb-4">
                      {getIconComponent(stat.icon)}
                    </div>
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-primary-100 text-lg">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">{section.title}</h2>
                <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
                <p className="text-lg text-gray-600">{section.content}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {section.teamMembers?.map((member, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <div className="aspect-square bg-gray-300 flex items-center justify-center">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <FaUsers size={80} className="text-gray-400" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                      <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                      <p className="text-gray-600 text-sm">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'custom':
        return (
          <div key={section.id} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">{section.title}</h2>
                  <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.content.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{line.replace('•', '').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {sections.map(section => renderSection(section))}
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Quality Home Healthcare?</h2>
          <p className="text-xl text-primary-100 mb-8">Join thousands of satisfied patients who trust DHS</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/services" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              View Services
            </a>
            <a href="/register" className="bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-900 transition-colors duration-200 border-2 border-white">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
