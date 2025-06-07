
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
      <div className="w-10 h-10 flex items-center justify-center">
        <img 
          src="https://eghaglafhlqajdktorjb.supabase.co/storage/v1/object/sign/files/loyablee%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNzdkNmM5OS0yOWE0LTRkNzEtYTViOS0yNmFkYjRjMDRlYWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxlcy9sb3lhYmxlZSBsb2dvLnBuZyIsImlhdCI6MTc0OTMxNDM1MywiZXhwIjoxNzQ5OTE5MTUzfQ.1H5sEQPDIPw5O-zdzDgLUEt_VM4KLpYIFH_0BKXx3PE" 
          alt="Loyable" 
          className="w-10 h-10 object-contain"
        />
      </div>
      <span className="text-xl font-bold text-gray-900 hidden sm:block">Loyable</span>
    </Link>
  );
};

export default Logo;
