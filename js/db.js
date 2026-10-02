/**
 * SymptomTrackDB - High Performance IndexedDB Layer for iOS & Web
 * Supports unlimited local storage for diary entries, full-resolution photos,
 * heat cycle tracking for Milla & Bella, skin/rash logs, and weather archives.
 */

const DB_NAME = 'SymptomTrackDB_Regensburg';
const DB_VERSION = 1;

// Preloaded user backup dataset for immediate restore & offline availability
const USER_EMBEDDED_BACKUP = {
  version: "1.0",
  exportedAt: "2026-10-02T16:02:49.185Z",
  location: "93047 Regensburg",
  profiles: ["human", "buddy", "milla", "bella"],
  entries: [
    {
      profile: "human",
      date: "2026-08-14",
      weather: {
        date: "2026-08-14",
        location: "93047 Regensburg",
        weatherCode: 0,
        condition: "Klarer Himmel / Sonnig",
        icon: "☀️",
        tempMax: 32.2,
        tempMin: 17.7,
        tempMean: 25.1,
        uvIndex: 0,
        uvLevel: "Niedrig",
        uvLabel: "Kein Schutz nötig",
        uvClass: "uv-low",
        pressure: 980,
        rain: 0,
        wind: 8
      },
      painIntensity: 0,
      painJointsIntensity: 0,
      painSkinIntensity: 6,
      painMorning: "",
      painNoon: "",
      painEvening: "",
      painNight: "",
      isMultiDayEpisode: true,
      episodeType: "schmerz_schub",
      episodeStartDate: "2026-08-14",
      episodeEndDate: "2026-08-28",
      episodeDurationDays: "2 Wochen",
      painTypes: [
        "stechend",
        "dumpf",
        "brennend",
        "pulsierend",
        "ziehend",
        "juckend_schmerz"
      ],
      skinItch: 6,
      skinSymptoms: [
        "rötung",
        "ausschlag",
        "schwellung"
      ],
      skinNotes: "Cyndaclin",
      heatPhase: "keine",
      heatSymptoms: [],
      heatNotes: "",
      dogLameness: 0,
      dogSymptoms: [],
      bodyRegions: [
        "oberschenkel_re_v",
        "huefte_li_v",
        "bws_wirbelsaeule",
        "schulter_li_v",
        "schulter_re_v"
      ],
      limitationLevel: 5,
      limitations: [
        "gehen",
        "treppen",
        "buecken",
        "sitzen",
        "stehen",
        "schlaf",
        "haushalt",
        "gassi"
      ],
      medication: "Ibuprofen 800 , tilidin",
      treatment: "Zugsalbe Abszess",
      notes: "",
      adhsLevel: 0,
      adhsSymptoms: [],
      adhsNotes: "",
      photoCount: 0,
      photos: [],
      id: "human_2026-08-14",
      updatedAt: "2026-10-01T20:32:16.982Z"
    }
  ],
  photos: [],
  weather: [
    {
      date: "2025-12-31",
      data: {
        date: "2025-12-31",
        location: "93047 Regensburg",
        weatherCode: 71,
        condition: "Leichter Schneefall",
        icon: "🌨️",
        tempMax: 0.1,
        tempMin: -9.3,
        tempMean: -4.2,
        uvIndex: 0,
        uvLevel: "Niedrig",
        uvLabel: "Kein Schutz nötig",
        uvClass: "uv-low",
        pressure: 982,
        rain: 0.2,
        wind: 20
      },
      cachedAt: 1790899867145
    },
    {
      date: "2026-01-01",
      data: {
        date: "2026-01-01",
        location: "93047 Regensburg",
        weatherCode: 3,
        condition: "Bedeckt",
        icon: "☁️",
        tempMax: 1.6,
        tempMin: -2.6,
        tempMean: -0.2,
        uvIndex: 0,
        uvLevel: "Niedrig",
        uvLabel: "Kein Schutz nötig",
        uvClass: "uv-low",
        pressure: 970,
        rain: 0,
        wind: 20
      },
      cachedAt: 1790899831295
    },
    {
      date: "2026-01-02",
      data: {
        date: "2026-01-02",
        location: "93047 Regensburg",
        weatherCode: 73,
        condition: "Mäßiger Schneefall",
        icon: "🌨️",
        tempMax: 2.4,
        tempMin: -0.4,
        tempMean: 0.7,
        uvIndex: 0,
        uvLevel: "Niedrig",
        uvLabel: "Kein Schutz nötig",
        uvClass: "uv-low",
        pressure: 961,
        rain: 2.3,
        wind: 26
      },
      cachedAt: 1790899839613
    },
    {
      date: "2026-08-14",
      data: {
        date: "2026-08-14",
        location: "93047 Regensburg",
        weatherCode: 0,
        condition: "Klarer Himmel / Sonnig",
        icon: "☀️",
        tempMax: 32.2,
        tempMin: 17.7,
        tempMean: 25.1,
        uvIndex: 0,
        uvLevel: "Niedrig",
        uvLabel: "Kein Schutz nötig",
        uvClass: "uv-low",
        pressure: 980,
        rain: 0,
        wind: 8
      },
      cachedAt: 1790886637434
    },
    {
      date: "2026-10-01",
      data: {
        date: "2026-10-01",
        location: "93047 Regensburg",
        weatherCode: 45,
        condition: "Nebel",
        icon: "🌫️",
        tempMax: 24,
        tempMin: 5.8,
        tempMean: 15,
        uvIndex: 3.5,
        uvLevel: "Mäßig",
        uvLabel: "Sonnenschutz ratsam",
        uvClass: "uv-moderate",
        pressure: 983,
        rain: 0,
        wind: 8
      },
      cachedAt: 1790886398236
    },
    {
      date: "2026-10-02",
      data: {
        date: "2026-10-02",
        location: "93047 Regensburg",
        weatherCode: 61,
        condition: "Leichter Regen",
        icon: "🌧️",
        tempMax: 19.3,
        tempMin: 12.9,
        tempMean: 16,
        uvIndex: 2.9,
        uvLevel: "Niedrig",
        uvLabel: "Kein Schutz nötig",
        uvClass: "uv-low",
        pressure: 989,
        rain: 0.2,
        wind: 8
      },
      cachedAt: 1790899808272
    }
  ]
};

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

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        // Automatically ensure the user's dataset is seeded if missing
        await this.seedInitialDataIfEmpty();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB Error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async seedInitialDataIfEmpty() {
    try {
      const existing = await this.getEntry('human', '2026-08-14');
      if (!existing) {
        await this.importFullBackup(USER_EMBEDDED_BACKUP);
        console.log('✓ Embedded backup auto-seeded successfully!');
      }
    } catch (e) {
      console.warn('Seed check warning:', e);
    }
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

        // Severity / Category Filter
        if (severity && severity !== 'all') {
          if (severity === 'high') {
            results = results.filter(e => (e.painIntensity >= 7 || e.dogLameness >= 4));
          } else if (severity === 'moderate') {
            results = results.filter(e => (e.painIntensity >= 4 && e.painIntensity < 7) || (e.dogLameness >= 2 && e.dogLameness < 4));
          } else if (severity === 'low') {
            results = results.filter(e => (e.painIntensity < 4 && (e.dogLameness || 0) < 2));
          } else if (severity === 'heat') {
            results = results.filter(e => e.heatPhase && e.heatPhase !== 'keine');
          } else if (severity === 'skin') {
            results = results.filter(e => e.skinItch > 0 || (e.skinSymptoms && e.skinSymptoms.length > 0) || e.painSkinIntensity > 0);
          } else if (severity === 'adhs') {
            results = results.filter(e => e.adhsLevel > 0 || (e.adhsSymptoms && e.adhsSymptoms.length > 0) || e.adhsNotes);
          } else if (severity === 'episode') {
            results = results.filter(e => e.isMultiDayEpisode);
          }
        }

        // Free Text Search (Notes, meds, symptoms, limitations, weather)
        if (search && search.trim() !== '') {
          const q = search.toLowerCase().trim();
          results = results.filter(e => {
            const inNotes = (e.notes || '').toLowerCase().includes(q);
            const inAdhsNotes = (e.adhsNotes || '').toLowerCase().includes(q);
            const inMeds = (e.medication || '').toLowerCase().includes(q);
            const inTreat = (e.treatment || '').toLowerCase().includes(q);
            const inSkinNotes = (e.skinNotes || '').toLowerCase().includes(q);
            const inTypes = (e.painTypes || []).some(t => t.toLowerCase().includes(q));
            const inAdhs = (e.adhsSymptoms || []).some(s => s.toLowerCase().includes(q));
            const inSkin = (e.skinSymptoms || []).some(s => s.toLowerCase().includes(q));
            const inDogSymp = (e.dogSymptoms || []).some(s => s.toLowerCase().includes(q));
            const inLimits = (e.limitations || []).some(l => l.toLowerCase().includes(q));
            const inWeather = e.weather ? (e.weather.condition || '').toLowerCase().includes(q) : false;
            const inEpisode = (e.episodeDurationDays || '').toLowerCase().includes(q) || (e.episodeType || '').toLowerCase().includes(q);
            return inNotes || inAdhsNotes || inMeds || inTreat || inSkinNotes || inTypes || inAdhs || inSkin || inDogSymp || inLimits || inWeather || inEpisode;
          });
        }

        // Sort descending by date (newest first)
        results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Delete Entry
  async deleteEntry(profile, date) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['entries', 'photos'], 'readwrite');
      const entryStore = tx.objectStore('entries');
      const photoStore = tx.objectStore('photos');
      const id = `${profile}_${date}`;

      entryStore.delete(id);

      // Delete associated photos
      const photoIndex = photoStore.index('entryId');
      const photoReq = photoIndex.getAll(id);
      photoReq.onsuccess = () => {
        const photos = photoReq.result || [];
        photos.forEach(p => photoStore.delete(p.id));
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Photos Management
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

  async deletePhoto(photoId) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['photos'], 'readwrite');
      const store = tx.objectStore('photos');
      const request = store.delete(photoId);
      request.onsuccess = () => resolve(true);
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

  // Full Import with automatic schema migration & normalization
  async importFullBackup(backupData) {
    if (typeof backupData === 'string') {
      backupData = JSON.parse(backupData);
    }

    const db = await this.getDB();
    const tx = db.transaction(['entries', 'photos', 'weatherCache'], 'readwrite');

    if (backupData.entries && Array.isArray(backupData.entries)) {
      const entryStore = tx.objectStore('entries');
      for (let entry of backupData.entries) {
        // Normalize fields
        if (!entry.id) {
          entry.id = `${entry.profile || 'human'}_${entry.date}`;
        }
        if (entry.painJointsIntensity === undefined) {
          entry.painJointsIntensity = entry.painIntensity !== undefined ? entry.painIntensity : 0;
        }
        if (entry.painSkinIntensity === undefined) {
          entry.painSkinIntensity = entry.skinItch !== undefined ? entry.skinItch : 0;
        }
        
        // Map legacy body regions
        if (entry.bodyRegions && Array.isArray(entry.bodyRegions)) {
          entry.bodyRegions = entry.bodyRegions.map(r => {
            if (r === 'oberer_ruecken') return 'bws_wirbelsaeule';
            if (r === 'unterer_ruecken') return 'lws_wirbelsaeule';
            if (r === 'gesaess') return 'gesaess_li';
            if (r === 'knie_li') return 'patella_li';
            if (r === 'knie_re') return 'patella_re';
            return r;
          });
        }

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
