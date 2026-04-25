const BASE_URL = 'https://api.unsplash.com';
const API_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY; 

export const fetchWallpapers = async (query = '', page = 1) => {
  const endpoint = query 
    ? `${BASE_URL}/search/photos?query=${query}&page=${page}&per_page=20`
    : `${BASE_URL}/photos?page=${page}&per_page=20&order_by=latest`;

  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Client-ID ${API_KEY}` }
    });
    const data = await response.json();
    const results = query ? data.results : data;
    
    return results.map((item: any) => ({
      id: item.id,
      url: item.urls.regular,
      fullUrl: item.urls.full,
      height: Math.max(200, Math.floor(Math.random() * 150) + 200),
      title: item.description || item.alt_description || 'Untitled',
      author: item.user?.name || 'Unknown',
      authorAvatar: item.user?.profile_image?.small
    }));
  } catch (error) {
    console.error("Error fetching wallpapers:", error);
    return [];
  }
};

export const fetchTrending = async () => {
  try {
    const response = await fetch(`${BASE_URL}/photos?order_by=popular&per_page=10`, {
      headers: { Authorization: `Client-ID ${API_KEY}` }
    });
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      url: item.urls.regular,
      fullUrl: item.urls.full,
      // THIS FIXES THE CAROUSEL FAVORITES BUG:
      height: Math.max(200, Math.floor(Math.random() * 150) + 200), 
      title: item.alt_description || 'Trending',
      author: item.user?.name || 'Unknown'
    }));
  } catch (error) {
    console.error("Error fetching trending:", error);
    return [];
  }
};  