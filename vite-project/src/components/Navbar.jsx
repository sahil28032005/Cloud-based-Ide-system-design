import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you are using React Router
import { Button } from "@/components/ui/button"; // Shadcn Button component

const Navbar = () => {
  return (
    <nav className="bg-gray-900 p-4 shadow-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">My Cloud IDE</h1>
        <div className="space-x-4">
          <Link to="/features">
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all">
              Features
            </Button>
          </Link>
          <Link to="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
