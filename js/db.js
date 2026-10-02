/**
 * SymptomTrackDB - High Performance IndexedDB Layer for iOS & Web
 * Supports unlimited local storage for diary entries, full-resolution photos,
 * heat cycle tracking for Milla & Bella, skin/rash logs, and weather archives.
 */

const DB_NAME = 'SymptomTrackDB_Regensburg';
const DB_VERSION = 1;

class SymptomDB {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Entries Store
        if (!db.objectStoreNames.contains('entries')) {
          const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
          entryStore.createIndex('date', 'date', { unique: false });
          entryStore.createIndex('profile', 'profile', { unique: false });
          entryStore.createIndex('profile_date', ['profile', 'date'], { unique: true });
          entryStore.createIndex('painLevel', 'painLevel', { unique: false });
        }

        // Photos Store
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('entryId', 'entryId', { unique: false });
          photoStore.createIndex('date', 'date', { unique: false });
          photoStore.createIndex('profile', 'profile', { unique: false });
        }

        // Weather Cache Store (93047 Regensburg 2016-2026)
        if (!db.objectStoreNames.contains('weatherCache')) {
          db.createObjectStore('weatherCache', { keyPath: 'date' });
        }

        // Profiles / Settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB Error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  // Create or Update Entry
  async saveEntry(entry) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['entries'], 'readwrite');
      const store = tx.objectStore('entries');
      
      // Composite ID: profile_date e.g. "human_2024-05-12"
      entry.id = `${entry.profile}_${entry.date}`;
      entry.updatedAt = new Date().toISOString();

      const request = store.put(entry);
      request.onsuccess = () => resolve(entry);
      request.onerror = () => reject(request.error);
    });
  }

  // Get Entry for a specific profile and date
  async getEntry(profile, date) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['entries'], 'readonly');
      const store = tx.objectStore('entries');
      const id = `${profile}_${date}`;
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all dates that have recorded entries (for calendar dots)
  async getEntryDates(profile = 'all') {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['entries'], 'readonly');
      const store = tx.objectStore('entries');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result || [];
        const dates = new Set();
        entries.forEach(e => {
          if (profile === 'all' || e.profile === profile) {
            if (e.date) dates.add(e.date);
          }
        });
        resolve(Array.from(dates));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get All Entries for a Date across all profiles
  async getEntriesForDate(date) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['entries'], 'readonly');
      const store = tx.objectStore('entries');
      const index = store.index('date');
      const request = index.getAll(date);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Query Entries with Filters (Search query, profile, date range, min severity)
  async queryEntries({ profile = 'all', search = '', severity = 'all', startDate = null, endDate = null } = {}) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['entries'], 'readonly');
      const store = tx.objectStore('entries');
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result || [];

        // Profile Filter
        if (profile && profile !== 'all') {
          results = results.filter(e => e.profile === profile);
        }

        // Date Range Filter
        if (startDate) {
          results = results.filter(e => e.date >= startDate);
        }
        if (endDate) {
          results = results.filter(e => e.date <= endDate);
        }

        // Severity / Filter Mode
        if (severity === 'high') {
          results = results.filter(e => Number(e.painIntensity || 0) >= 7 || Number(e.dogLameness || 0) >= 4 || Number(e.adhsLevel || 0) >= 7);
        } else if (severity === 'photos') {
          results = results.filter(e => e.photos && e.photos.length > 0);
        } else if (severity === 'heat') {
          results = results.filter(e => e.heatPhase && e.heatPhase !== 'keine');
        } else if (severity === 'adhs') {
          results = results.filter(e => (Number(e.adhsLevel || 0) > 0) || (e.adhsSymptoms && e.adhsSymptoms.length > 0));
        }

        // Search text
        if (search && search.trim() !== '') {
          const q = search.toLowerCase().trim();
          results = results.filter(e => {
            const str = [
              e.notes || '',
              e.medication || '',
              e.treatment || '',
              e.skinNotes || '',
              e.heatNotes || '',
              e.adhsNotes || '',
              e.episodeType || '',
              (e.adhsSymptoms || []).join(' '),
              (e.painTypes || []).join(' '),
              (e.skinSymptoms || []).join(' '),
              (e.dogSymptoms || []).join(' '),
              (e.limitations || []).join(' '),
              (e.bodyRegions || []).join(' ')
            ].join(' ').toLowerCase();
            return str.includes(q);
          });
        }

        // Sort by Date descending (newest first)
        results.sort((a, b) => b.date.localeCompare(a.date));
        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Save Photo
  async savePhoto(photoObj) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['photos'], 'readwrite');
      const store = tx.objectStore('photos');
      const request = store.put(photoObj);
      request.onsuccess = () => resolve(photoObj);
      request.onerror = () => reject(request.error);
    });
  }

  // Get Photos for an entry
  async getPhotos(entryId) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['photos'], 'readonly');
      const store = tx.objectStore('photos');
      const index = store.index('entryId');
      const request = index.getAll(entryId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete Photo
  async deletePhoto(photoId) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['photos'], 'readwrite');
      const store = tx.objectStore('photos');
      const request = store.delete(photoId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Weather Caching (Store full weather day object)
  async cacheWeather(date, weatherData) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['weatherCache'], 'readwrite');
      const store = tx.objectStore('weatherCache');
      const request = store.put({ date, data: weatherData, cachedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedWeather(date) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['weatherCache'], 'readonly');
      const store = tx.objectStore('weatherCache');
      const request = store.get(date);
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
      request.onerror = () => reject(request.error);
    });
  }

  // Full Export
  async exportFullBackup() {
    const db = await this.getDB();
    const tx = db.transaction(['entries', 'photos', 'weatherCache'], 'readonly');
    
    const entries = await new Promise(res => {
      tx.objectStore('entries').getAll().onsuccess = e => res(e.target.result);
    });
    const photos = await new Promise(res => {
      tx.objectStore('photos').getAll().onsuccess = e => res(e.target.result);
    });
    const weather = await new Promise(res => {
      tx.objectStore('weatherCache').getAll().onsuccess = e => res(e.target.result);
    });

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      location: '93047 Regensburg',
      profiles: ['human', 'buddy', 'milla', 'bella'],
      entries,
      photos,
      weather
    };
  }

  // Full Import
  async importFullBackup(backupData) {
    const db = await this.getDB();
    const tx = db.transaction(['entries', 'photos', 'weatherCache'], 'readwrite');

    if (backupData.entries && Array.isArray(backupData.entries)) {
      const entryStore = tx.objectStore('entries');
      for (const entry of backupData.entries) {
        entryStore.put(entry);
      }
    }

    if (backupData.photos && Array.isArray(backupData.photos)) {
      const photoStore = tx.objectStore('photos');
      for (const photo of backupData.photos) {
        photoStore.put(photo);
      }
    }

    if (backupData.weather && Array.isArray(backupData.weather)) {
      const weatherStore = tx.objectStore('weatherCache');
      for (const w of backupData.weather) {
        weatherStore.put(w);
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

window.symptomDB = new SymptomDB();
