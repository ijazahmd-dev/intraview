// src/components/CandidateFooter.jsx




import React from 'react';

export default function CandidateFooter() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap justify-center space-x-8 mb-6">
                    <a href="#" className="hover:text-white">Home</a>
                    <a href="#" className="hover:text-white">About</a>
                    <a href="#" className="hover:text-white">Blog</a>
                    <a href="#" className="hover:text-white">FAQ</a>
                    <a href="#" className="hover:text-white">Interview</a>
                    <a href="#" className="hover:text-white">Support</a>
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                </div>
                <p className="text-center text-sm">
                    © 2025 IntraView. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
