// app/layout.tsx
import './globals.css';
import Topbar from '@/components/Topbar';
import { SettingsProvider } from '@/context/SettingsContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ExploreProvider } from '@/context/ExploreContext';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", inter.variable)}>
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
            <ExploreProvider>
              <div style={styles.appContainer}>
                <Topbar />
                <main style={styles.mainContent}>
                  {children}
                </main>
              </div>
            </ExploreProvider>
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
