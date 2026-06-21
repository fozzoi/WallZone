'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Compass, Grid, Heart, Settings, Search, XCircle } from 'lucide-react';

const MENU_ITEMS = [
  { path: '/', label: 'Explore', icon: Compass },
  { path: '/discover', label: 'Discover', icon: Grid },
  { path: '/saved', label: 'Saved', icon: Heart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function TopbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchFocused, setSearchFocused] = useState(false);

  // Sync state if query param is removed or modified externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Debounce search update to prevent lag and excessive API queries
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParam = searchParams.get('q') || '';
      if (query.trim() !== currentParam) {
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) {
          params.set('q', query.trim());
        } else {
          params.delete('q');
        }
        
        // If not on Explore, route to explore with query
        if (pathname !== '/') {
          router.push(`/?${params.toString()}`);
        } else {
          router.replace(`/?${params.toString()}`);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    if (pathname !== '/') {
      router.push(`/?${params.toString()}`);
    } else {
      router.replace(`/?${params.toString()}`);
    }
  };

  return (
    <header className="topbar" style={styles.topbar}>
      {/* Brand Logo */}
      <div style={styles.brand}>
        <h1 style={styles.logoText}>
          Wall<span style={{ color: 'var(--text)' }}>Zone</span>
        </h1>
        <span style={styles.badge}>Desktop</span>
      </div>

      {/* Global Search Bar */}
      <div
        style={{
          ...styles.searchBox,
          ...(searchFocused ? styles.searchBoxFocused : {}),
        }}
      >
        <Search
          size={15}
          style={{
            marginRight: '8px',
            color: searchFocused ? 'var(--text)' : 'var(--text-sub)',
            transition: 'color 0.2s ease',
          }}
        />
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Search wallpapers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {query.length > 0 && (
          <button
            onClick={handleClear}
            style={styles.clearBtn}
            title="Clear search"
          >
            <XCircle size={15} style={{ color: 'var(--text-sub)' }} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={styles.nav}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
              <div
                className="nav-item-top"
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <Icon
                  size={15}
                  style={{
                    color: isActive ? 'var(--text)' : 'var(--text-sub)',
                    marginRight: '6px',
                    transition: 'color 0.2s ease',
                  }}
                />
                <span
                  style={{
                    color: isActive ? 'var(--text)' : 'var(--text-sub)',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '12px',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.label}
                </span>

                {/* Bottom Active Indicator Line */}
                {isActive && <div style={styles.activeIndicator} />}
              </div>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export default function Topbar() {
  return (
    <Suspense
      fallback={
        <header style={styles.topbar}>
          <div style={styles.brand}>
            <h1 style={styles.logoText}>
              Wall<span style={{ color: 'var(--text)' }}>Zone</span>
            </h1>
            <span style={styles.badge}>Desktop</span>
          </div>
        </header>
      }
    >
      <TopbarContent />
    </Suspense>
  );
}

const styles = {
  topbar: {
    position: 'fixed' as const,
    left: 0,
    top: 0,
    right: 0,
    height: '64px',
    backgroundColor: 'var(--sidebar-bg)',
    borderBottom: '1px solid var(--sidebar-border)',
    paddingLeft: '24px',
    paddingRight: '24px',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: 'var(--text-sub)',
  },
  badge: {
    fontSize: '9px',
    fontWeight: '700',
    backgroundColor: 'var(--accent-dim)',
    color: 'var(--text)',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '20px', // pill shaped search box is more elegant
    border: '1px solid var(--border)',
    paddingLeft: '14px',
    paddingRight: '14px',
    height: '36px',
    width: '280px',
    backgroundColor: 'var(--surface-elevated)',
    transition: 'border-color 0.2s ease, background-color 0.2s ease, width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  searchBoxFocused: {
    borderColor: 'var(--text)',
    backgroundColor: 'var(--surface)',
    width: '340px', // expands nicely
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    fontSize: '13px',
    height: '100%',
    width: '100%',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '4px',
    height: '100%',
    alignItems: 'center',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '6px',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    height: '36px',
  },
  navItemActive: {
    backgroundColor: 'var(--accent-dim)',
  },
  activeIndicator: {
    position: 'absolute' as const,
    left: '14px',
    right: '14px',
    bottom: '-14px',
    height: '3px',
    borderRadius: '1.5px',
    backgroundColor: 'var(--text)',
  },
};
