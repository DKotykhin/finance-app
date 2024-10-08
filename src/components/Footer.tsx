import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 dark:bg-blue-800 w-full px-4 lg:px-8">
      <div className='max-w-screen-2xl mx-auto flex justify-end items-center h-full py-4'>
        <p className='text-white text-lg'>&copy; {new Date().getFullYear()} Finance</p>
      </div>
    </footer>
  );
};

export default Footer;
