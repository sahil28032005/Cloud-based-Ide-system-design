import React from 'react';
import Navbar from "./Navbar"; // Ensure you have a navbar component
import { Button } from "@/components/ui/button"; // Shadcn Button component
import { Card } from "@/components/ui/card"; // Shadcn Card component
import './Home.css'; // Optional: for additional styling

const HomePage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <header className="flex flex-col items-center justify-center py-24 lg:py-32 bg-gradient-to-br from-blue-900 to-gray-800">
        <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 text-center tracking-tight">
          Welcome to My Cloud IDE
        </h1>
        <p className="text-xl lg:text-2xl mb-10 text-center text-gray-300 max-w-3xl px-6 lg:px-0">
          A powerful development environment right in your browser, designed for teams and individual developers.
        </p>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg px-6 py-3 rounded-lg shadow-lg transition-all">
          Get Started
        </Button>
      </header>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-24">
        <h2 className="text-4xl lg:text-5xl font-bold mb-12 text-center tracking-tight">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Real-time Collaboration",
              description: "Work together with your team in real-time on projects.",
            },
            {
              title: "Instant Deployment",
              description: "Deploy your projects with a single click.",
            },
            {
              title: "Integrated File Management",
              description: "Easily manage your files and folders in the cloud.",
            },
            {
              title: "Multi-language Support",
              description: "Supports various programming languages and frameworks.",
            },
            {
              title: "Secure Cloud Storage",
              description: "Store your projects securely in the cloud.",
            },
            {
              title: "Customizable Environment",
              description: "Personalize your IDE settings to match your workflow.",
            },
          ].map((feature, index) => (
            <Card key={index} className="bg-gray-800 p-8 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-300 text-lg">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-800 to-gray-900">
        <h2 className="text-4xl lg:text-5xl font-bold mb-12 text-center tracking-tight">
          What Our Users Say
        </h2>
        <div className="flex flex-col items-center justify-center px-6 lg:px-0 space-y-12">
          {[
            {
              name: "Alice Johnson",
              feedback: "This IDE has transformed my development process!",
            },
            {
              name: "Bob Smith",
              feedback: "The collaboration features are top-notch.",
            },
            {
              name: "Carol White",
              feedback: "I love the seamless deployment options.",
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-md max-w-xl mx-auto text-center">
              <p className="text-xl italic mb-4">"{testimonial.feedback}"</p>
              <p className="font-semibold text-lg">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-center">
        <p className="text-gray-400 text-lg">
          © {new Date().getFullYear()} My Cloud IDE. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
