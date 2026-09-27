import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.08] py-8 text-center mt-20">
      <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} STUDIO. All rights reserved.</p>
    </footer>
  );
};

export default Footer;