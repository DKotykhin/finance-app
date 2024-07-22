import React from 'react';

const Footer = () => {
  return (
    <div className="bg-blue-600 h-[60px] w-full px-4 lg:px-8">
      <div className='max-w-screen-2xl mx-auto flex justify-end items-center h-full'>
        <p className='text-white text-lg'>&copy; {new Date().getFullYear()} Finance</p>
      </div>
    </div>
  );
};

export default Footer;
