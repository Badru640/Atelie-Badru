import React from 'react';

const InviteLocations: React.FC = () => {
  return (
    <div className="space-y-10 mt-10">
      {/* Local da Igreja */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">🏡 Cerimônia Religiosa</h2>
        <p className="text-gray-700 mb-1">Igreja Evangélica Luterana em Moçambique</p>
        <p className="text-gray-700 mb-3">Av. Kim il Sung, n.º 520 – Maputo</p>
        <p className="text-gray-600 mb-3">⏰ <strong>Hora:</strong> 10h
        </p>
        <div className="w-full h-64 rounded-md overflow-hidden">
          <iframe
            title="Mapa Igreja"
            src="https://www.google.com/maps?q=Av.+Kim+Il+Sung,+520,+Maputo&output=embed"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
            className="border-none w-full h-full"
          />
        </div>
      </div>

      {/* Local da Recepção */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">🍽️ Recepção</h2>
        <p className="text-gray-700 mb-1">Buffet Vila do Sol</p>
        <p className="text-gray-700 mb-3">Rua do Entardecer, 123 - Maputo</p>
        <p className="text-gray-600 mb-3">⏰ <strong>Hora:</strong> 13h
        </p>
        <div className="w-full h-64 rounded-md overflow-hidden">
          <iframe
            title="Mapa Recepção"
            src="https://www.google.com/maps?q=Rua+do+Entardecer,+123,+Maputo&output=embed"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
            className="border-none w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default InviteLocations;
