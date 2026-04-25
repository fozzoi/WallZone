const BASE_URL = 'https://api.unsplash.com';
const API_KEY = '87nkD30-nZafdfFVpYyMeHw8Ka_gC66r2k1qUVQah5A'; 
const APP_NAME = 'WallzoneApp';

const BLOCKED_TERMS = /\b(human|humans|person|people|man|woman|men|women|boy|girl|child|children|kid|kids|baby|babies|toddler|friends|family|group|portrait|selfie|face|faces|kitchen|office|desk|laptop|meeting|team|coffee|mug|cup|lifestyle|ai|ai-generated|microsoft|windows)\b/i;

// --- CURATED LIST (Covers removed to allow dynamic fetching) ---
const CUSTOM_TOPICS = [
  { id: 'abstract-white', label: 'Abstract White', query: 'abstract white illustrations vector' },
  { id: 'pattern-background', label: 'Patterns', query: 'pattern background texture illustration' },
  { id: 'motion-graphics', label: 'Motion', query: '3d abstract render motion graphics' },
  { id: 'abstract', label: 'Abstract Art', query: 'abstract illustrations vector art' }, // Updated per request
  { id: 'geometric-shapes', label: 'Geometric', query: 'geometric shapes vector illustration' },
  { id: 'white-background', label: 'Clean White', query: 'pure white aesthetic illustration' },
  { id: 'black-background', label: 'AMOLED Dark', query: 'black dark amoled aesthetic background' },
  { id: 'orange-background', label: 'Orange', query: 'orange aesthetic illustrations' },
  { id: 'ocean-wallpaper', label: 'Ocean', query: 'ocean sea water aerial' },
  { id: 'tree-wallpaper', label: 'Forest', query: 'forest trees nature wallpaper' },
  { id: 'satellite-images', label: 'Satellite', query: 'earth satellite space photos' },
  { id: 'texture-water', label: 'Water', query: 'water ripples texture surface' },
  { id: 'underwater-bubbles', label: 'Bubbles', query: 'underwater bubbles water texture' },
  { id: 'ethereal', label: 'Ethereal', query: 'ethereal moon stars night sky' },
  { id: 'texture', label: 'Textures', query: 'macro texture aesthetic pattern' }
];

// --- UTILS ---
const mapUnsplashItem = (item) => {
  const urlParts = item.urls.regular.split('?');
  const urlParams = new URLSearchParams(urlParts.length > 1 ? urlParts[1] : '');
  const ixid = urlParams.get('ixid') || '';

  return {
    id: item.id,
    url: `${item.urls.raw}&ixid=${ixid}&auto=format,compress&q=75&fit=crop&w=1080&h=1920`,
    fullUrl: `${item.urls.raw}&ixid=${ixid}&auto=format,compress&q=75&fit=crop&w=2160&h=3840`,
    height: Math.max(200, Math.floor(Math.random() * 150) + 200),
    title: item.description || item.alt_description || 'Untitled',
    author: item.user?.name || 'Unknown',
    authorAvatar: item.user?.profile_image?.small,
    authorProfile: `https://unsplash.com/@${item.user?.username}?utm_source=${APP_NAME}&utm_medium=referral`,
    downloadLocation: item.links.download_location
  };
};

// --- API FUNCTIONS ---

// 1. Explore Mix (Improved Shuffling)
export const fetchWallpapers = async (query = '', page = 1) => {
  try {
    if (!query) {
      // Pick 4 random topics to mix
      const randomTopics = [...CUSTOM_TOPICS].sort(() => 0.5 - Math.random()).slice(0, 4);
      
      const promises = randomTopics.map(topic => {
        const endpoint = `${BASE_URL}/search/photos?query=${encodeURIComponent(topic.query + ' -person')}&page=${page}&per_page=12&orientation=portrait&content_filter=high`;
        return fetch(endpoint, { headers: { 'Authorization': `Client-ID ${API_KEY}` } }).then(res => res.json());
      });

      const responses = await Promise.all(promises);
      const allResults = responses.flatMap(r => r.results || []);
      
      // FISHER-YATES SHUFFLE for better randomness
      for (let i = allResults.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allResults[i], allResults[j]] = [allResults[j], allResults[i]];
      }

      return allResults.map(mapUnsplashItem);
    }

    const endpoint = `${BASE_URL}/search/photos?query=${encodeURIComponent(query + ' -person')}&page=${page}&per_page=30&orientation=portrait&content_filter=high`;
    const response = await fetch(endpoint, { headers: { 'Authorization': `Client-ID ${API_KEY}` } });
    const data = await response.json();
    return (data.results || []).map(mapUnsplashItem);

  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
};

// 2. Dynamic Categories (Fetches a fresh cover for each category)
export const fetchCuratedTopics = async (page = 1) => {
  if (page > 1) return [];

  try {
    // We fetch the first image for every topic to use as a dynamic cover
    const promises = CUSTOM_TOPICS.map(async (topic) => {
      const endpoint = `${BASE_URL}/search/photos?query=${encodeURIComponent(topic.query)}&page=1&per_page=1&orientation=portrait`;
      const res = await fetch(endpoint, { headers: { 'Authorization': `Client-ID ${API_KEY}` } });
      const data = await res.json();
      const coverUrl = data.results?.[0]?.urls?.small || ''; // Dynamic cover
      
      return {
        id: topic.id,
        label: topic.label,
        cover: coverUrl,
        query: topic.query
      };
    });

    return await Promise.all(promises);
  } catch (error) {
    console.error("Error fetching dynamic covers:", error);
    return CUSTOM_TOPICS.map(t => ({ ...t, cover: '' }));
  }
};

// 3. Category Specific Fetch
export const fetchTopicAssets = async (topicSlug, page = 1) => {
  const topic = CUSTOM_TOPICS.find(t => t.id === topicSlug) || CUSTOM_TOPICS[0];
  return await fetchWallpapers(topic.query, page);
};

export const triggerDownloadBeacon = async (url) => {
  try { await fetch(`${url}&client_id=${API_KEY}`); } catch (e) {}
};