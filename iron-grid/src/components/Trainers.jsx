import React from 'react';

export default function TrainerCard({ imageSrc, name, specialty, descriptionItems }) {
  return (
    <div className="group relative rounded-xl overflow-hidden w-full max-w-sm h-[600px] transition-all duration-300 hover:shadow-2xl hover:scale-105">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={imageSrc}
          alt={name}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        {/* Name and Specialty */}
        <div className="mb-4">
          <h3 className="text-3xl font-bold text-white font-bebas tracking-wider">
            {name}
          </h3>
          <p className="text-xl text-red-400 font-medium italic">{specialty}</p>
        </div>

        {/* Description Items */}
        <ul className="mb-6 space-y-2 ">
          {descriptionItems.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-red-400 mr-2">•</span>
              <span className="font-semibold text-sm text-gray-300">{item}</span>
            </li>
          ))}
        </ul>

        {/* Contact Button */}
        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
          BOOK SESSION
        </button>
      </div>
    </div>
  );
}