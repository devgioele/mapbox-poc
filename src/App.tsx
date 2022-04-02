import { useEffect, useState } from 'react';

export default function App() {
  const [color, setColor] = useState('blue');

  useEffect(() => {
    console.log(color);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        justifyContent: 'center',
        color: '#ffffff',
        textAlign: 'center',
        height: '100%',
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
        <p style={{ fontSize: 'xx-large' }}>Love and create!🚀</p>
      </header>
      <main style={{ flex: '8 0 auto', padding: '2%', paddingTop: '0px' }}>
        <a
          style={{ fontSize: 'x-large' }}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </main>
    </div>
  );
}
