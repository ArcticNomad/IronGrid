import React from 'react';

const Prices = ({ planName, planType, price, currency, period, features, bestOffer, buttonText, unavailableFeatures = [] }) => {
  return (
    <div className={`relative rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
      bestOffer ? 'bg-yellow-500 text-black border-4 border-red-500' : 'bg-gray-800 text-white border-2 border-gray-700'
    } w-full max-w-sm`}>
      {bestOffer && (
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider shadow-md">
          Best Value
        </div>
      )}
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-3xl font-bold mb-1 uppercase tracking-tight underline decoration-2 underline-offset-4 decoration-red-500">
            {planName}
          </h3>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-600">
            {planType}
          </h4>
        </div>
        
        <div className="flex items-end mb-8">
          <span className="text-5xl font-bold">{currency}{price}</span>
          <span className="text-lg ml-2 pb-1">/{period.toLowerCase()}</span>
        </div>
        
        <ul className="mb-8 space-y-3">
          {features.map((feature, index) => {
            const isUnavailable = unavailableFeatures.includes(feature);
            return (
              <li key={index} className={`flex items-start ${isUnavailable ? 'opacity-60' : ''}`}>
                {isUnavailable ? (
                  <svg className="flex-shrink-0 w-5 h-5 mr-3 mt-0.5 text-gray-500" 
                       viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className={`flex-shrink-0 w-5 h-5 mr-3 mt-0.5 ${bestOffer ? 'text-gray-800' : 'text-yellow-400'}`} 
                       viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={isUnavailable ? 'line-through' : ''}>{feature}</span>
              </li>
            );
          })}
        </ul>
        
        <button
          className={`${
            bestOffer 
              ? 'bg-black text-white hover:bg-gray-900' 
              : 'bg-yellow-500 text-black hover:bg-yellow-400'
          } font-bold py-3 px-6 rounded-lg w-full transition-colors duration-300 uppercase tracking-wider shadow-md`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Prices;