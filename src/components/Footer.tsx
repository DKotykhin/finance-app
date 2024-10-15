import React from 'react';

import Link from 'next/link';

import { Globe, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 dark:bg-blue-800 w-full px-4 lg:px-8">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center h-full py-4">
        <p className="text-white text-lg">&copy; {new Date().getFullYear()} Finance</p>
        <div className="flex items-center gap-2">
          <Link href="https://dmytro-kotykhin.pp.ua" target="_blank">
            <Globe className="text-white ml-4 hover:scale-110" size={20} />
          </Link>
          <Link href="https://github.com/DKotykhin" target="_blank">
            <Github className="text-white ml-4 hover:scale-110" size={20} />
          </Link>
          <Link href="mailto:kotykhin_d@ukr.net" target="_blank">
            <Mail className="text-white ml-4 hover:scale-110" size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
