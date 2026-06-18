declare module 'react-native-manage-wallpaper' {
  export const TYPE: {
    HOME: 'home';
    LOCK: 'lock';
    BOTH: 'both';
  };

  export interface ManageWallpaperType {
    setWallpaper: (
      source: any,
      callback?: (res: any) => void,
      type?: 'home' | 'lock' | 'both'
    ) => void;
  }

  const ManageWallpaper: ManageWallpaperType;
  export { ManageWallpaper };
  export default ManageWallpaper;
}
