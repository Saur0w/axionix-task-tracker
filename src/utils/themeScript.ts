export const THEME_STORAGE_KEY = 'axionix_theme';

export const themeInitScript = `(function(){try{var v=localStorage.getItem("${THEME_STORAGE_KEY}");try{v=JSON.parse(v)}catch(e){}if(v==="light"||v==="dark")document.documentElement.setAttribute("data-theme",v)}catch(e){}})()`;
