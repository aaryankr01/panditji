// A unified safe storage utility that uses both localStorage and cookies for maximum reliability on all mobile and desktop browsers.

const isLocalStorageAvailable = (() => {
  try {
    localStorage.setItem('__storage_test__', '1');
    localStorage.removeItem('__storage_test__');
    return true;
  } catch (e) {
    return false;
  }
})();

const memStore = {};

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(value || "")}${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

export const storage = {
  get: (key) => {
    // 1. Try LocalStorage
    if (isLocalStorageAvailable) {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    }
    // 2. Try Cookie
    const cookieVal = getCookie(key);
    if (cookieVal !== null) return cookieVal;
    // 3. Try In-memory
    return memStore[key] ?? null;
  },

  set: (key, value, days = 5) => {
    // 1. Save to LocalStorage
    if (isLocalStorageAvailable) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('LocalStorage set failed, falling back to Cookie:', e);
      }
    }
    // 2. Save to Cookie
    setCookie(key, value, days);
    // 3. Save to In-memory
    memStore[key] = value;
  },

  remove: (key) => {
    // 1. Remove from LocalStorage
    if (isLocalStorageAvailable) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
    // 2. Remove Cookie
    removeCookie(key);
    // 3. Remove In-memory
    delete memStore[key];
  }
};
