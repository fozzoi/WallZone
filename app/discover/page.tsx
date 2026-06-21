'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchCategories } from '@/services/api';
import { contentCache } from '@/services/cache';

export default function DiscoverPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCats = useCallback(async (options: { refresh?: boolean; silent?: boolean } = {}) => {
    const { refresh = false, silent = false } = options;

    if (!silent && !refresh) {
      const cached = await contentCache.getCategories();
      if (cached?.length) {
        setCategories(cached);
        setLoading(false);
      }
    }

    if (!silent && !refresh) setLoading(true);
    try {
      const data = await fetchCategories(refresh);
      setCategories(data);
      await contentCache.setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCats({ refresh: true });
  }, [loadCats]);

  // Dynamic 3 column split
  const columnsData = Array.from({ length: 3 }, (_, colIndex) =>
    categories.filter((_, itemIndex) => itemIndex % 3 === colIndex)
  );

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.scrollArea}>
        {/* Clean Inline Header */}
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Discover Categories</h2>
          <p style={styles.pageSubtitle}>{categories.length} collections curated for desktop customization</p>
        </div>

        {loading && categories.length === 0 ? (
          <div style={styles.centerSpinner}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={styles.grid}>
            {columnsData.map((colData, colIndex) => (
              <div key={colIndex} style={styles.column}>
                {colData.map((item, idx) => {
                  const isTall = (idx + colIndex) % 2 === 0;
                  const height = isTall ? '230px' : '172px';

                  return (
                    <Link
                      key={item.id}
                      href={{
                        pathname: '/view-all',
                        query: {
                          query: item.id,
                          title: item.label,
                          isCategory: '1',
                        },
                      }}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="category-card"
                        style={{ ...styles.card, height }}
                      >
                        {item.cover && (
                          <img
                            src={item.cover}
                            alt={item.label}
                            style={styles.cardImage}
                            loading="lazy"
                          />
                        )}
                        <div style={styles.cardGradient} />
                        <div style={styles.labelWrapper}>
                          <div style={styles.labelPill}>
                            <span style={styles.labelText}>{item.label}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '32px 24px',
  },
  pageHeader: {
    marginBottom: '28px',
    paddingLeft: '4px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: 'var(--text)',
  },
  pageSubtitle: {
    fontSize: '12px',
    color: 'var(--text-sub)',
    marginTop: '4px',
  },
  centerSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '240px',
  },
  grid: {
    display: 'flex',
    gap: '16px',
    width: '100%',
  },
  column: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  card: {
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative' as const,
    boxShadow: 'var(--card-shadow)',
    backgroundColor: 'var(--card)',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
    transition: 'transform 0.3s ease',
  },
  cardGradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
    pointerEvents: 'none' as const,
  },
  labelWrapper: {
    position: 'absolute' as const,
    bottom: '12px',
    left: '12px',
    right: '12px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  labelPill: {
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  labelText: {
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.6px',
  },
};
