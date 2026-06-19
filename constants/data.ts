// Add this to your API file and export it
export interface Category {
  id: string;
  label: string;
  query: string;
  cover: string;
}

export interface CategoryGroup {
  title: string;
  items: Category[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: 'Trending',
    items: [
      { id: 'nature',   label: 'Nature',   query: 'nature landscape',         cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=75' },
      { id: 'space',    label: 'Space',    query: 'space galaxy cosmos',        cover: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=75' },
      { id: 'ocean',    label: 'Ocean',    query: 'ocean waves sea',            cover: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=75' },
      { id: 'city',     label: 'City',     query: 'cityscape night urban',      cover: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=75' },
    ],
  },
  {
    title: 'Cosmic',
    items: [
      { id: 'galaxy',   label: 'Galaxy',       query: 'milky way galaxy',            cover: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=800&q=75' },
      { id: 'aurora',   label: 'Aurora',       query: 'aurora borealis northern lights', cover: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=75' },
      { id: 'nebula',   label: 'Nebula',       query: 'nebula deep space',           cover: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=800&q=75' },
      { id: 'moon',     label: 'Moon',         query: 'moon night sky',              cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=75' },
    ],
  },
  {
    title: 'Urban & Architecture',
    items: [
      { id: 'tokyo',        label: 'Tokyo',        query: 'tokyo japan night street',  cover: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=75' },
      { id: 'neon',         label: 'Neon',         query: 'neon lights urban night',   cover: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=75' },
      { id: 'architecture', label: 'Architecture', query: 'architecture building',     cover: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=75' },
      { id: 'street',       label: 'Street',       query: 'rainy street alley night',  cover: 'https://images.unsplash.com/photo-1474224017046-182ece80b263?auto=format&fit=crop&w=800&q=75' },
    ],
  },
  {
    title: 'Aesthetic & Mood',
    items: [
      { id: 'anime',     label: 'Anime',             query: 'anime landscape scenery',       cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=75' },
      { id: 'sakura',    label: 'Sakura',            query: 'cherry blossom sakura japan',   cover: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?auto=format&fit=crop&w=800&q=75' },
      { id: 'cozy',      label: 'Cozy',              query: 'cozy interior warm fireplace',  cover: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=75' },
      { id: 'lofi',      label: 'Lo-fi',             query: 'lofi cozy aesthetic room',      cover: 'https://images.unsplash.com/photo-1511367461429-c7d9b294b6b6?auto=format&fit=crop&w=800&q=75' },
    ],
  },
  {
    title: 'Digital Art',
    items: [
      { id: 'abstract',  label: 'Abstract',  query: 'abstract art fluid colorful', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=75' },
      { id: 'geometric', label: 'Geometric', query: 'geometric pattern minimal',   cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=75' },
      { id: 'cyberpunk', label: 'Cyberpunk', query: 'cyberpunk futuristic neon',   cover: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=75' },
      { id: 'retrowave', label: 'Retrowave', query: 'synthwave retrowave 80s',     cover: 'https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?auto=format&fit=crop&w=800&q=75' },
    ],
  }
];