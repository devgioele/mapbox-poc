import { useState } from 'react';
import WebMap from './WebMap';

export default function App() {
  const [mapBoxToken, setMapBoxToken] = useState<string>('');
  const [appliedMapBoxToken, setAppliedMapBoxToken] = useState(mapBoxToken);

  const handleAccessToken = (accessToken: string) => {
    setMapBoxToken(accessToken);
  };

  const handleSubmitAccessToken = () => {
    setAppliedMapBoxToken(mapBoxToken);
  };

  return (
    <div
      className="bg-slate-900 h-full text-white"
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <header
        style={{
          flex: '1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p style={{ fontSize: 'xx-large' }}>React + MapBox = 🚀</p>
      </header>
      <main style={{ flex: '8 0 auto', padding: '2%', paddingTop: '0px' }}>
        <WebMap accessToken={import.meta.env.VITE_MAP_BOX} />
      </main>
    </div>
  );
}
