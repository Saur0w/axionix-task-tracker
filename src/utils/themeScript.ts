export const THEME_STORAGE_KEY = 'axionix_theme';

/**
 * Runs in <head> before first paint (see app/layout.tsx), so a saved light theme
 * never flashes dark. Accepts both JSON (`"light"`) and legacy plain (`light`) values.
 * Lives outside the 'use client' ThemeContext so the server layout can import the string.
 */
export const themeInitScript = `(function(){try{var v=localStorage.getItem("${THEME_STORAGE_KEY}");try{v=JSON.parse(v)}catch(e){}if(v==="light"||v==="dark")document.documentElement.setAttribute("data-theme",v)}catch(e){}})()`;
