import React, { useState } from 'react';

const FitnessForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', phone: '', email: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="relative bg-black py-16 md:py-24 lg:py-32 flex justify-center items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/fitness-man.jpg"
          alt="Fit man lifting weights"
          className="absolute w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/70"></div>
      </div>
      
      {/* Content Container */}
      <div href className="relative z-10 w-full max-w-6xl px-4">
        <a href="joinUs"></a>
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            TRANSFORM YOUR <span className="text-yellow-400">FITNESS</span> <br />
            JOURNEY TODAY!
          </h2>
          
          {submitted ? (
            <div className="bg-green-500 text-white p-4 rounded-md max-w-md mx-auto md:mx-0">
              Thank you! We'll contact you shortly.
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit}
              className="mt-8  space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 max-w-4xl"
            >
              <div className="flex-1">
                <label htmlFor="name" className="sr-only">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 block w-full p-3.5"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="phone" className="sr-only">Your Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 block w-full p-3.5"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="email" className="sr-only">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 block w-full p-3.5"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3.5 px-8 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                JOIN NOW
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Decorative Border */}
      <div className="absolute inset-8 border-4 border-yellow-500 pointer-events-none hidden md:block"></div>
    </div>
  );
};

export default FitnessForm;