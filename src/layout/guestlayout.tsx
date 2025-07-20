import React from 'react';
import Header from '../components/header';

const GuestLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-pink-50">
      <Header role="guest" />
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
};

export default GuestLayout;
