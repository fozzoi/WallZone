// app/layout.tsx
import './globals.css';
import Topbar from '@/components/Topbar';
import { SettingsProvider } from '@/context/SettingsContext';
import { FavoritesProvider } from '@/context/FavoritesContext';

export const metadata = {
  title: 'WallZone',
  description: 'Premium Wallpaper Desktop Client',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Block Ctrl + mouse wheel zooming
              window.addEventListener('wheel', function(e) {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                }
              }, { passive: false });

              // Block Ctrl + Plus / Minus / 0 zooming keys
              window.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '-' || e.key === '0' || e.key === '+')) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <SettingsProvider>
          <FavoritesProvider>
            <div style={styles.appContainer}>
              <Topbar />
              <main style={styles.mainContent}>
                {children}
              </main>
            </div>
          </FavoritesProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  mainContent: {
    paddingTop: '64px',
    flex: 1,
    height: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
};
