import React from 'react';
import Header from '../components/header';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header role="admin" />
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
