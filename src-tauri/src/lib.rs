use tauri::{AppHandle, Manager, Emitter};
use serde::{Serialize, Deserialize};
use std::path::PathBuf;
use std::fs::File;
use std::io::Write;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct WallpaperData {
    pub id: String,
    pub fullUrl: String,
    pub download_location: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct ShuffleSettings {
    pub enabled: bool,
    pub intervalMs: u64,
    pub wallpapers: Vec<WallpaperData>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct SystemSettings {
    pub runInBackground: bool,
    pub startOnBoot: bool,
}

#[tauri::command]
async fn set_wallpaper(image_url: String) -> Result<bool, String> {
    // We use the reqwest crate to download the image to a temp file,
    // then use the wallpaper crate to set it.
    let response = reqwest::blocking::get(&image_url).map_err(|e| e.to_string())?;
    let bytes = response.bytes().map_err(|e| e.to_string())?;
    
    let temp_dir = std::env::temp_dir();
    let temp_path = temp_dir.join(format!("wallzone_manual_{}.jpg", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis()));
    
    let mut file = File::create(&temp_path).map_err(|e| e.to_string())?;
    file.write_all(&bytes).map_err(|e| e.to_string())?;
    
    // Convert path to string
    let path_str = temp_path.to_str().unwrap();
    
    wallpaper::set_from_path(path_str).map_err(|e| e.to_string())?;
    wallpaper::set_mode(wallpaper::Mode::Crop).map_err(|e| e.to_string())?;
    
    Ok(true)
}

#[tauri::command]
async fn update_shuffle_settings(settings: ShuffleSettings) -> Result<bool, String> {
    // Log settings
    println!("Shuffle settings updated: {:?}", settings);
    Ok(true)
}

#[tauri::command]
async fn update_system_settings(settings: SystemSettings) -> Result<bool, String> {
    println!("System settings updated: {:?}", settings);
    Ok(true)
}

#[tauri::command]
async fn trigger_shuffle() -> Result<bool, String> {
    // Trigger shuffle logic here
    println!("Shuffle triggered manually.");
    Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // Add tray if needed
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_wallpaper,
            update_shuffle_settings,
            update_system_settings,
            trigger_shuffle
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
