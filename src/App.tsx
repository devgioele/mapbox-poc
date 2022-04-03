import WebMap from './WebMap';

export default function App() {
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
        <WebMap />
      </main>
    </div>
  );
}
