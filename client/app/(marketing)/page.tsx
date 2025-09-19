"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            BallroomCompManager
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The complete platform for managing ballroom dance competitions. 
            Streamline registration, scheduling, judging, and results.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/product"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Easy Registration</h3>
            <p className="text-gray-600">
              Streamlined competitor registration with automated categorization and payment processing.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Real-time Judging</h3>
            <p className="text-gray-600">
              Digital judging interface with instant score calculation and result publication.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Complete Management</h3>
            <p className="text-gray-600">
              Full competition lifecycle management from planning to final results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}