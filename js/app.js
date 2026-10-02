/**
 * SymptomTrack App Controller
 * Full iOS PWA logic with Multi-Profile, Historical Weather (Regensburg 93047),
 * Skin/Haut tracking, Dog Heat Cycles (Milla & Bella), Photo Gallery & Reports.
 */

class SymptomApp {
  constructor() {
    this.currentProfile = 'human'; // 'human', 'buddy', 'milla', 'bella'
    this.currentDate = this.getTodayDateString();
    this.currentEntry = null;
    this.currentWeather = null;
    this.currentPhotos = []; // Array of { id, dataUrl, name, createdAt }
    this.activeTab = 'entry';

    this.init();
  }

  getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async init() {
    this.bindDOM();
    this.setupTheme();
    this.setupNavigation();
    this.setupProfileSelector();
    this.setupDateNavigator();
    this.setupCalendarModal();
    this.setupFormListeners();
    this.setupPhotoHandlers();
    this.setupHistoryFilters();
    this.setupAnalytics();
    this.setupExportAndBackup();
    
    // Initialize interactive body map
    window.bodyMapManager.init((selectedRegions) => {
      this.onBodyRegionsChanged(selectedRegions);
    });

    // Populate Year Jump Grid (2016 - 2026)
    this.renderYearGrid();

    // Initial load
    this.updateDateDisplay();
    await this.loadDateAndProfileData();
  }

  bindDOM() {
    this.dom = {
      // Header & Nav
      profileSelector: document.getElementById('profileSelector'),
      dateDisplayWrapper: document.getElementById('dateDisplayWrapper'),
      currentDateInput: document.getElementById('currentDateInput'),
      currentDateFormatted: document.getElementById('currentDateFormatted'),
      btnPrevDay: document.getElementById('btnPrevDay'),
      btnNextDay: document.getElementById('btnNextDay'),
      btnOpenCalendar: document.getElementById('btnOpenCalendar'),
      btnJumpToday: document.getElementById('btnJumpToday'),
      btnJumpYear: document.getElementById('btnJumpYear'),
      yearSelectorDropdown: document.getElementById('yearSelectorDropdown'),
      yearGrid: document.getElementById('yearGrid'),
      btnThemeToggle: document.getElementById('btnThemeToggle'),
      btnExportMenu: document.getElementById('btnExportMenu'),
      tabButtons: document.querySelectorAll('.tab-item'),
      tabViews: document.querySelectorAll('.tab-view'),

      // Interactive Calendar Modal
      calendarModal: document.getElementById('calendarModal'),
      btnCloseCalendarModal: document.getElementById('btnCloseCalendarModal'),
      btnCalClose: document.getElementById('btnCalClose'),
      btnCalGoToday: document.getElementById('btnCalGoToday'),
      calPrevMonth: document.getElementById('calPrevMonth'),
      calNextMonth: document.getElementById('calNextMonth'),
      calMonthSelect: document.getElementById('calMonthSelect'),
      calYearSelect: document.getElementById('calYearSelect'),
      calQuickYears: document.getElementById('calQuickYears'),
      calendarDaysGrid: document.getElementById('calendarDaysGrid'),

      // Weather Widget
      weatherWidget: document.getElementById('weatherWidget'),
      weatherLoading: document.getElementById('weatherLoading'),
      weatherContent: document.getElementById('weatherContent'),
      weatherIcon: document.getElementById('weatherIcon'),
      weatherTemp: document.getElementById('weatherTemp'),
      weatherCondition: document.getElementById('weatherCondition'),
      uvBadge: document.getElementById('uvBadge'),
      uvValue: document.getElementById('uvValue'),
      uvStatus: document.getElementById('uvStatus'),
      weatherPressure: document.getElementById('weatherPressure'),
      weatherRain: document.getElementById('weatherRain'),
      weatherTempRange: document.getElementById('weatherTempRange'),
      weatherWind: document.getElementById('weatherWind'),

      // Entry Form Elements: Separate Pain Sliders
      entryForm: document.getElementById('entryForm'),
      painScaleTitle: document.getElementById('painScaleTitle'),
      painScoreBadge: document.getElementById('painScoreBadge'),
      painJointsInput: document.getElementById('painJointsInput'),
      painJointsBadge: document.getElementById('painJointsBadge'),
      painSkinInput: document.getElementById('painSkinInput'),
      painSkinBadge: document.getElementById('painSkinBadge'),
      painTypeChips: document.getElementById('painTypeChips'),
      
      // Daytime pain & Multi-Day / Dauerschmerz
      painMorning: document.getElementById('painMorning'),
      painNoon: document.getElementById('painNoon'),
      painEvening: document.getElementById('painEvening'),
      painNight: document.getElementById('painNight'),
      isMultiDayEpisode: document.getElementById('isMultiDayEpisode'),
      multiDayDetails: document.getElementById('multiDayDetails'),
      episodeTypeChips: document.getElementById('episodeTypeChips'),
      durationPresetChips: document.getElementById('durationPresetChips'),
      episodeStartDateInput: document.getElementById('episodeStartDateInput'),
      episodeEndDateInput: document.getElementById('episodeEndDateInput'),
      episodeDurationDays: document.getElementById('episodeDurationDays'),
      btnApplyMultiDayPeriod: document.getElementById('btnApplyMultiDayPeriod'),
      
      // ADHS Section (Human)
      adhsSection: document.getElementById('adhsSection'),
      adhsSlider: document.getElementById('adhsSlider'),
      adhsValBadge: document.getElementById('adhsValBadge'),
      adhsScorePill: document.getElementById('adhsScorePill'),
      adhsSymptomChips: document.getElementById('adhsSymptomChips'),
      adhsNotes: document.getElementById('adhsNotes'),

      // Skin Section (Human)
      skinSection: document.getElementById('skinSection'),
      skinItchInput: document.getElementById('skinItchInput'),
      skinItchValBadge: document.getElementById('skinItchValBadge'),
      skinScorePill: document.getElementById('skinScorePill'),
      skinSymptomChips: document.getElementById('skinSymptomChips'),
      skinNotes: document.getElementById('skinNotes'),

      // Dog Heat Cycle Section (Milla & Bella)
      heatCycleSection: document.getElementById('heatCycleSection'),
      heatStatusBadge: document.getElementById('heatStatusBadge'),
      heatPhaseChips: document.getElementById('heatPhaseChips'),
      heatSymptomChips: document.getElementById('heatSymptomChips'),
      heatCycleNotes: document.getElementById('heatCycleNotes'),

      // Dog Mobility Section (Buddy, Milla, Bella)
      dogMobilitySection: document.getElementById('dogMobilitySection'),
      dogLamenessInput: document.getElementById('dogLamenessInput'),
      dogLamenessBadge: document.getElementById('dogLamenessBadge'),
      dogGaitBadge: document.getElementById('dogGaitBadge'),
      dogSymptomChips: document.getElementById('dogSymptomChips'),

      // Body Maps & Quick Chips
      humanBodyMapWrapper: document.getElementById('humanBodyMapWrapper'),
      dogBodyMapWrapper: document.getElementById('dogBodyMapWrapper'),
      bodyQuickChips: document.getElementById('bodyQuickChips'),

      // Limitations
      limitationSlider: document.getElementById('limitationSlider'),
      limitationScoreBadge: document.getElementById('limitationScoreBadge'),
      limitationChips: document.getElementById('limitationChips'),

      // Photos
      photoCameraInput: document.getElementById('photoCameraInput'),
      photoGalleryInput: document.getElementById('photoGalleryInput'),
      attachedPhotosGrid: document.getElementById('attachedPhotosGrid'),
      photoCountBadge: document.getElementById('photoCountBadge'),

      // Notes & Medication & Presets
      medPresetsPain: document.getElementById('medPresetsPain'),
      medPresetsAdhs: document.getElementById('medPresetsAdhs'),
      medPresetsDog: document.getElementById('medPresetsDog'),
      medicationInput: document.getElementById('medicationInput'),
      treatmentInput: document.getElementById('treatmentInput'),
      notesInput: document.getElementById('notesInput'),

      // Save & Status
      btnSaveEntry: document.getElementById('btnSaveEntry'),
      saveStatusMsg: document.getElementById('saveStatusMsg'),

      // History Tab
      historyListContainer: document.getElementById('historyListContainer'),
      historySearchInput: document.getElementById('historySearchInput'),
      filterProfileButtons: document.querySelectorAll('[data-filter-profile]'),
      filterSeverityButtons: document.querySelectorAll('[data-filter-severity]'),

      // Analytics Tab
      statTotalEntries: document.getElementById('statTotalEntries'),
      statAvgPain: document.getElementById('statAvgPain'),
      statUvCorrelation: document.getElementById('statUvCorrelation'),
      statPressureCorrelation: document.getElementById('statPressureCorrelation'),
      correlationChart: document.getElementById('correlationChart'),
      topSymptomsList: document.getElementById('topSymptomsList'),

      // Export & Backup
      exportStartDate: document.getElementById('exportStartDate'),
      exportEndDate: document.getElementById('exportEndDate'),
      exportProfileSelect: document.getElementById('exportProfileSelect'),
      btnGenerateReport: document.getElementById('btnGenerateReport'),
      btnRestoreEmbeddedBackup: document.getElementById('btnRestoreEmbeddedBackup'),
      btnExportBackup: document.getElementById('btnExportBackup'),
      importBackupFile: document.getElementById('importBackupFile'),
      btnOpenPasteBackupModal: document.getElementById('btnOpenPasteBackupModal'),
      pasteBackupContainer: document.getElementById('pasteBackupContainer'),
      pasteBackupText: document.getElementById('pasteBackupText'),
      btnApplyPasteBackup: document.getElementById('btnApplyPasteBackup'),
      btnCancelPasteBackup: document.getElementById('btnCancelPasteBackup'),
      reportModal: document.getElementById('reportModal'),
      printableReportBody: document.getElementById('printableReportBody'),
      btnPrintReport: document.getElementById('btnPrintReport'),
      btnCloseReportModal: document.getElementById('btnCloseReportModal'),

      // Photo Modal
      photoModal: document.getElementById('photoModal'),
      photoModalImg: document.getElementById('photoModalImg'),
      photoModalCaption: document.getElementById('photoModalCaption'),
      btnClosePhotoModal: document.getElementById('btnClosePhotoModal')
    };
  }

  // =========================================================================
  // Theme & Navigation
  // =========================================================================
  setupTheme() {
    const savedTheme = localStorage.getItem('symptom_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);

    this.dom.btnThemeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('symptom_theme', next);
      this.updateThemeIcon(next);
      if (this.activeTab === 'analytics') this.renderAnalyticsChart();
    });
  }

  updateThemeIcon(theme) {
    const icon = this.dom.btnThemeToggle.querySelector('.theme-icon') || this.dom.btnThemeToggle;
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  setupNavigation() {
    this.dom.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    this.dom.btnExportMenu.addEventListener('click', () => {
      this.switchTab('export');
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.dom.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    this.dom.tabViews.forEach(view => {
      view.classList.toggle('active', view.id === `tab-${tabName}`);
    });

    // Refresh content for selected tab
    if (tabName === 'history') {
      this.renderHistoryList();
    } else if (tabName === 'analytics') {
      this.renderAnalytics();
    }
  }

  // =========================================================================
  // Profile Switching & UI Adaptation
  // =========================================================================
  setupProfileSelector() {
    const chips = this.dom.profileSelector.querySelectorAll('.profile-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', async () => {
        const profile = chip.getAttribute('data-profile');
        if (profile === this.currentProfile) return;

        chips.forEach(c => c.classList.toggle('active', c === chip));
        this.currentProfile = profile;
        this.adaptUIForCurrentProfile();
        await this.loadDateAndProfileData();
      });
    });
  }

  adaptUIForCurrentProfile() {
    const isHuman = this.currentProfile === 'human';
    const isFemaleDog = this.currentProfile === 'milla' || this.currentProfile === 'bella';
    const isDog = this.currentProfile === 'buddy' || isFemaleDog;

    // Show/Hide Sections
    if (this.dom.adhsSection) this.dom.adhsSection.style.display = isHuman ? 'block' : 'none';
    if (this.dom.skinSection) this.dom.skinSection.style.display = isHuman ? 'block' : 'none';
    if (this.dom.dogMobilitySection) this.dom.dogMobilitySection.style.display = isDog ? 'block' : 'none';
    if (this.dom.heatCycleSection) this.dom.heatCycleSection.style.display = isFemaleDog ? 'block' : 'none';

    // Medication Categories
    document.querySelectorAll('.med-preset-category.human-only-section').forEach(el => {
      el.style.display = isHuman ? 'block' : 'none';
    });
    document.querySelectorAll('.med-preset-category.dog-only-section').forEach(el => {
      el.style.display = isDog ? 'block' : 'none';
    });

    // Body Maps
    this.dom.humanBodyMapWrapper.style.display = isHuman ? 'block' : 'none';
    this.dom.dogBodyMapWrapper.style.display = isDog ? 'block' : 'none';

    // Titles
    if (isHuman) {
      this.dom.painScaleTitle.textContent = 'Schmerzintensität (NRS 0–10)';
    } else {
      const dogName = this.currentProfile.charAt(0).toUpperCase() + this.currentProfile.slice(1);
      this.dom.painScaleTitle.textContent = `Schmerz- & Unruhelevel für ${dogName} (0–10)`;
    }
  }

  // =========================================================================
  // Date Navigation & Interactive Calendar Modal (2010 - 2030)
  // =========================================================================
  setupDateNavigator() {
    this.dom.currentDateInput.value = this.currentDate;

    // Clicking date wrapper or calendar button opens interactive calendar modal
    if (this.dom.dateDisplayWrapper) {
      this.dom.dateDisplayWrapper.addEventListener('click', () => this.openCalendarModal());
    }
    if (this.dom.currentDateFormatted) {
      this.dom.currentDateFormatted.addEventListener('click', () => this.openCalendarModal());
    }
    if (this.dom.btnOpenCalendar) {
      this.dom.btnOpenCalendar.addEventListener('click', () => this.openCalendarModal());
    }

    this.dom.currentDateInput.addEventListener('change', async (e) => {
      if (e.target.value) {
        this.currentDate = e.target.value;
        this.updateDateDisplay();
        await this.loadDateAndProfileData();
      }
    });

    this.dom.btnPrevDay.addEventListener('click', async () => {
      this.changeDateByDays(-1);
    });

    this.dom.btnNextDay.addEventListener('click', async () => {
      this.changeDateByDays(1);
    });

    this.dom.btnJumpToday.addEventListener('click', async () => {
      this.currentDate = this.getTodayDateString();
      this.dom.currentDateInput.value = this.currentDate;
      this.updateDateDisplay();
      await this.loadDateAndProfileData();
    });

    this.dom.btnJumpYear.addEventListener('click', () => {
      const isVisible = this.dom.yearSelectorDropdown.style.display !== 'none';
      this.dom.yearSelectorDropdown.style.display = isVisible ? 'none' : 'block';
    });
  }

  // =========================================================================
  // Interactive Calendar Modal Controller
  // =========================================================================
  setupCalendarModal() {
    if (!this.dom.calendarModal) return;

    const parts = this.currentDate.split('-');
    this.calViewYear = parseInt(parts[0], 10) || new Date().getFullYear();
    this.calViewMonth = (parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1; // 0-indexed

    this.populateCalSelects();
    this.populateCalQuickYears();

    // Close button listeners
    if (this.dom.btnCloseCalendarModal) {
      this.dom.btnCloseCalendarModal.addEventListener('click', () => this.closeCalendarModal());
    }
    if (this.dom.btnCalClose) {
      this.dom.btnCalClose.addEventListener('click', () => this.closeCalendarModal());
    }
    this.dom.calendarModal.addEventListener('click', (e) => {
      if (e.target === this.dom.calendarModal) this.closeCalendarModal();
    });

    // Month Navigation buttons
    if (this.dom.calPrevMonth) {
      this.dom.calPrevMonth.addEventListener('click', () => {
        this.calViewMonth--;
        if (this.calViewMonth < 0) {
          this.calViewMonth = 11;
          this.calViewYear--;
        }
        this.updateCalSelectValues();
        this.renderCalendarDays();
      });
    }

    if (this.dom.calNextMonth) {
      this.dom.calNextMonth.addEventListener('click', () => {
        this.calViewMonth++;
        if (this.calViewMonth > 11) {
          this.calViewMonth = 0;
          this.calViewYear++;
        }
        this.updateCalSelectValues();
        this.renderCalendarDays();
      });
    }

    // Select change listeners
    if (this.dom.calMonthSelect) {
      this.dom.calMonthSelect.addEventListener('change', (e) => {
        this.calViewMonth = parseInt(e.target.value, 10);
        this.renderCalendarDays();
      });
    }
    if (this.dom.calYearSelect) {
      this.dom.calYearSelect.addEventListener('change', (e) => {
        this.calViewYear = parseInt(e.target.value, 10);
        this.highlightActiveQuickYear();
        this.renderCalendarDays();
      });
    }

    // "Heute" button inside calendar
    if (this.dom.btnCalGoToday) {
      this.dom.btnCalGoToday.addEventListener('click', async () => {
        this.currentDate = this.getTodayDateString();
        this.dom.currentDateInput.value = this.currentDate;
        this.updateDateDisplay();
        this.closeCalendarModal();
        await this.loadDateAndProfileData();
      });
    }
  }

  populateCalSelects() {
    if (!this.dom.calMonthSelect || !this.dom.calYearSelect) return;

    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    this.dom.calMonthSelect.innerHTML = monthNames.map((name, i) => `<option value="${i}">${name}</option>`).join('');

    const currentYear = new Date().getFullYear();
    let yearOptions = '';
    // Support from 2010 to 2030 for deep past history documentation
    for (let y = 2010; y <= currentYear + 2; y++) {
      yearOptions += `<option value="${y}">${y}</option>`;
    }
    this.dom.calYearSelect.innerHTML = yearOptions;

    this.updateCalSelectValues();
  }

  updateCalSelectValues() {
    if (this.dom.calMonthSelect) this.dom.calMonthSelect.value = String(this.calViewMonth);
    if (this.dom.calYearSelect) this.dom.calYearSelect.value = String(this.calViewYear);
    this.highlightActiveQuickYear();
  }

  populateCalQuickYears() {
    if (!this.dom.calQuickYears) return;

    const currentYear = new Date().getFullYear();
    let pillsHtml = '';
    for (let y = 2016; y <= currentYear; y++) {
      pillsHtml += `<button type="button" class="cal-year-pill ${y === this.calViewYear ? 'active' : ''}" data-year="${y}">${y}</button>`;
    }
    this.dom.calQuickYears.innerHTML = pillsHtml;

    this.dom.calQuickYears.querySelectorAll('.cal-year-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.calViewYear = parseInt(btn.getAttribute('data-year'), 10);
        this.updateCalSelectValues();
        this.renderCalendarDays();
      });
    });
  }

  highlightActiveQuickYear() {
    if (!this.dom.calQuickYears) return;
    this.dom.calQuickYears.querySelectorAll('.cal-year-pill').forEach(btn => {
      const y = parseInt(btn.getAttribute('data-year'), 10);
      btn.classList.toggle('active', y === this.calViewYear);
    });
  }

  async openCalendarModal() {
    if (!this.dom.calendarModal) return;

    const parts = this.currentDate.split('-');
    this.calViewYear = parseInt(parts[0], 10) || new Date().getFullYear();
    this.calViewMonth = (parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1;

    this.updateCalSelectValues();
    this.dom.calendarModal.style.display = 'flex';
    await this.renderCalendarDays();
  }

  closeCalendarModal() {
    if (this.dom.calendarModal) {
      this.dom.calendarModal.style.display = 'none';
    }
  }

  async renderCalendarDays() {
    if (!this.dom.calendarDaysGrid) return;

    // Fetch dates that have entries for dot indicators
    let recordedDates = new Set();
    try {
      if (window.symptomDB) {
        const dates = await window.symptomDB.getEntryDates(this.currentProfile);
        recordedDates = new Set(dates);
      }
    } catch (err) {
      console.warn('Could not load entry dates for calendar:', err);
    }

    const year = this.calViewYear;
    const month = this.calViewMonth;
    const todayStr = this.getTodayDateString();

    // First day of current month (0=Sun, 1=Mon, ..., 6=Sat)
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay(); // 0 is Sunday
    // Convert to Monday=0, Sunday=6
    startDay = (startDay === 0) ? 6 : startDay - 1;

    // Number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Number of days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let gridHtml = '';

    // 1. Previous month trailing days
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDayNum = daysInPrevMonth - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYearNum = month === 0 ? year - 1 : year;
      const dateStr = `${prevYearNum}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`;
      gridHtml += `
        <div class="cal-day-cell other-month" data-date="${dateStr}">
          <span>${prevDayNum}</span>
        </div>
      `;
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = dateStr === this.currentDate;
      const isToday = dateStr === todayStr;
      const hasEntry = recordedDates.has(dateStr);

      gridHtml += `
        <div class="cal-day-cell ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''} ${hasEntry ? 'has-entry' : ''}" data-date="${dateStr}">
          <span>${d}</span>
          ${hasEntry ? '<span class="cal-dot-indicator" title="Eintrag vorhanden"></span>' : ''}
        </div>
      `;
    }

    // 3. Next month leading days (fill up grid to full weeks, 35 or 42 cells)
    const totalCells = startDay + daysInMonth;
    const remainingCells = (totalCells % 7 === 0) ? 0 : (7 - (totalCells % 7));
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYearNum = month === 11 ? year + 1 : year;
      const dateStr = `${nextYearNum}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      gridHtml += `
        <div class="cal-day-cell other-month" data-date="${dateStr}">
          <span>${d}</span>
        </div>
      `;
    }

    this.dom.calendarDaysGrid.innerHTML = gridHtml;

    // Attach click handlers to all day cells
    this.dom.calendarDaysGrid.querySelectorAll('.cal-day-cell').forEach(cell => {
      cell.addEventListener('click', async () => {
        const dateStr = cell.getAttribute('data-date');
        if (!dateStr) return;

        this.currentDate = dateStr;
        this.dom.currentDateInput.value = this.currentDate;
        this.updateDateDisplay();
        this.closeCalendarModal();
        await this.loadDateAndProfileData();
      });
    });
  }

  renderYearGrid() {
    const currentYear = new Date().getFullYear();
    let html = '';
    // 2010 through current year + 1
    for (let y = 2010; y <= currentYear; y++) {
      html += `<button type="button" class="year-grid-btn ${String(y) === this.currentDate.split('-')[0] ? 'active' : ''}" data-year="${y}">${y}</button>`;
    }
    this.dom.yearGrid.innerHTML = html;

    this.dom.yearGrid.querySelectorAll('.year-grid-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const year = btn.getAttribute('data-year');
        const parts = this.currentDate.split('-');
        this.currentDate = `${year}-${parts[1] || '01'}-${parts[2] || '01'}`;
        this.dom.currentDateInput.value = this.currentDate;
        this.dom.yearSelectorDropdown.style.display = 'none';
        this.updateDateDisplay();
        await this.loadDateAndProfileData();
      });
    });
  }

  changeDateByDays(days) {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + days);
    
    // Clamp to min 2010-01-01 for past history
    const minDate = new Date('2010-01-01');
    if (d < minDate) return;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this.currentDate = `${year}-${month}-${day}`;
    this.dom.currentDateInput.value = this.currentDate;
    this.updateDateDisplay();
    this.loadDateAndProfileData();
  }

  updateDateDisplay() {
    const d = new Date(this.currentDate + 'T12:00:00');
    const options = { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' };
    const formatted = d.toLocaleDateString('de-DE', options);
    this.dom.currentDateFormatted.textContent = `📅 ${formatted}`;
  }

  async loadWeatherForCurrentDate() {
    this.dom.weatherLoading.style.display = 'flex';
    this.dom.weatherContent.style.display = 'none';

    try {
      const weather = await window.weatherService.getWeatherForDate(this.currentDate);
      this.currentWeather = weather;

      if (weather) {
        this.dom.weatherIcon.textContent = weather.icon || '☀️';
        this.dom.weatherTemp.textContent = `${weather.tempMean}°C`;
        this.dom.weatherCondition.textContent = `${weather.condition} • ${weather.location}`;
        
        // UV Badge
        this.dom.uvValue.textContent = weather.uvIndex;
        this.dom.uvStatus.textContent = `${weather.uvLevel} (${weather.uvLabel})`;
        this.dom.uvBadge.className = `uv-badge ${weather.uvClass}`;

        // Details
        this.dom.weatherPressure.textContent = `${weather.pressure} hPa`;
        this.dom.weatherRain.textContent = `${weather.rain} mm`;
        this.dom.weatherTempRange.textContent = `${weather.tempMin}° / ${weather.tempMax}°C`;
        this.dom.weatherWind.textContent = `${weather.wind} km/h`;

        this.dom.weatherLoading.style.display = 'none';
        this.dom.weatherContent.style.display = 'block';
      }
    } catch (err) {
      console.error('Weather load error:', err);
      this.dom.weatherLoading.innerHTML = `<span>⚠️ Wetterdaten für 93047 Regensburg offline</span>`;
    }
  }

  // =========================================================================
  // Data Loading & Form Population
  // =========================================================================
  async loadDateAndProfileData() {
    // 1. Fetch & display weather for 93047 Regensburg on this date
    await this.loadWeatherForCurrentDate();

    // 2. Fetch entry from IndexedDB
    const entry = await window.symptomDB.getEntry(this.currentProfile, this.currentDate);
    this.currentEntry = entry;

    // 3. Populate form
    this.populateFormWithEntry(entry);

    // 4. Fetch attached photos
    const entryId = `${this.currentProfile}_${this.currentDate}`;
    this.currentPhotos = await window.symptomDB.getPhotos(entryId);
    this.renderAttachedPhotos();
  }

  populateFormWithEntry(entry) {
    this.resetFormToDefaults();

    if (!entry) return;

    // Separate Pain Sliders (Knochen/Gelenke & Haut/Dermatologie)
    const jointsVal = entry.painJointsIntensity !== undefined ? entry.painJointsIntensity : (entry.painIntensity !== undefined ? entry.painIntensity : 0);
    const skinVal = entry.painSkinIntensity !== undefined ? entry.painSkinIntensity : (entry.skinItch !== undefined ? entry.skinItch : 0);

    if (this.dom.painJointsInput) {
      this.dom.painJointsInput.value = jointsVal;
    }
    if (this.dom.painSkinInput) {
      this.dom.painSkinInput.value = skinVal;
    }
    this.updateDualPainBadges();

    // Daytime Pain
    if (entry.painMorning !== undefined) this.dom.painMorning.value = entry.painMorning;
    if (entry.painNoon !== undefined) this.dom.painNoon.value = entry.painNoon;
    if (entry.painEvening !== undefined) this.dom.painEvening.value = entry.painEvening;
    if (entry.painNight !== undefined) this.dom.painNight.value = entry.painNight;

    // Multi-Day Episode / Dauerschmerz
    if (entry.isMultiDayEpisode) {
      this.dom.isMultiDayEpisode.checked = true;
      this.dom.multiDayDetails.style.display = 'block';
      if (entry.episodeType) {
        this.selectSingleChip(this.dom.episodeTypeChips, entry.episodeType);
      }
      if (entry.episodeStartDate) {
        this.dom.episodeStartDateInput.value = entry.episodeStartDate;
      }
      if (entry.episodeEndDate) {
        this.dom.episodeEndDateInput.value = entry.episodeEndDate;
      }
      if (entry.episodeDurationDays) {
        this.dom.episodeDurationDays.value = entry.episodeDurationDays;
        if (this.dom.durationPresetChips) {
          this.dom.durationPresetChips.querySelectorAll('.duration-chip').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-val').toLowerCase() === entry.episodeDurationDays.toLowerCase());
          });
        }
      }
    }

    // Pain Chips
    if (entry.painTypes && Array.isArray(entry.painTypes)) {
      this.selectChips(this.dom.painTypeChips, entry.painTypes);
    }

    // ADHS (Human)
    if (entry.adhsLevel !== undefined && this.dom.adhsSlider) {
      this.dom.adhsSlider.value = entry.adhsLevel;
      this.dom.adhsValBadge.textContent = entry.adhsLevel;
      this.updateAdhsBadge(entry.adhsLevel);
    }
    if (entry.adhsSymptoms && Array.isArray(entry.adhsSymptoms)) {
      this.selectChips(this.dom.adhsSymptomChips, entry.adhsSymptoms);
    }
    if (entry.adhsNotes && this.dom.adhsNotes) {
      this.dom.adhsNotes.value = entry.adhsNotes;
    }

    // Skin (Human)
    if (entry.skinItch !== undefined) {
      this.dom.skinItchInput.value = entry.skinItch;
      this.dom.skinItchValBadge.textContent = entry.skinItch;
      this.updateSkinScorePill(entry.skinItch);
    }
    if (entry.skinSymptoms && Array.isArray(entry.skinSymptoms)) {
      this.selectChips(this.dom.skinSymptomChips, entry.skinSymptoms);
    }
    if (entry.skinNotes) {
      this.dom.skinNotes.value = entry.skinNotes;
    }

    // Dog Heat Cycle (Milla / Bella)
    if (entry.heatPhase) {
      this.selectSingleChip(this.dom.heatPhaseChips, entry.heatPhase);
      this.updateHeatStatusBadge(entry.heatPhase);
    }
    if (entry.heatSymptoms && Array.isArray(entry.heatSymptoms)) {
      this.selectChips(this.dom.heatSymptomChips, entry.heatSymptoms);
    }
    if (entry.heatNotes) {
      this.dom.heatCycleNotes.value = entry.heatNotes;
    }

    // Dog Mobility
    if (entry.dogLameness !== undefined) {
      this.dom.dogLamenessInput.value = entry.dogLameness;
      this.updateDogLamenessBadge(entry.dogLameness);
    }
    if (entry.dogSymptoms && Array.isArray(entry.dogSymptoms)) {
      this.selectChips(this.dom.dogSymptomChips, entry.dogSymptoms);
    }

    // Body Map & Quick chips
    if (entry.bodyRegions && Array.isArray(entry.bodyRegions)) {
      window.bodyMapManager.setRegions(entry.bodyRegions);
    }

    // Limitations
    if (entry.limitationLevel !== undefined) {
      this.dom.limitationSlider.value = entry.limitationLevel;
      this.updateLimitationBadge(entry.limitationLevel);
    }
    if (entry.limitations && Array.isArray(entry.limitations)) {
      this.selectChips(this.dom.limitationChips, entry.limitations);
    }

    // Notes & Meds
    if (entry.medication) {
      this.dom.medicationInput.value = entry.medication;
      this.syncMedicationChips();
    }
    if (entry.treatment) this.dom.treatmentInput.value = entry.treatment;
    if (entry.notes) this.dom.notesInput.value = entry.notes;
  }

  resetFormToDefaults() {
    if (this.dom.painJointsInput) this.dom.painJointsInput.value = 0;
    if (this.dom.painSkinInput) this.dom.painSkinInput.value = 0;
    this.updateDualPainBadges();
    this.unselectAllChips(this.dom.painTypeChips);

    this.dom.painMorning.value = '';
    this.dom.painNoon.value = '';
    this.dom.painEvening.value = '';
    this.dom.painNight.value = '';

    this.dom.isMultiDayEpisode.checked = false;
    this.dom.multiDayDetails.style.display = 'none';
    this.selectSingleChip(this.dom.episodeTypeChips, 'schmerz_schub');
    this.dom.episodeStartDateInput.value = this.currentDate;
    this.dom.episodeEndDateInput.value = this.currentDate;
    this.dom.episodeDurationDays.value = '';
    if (this.dom.durationPresetChips) {
      this.dom.durationPresetChips.querySelectorAll('.duration-chip').forEach(c => c.classList.remove('active'));
    }

    if (this.dom.adhsSlider) {
      this.dom.adhsSlider.value = 0;
      this.dom.adhsValBadge.textContent = '0';
      this.updateAdhsBadge(0);
      this.unselectAllChips(this.dom.adhsSymptomChips);
      if (this.dom.adhsNotes) this.dom.adhsNotes.value = '';
    }

    this.dom.skinItchInput.value = 0;
    this.dom.skinItchValBadge.textContent = '0';
    this.updateSkinScorePill(0);
    this.unselectAllChips(this.dom.skinSymptomChips);
    this.dom.skinNotes.value = '';

    this.selectSingleChip(this.dom.heatPhaseChips, 'keine');
    this.updateHeatStatusBadge('keine');
    this.unselectAllChips(this.dom.heatSymptomChips);
    this.dom.heatCycleNotes.value = '';

    this.dom.dogLamenessInput.value = 0;
    this.updateDogLamenessBadge(0);
    this.unselectAllChips(this.dom.dogSymptomChips);

    window.bodyMapManager.clear();

    this.dom.limitationSlider.value = 0;
    this.updateLimitationBadge(0);
    this.unselectAllChips(this.dom.limitationChips);

    this.dom.medicationInput.value = '';
    this.syncMedicationChips();
    this.dom.treatmentInput.value = '';
    this.dom.notesInput.value = '';
    this.dom.saveStatusMsg.textContent = '';
  }

  // =========================================================================
  // Form Listeners & Interactive Sliders/Chips
  // =========================================================================
  setupFormListeners() {
    // Separate Pain Sliders (Knochen/Gelenke & Haut/Dermatologie)
    if (this.dom.painJointsInput) {
      this.dom.painJointsInput.addEventListener('input', () => {
        this.updateDualPainBadges();
      });
    }

    if (this.dom.painSkinInput) {
      this.dom.painSkinInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (this.dom.skinItchInput) {
          this.dom.skinItchInput.value = val;
          this.dom.skinItchValBadge.textContent = val;
          this.updateSkinScorePill(val);
        }
        this.updateDualPainBadges();
      });
    }

    // Multi-Day Episode Checkbox & Date/Duration Calculations
    if (this.dom.isMultiDayEpisode) {
      this.dom.isMultiDayEpisode.addEventListener('change', (e) => {
        this.dom.multiDayDetails.style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked) {
          if (!this.dom.episodeStartDateInput.value) this.dom.episodeStartDateInput.value = this.currentDate;
          if (!this.dom.episodeEndDateInput.value) this.dom.episodeEndDateInput.value = this.currentDate;
        }
      });
    }

    if (this.dom.episodeTypeChips) {
      this.dom.episodeTypeChips.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.dom.episodeTypeChips.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
        });
      });
    }

    if (this.dom.durationPresetChips) {
      this.dom.durationPresetChips.querySelectorAll('.duration-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const daysAttr = chip.getAttribute('data-days');
          const val = chip.getAttribute('data-val');
          this.dom.episodeDurationDays.value = val;
          this.dom.durationPresetChips.querySelectorAll('.duration-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');

          const numDays = parseInt(daysAttr, 10);
          if (numDays > 0) {
            const startVal = this.dom.episodeStartDateInput.value || this.currentDate;
            this.dom.episodeStartDateInput.value = startVal;
            const startDate = new Date(startVal + 'T12:00:00');
            startDate.setDate(startDate.getDate() + (numDays - 1));
            const y = startDate.getFullYear();
            const m = String(startDate.getMonth() + 1).padStart(2, '0');
            const d = String(startDate.getDate()).padStart(2, '0');
            this.dom.episodeEndDateInput.value = `${y}-${m}-${d}`;
          }
        });
      });
    }

    if (this.dom.episodeStartDateInput && this.dom.episodeEndDateInput) {
      const onDateChange = () => {
        const start = this.dom.episodeStartDateInput.value;
        const end = this.dom.episodeEndDateInput.value;
        if (start && end) {
          const d1 = new Date(start + 'T12:00:00');
          const d2 = new Date(end + 'T12:00:00');
          const diffTime = d2 - d1;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          if (diffDays > 0) {
            this.dom.episodeDurationDays.value = `${diffDays} Tag${diffDays === 1 ? '' : 'e'} (${start} bis ${end})`;
          }
        }
      };
      this.dom.episodeStartDateInput.addEventListener('change', onDateChange);
      this.dom.episodeEndDateInput.addEventListener('change', onDateChange);
    }

    if (this.dom.btnApplyMultiDayPeriod) {
      this.dom.btnApplyMultiDayPeriod.addEventListener('click', async () => {
        await this.applyMultiDayPeriodToAllDays();
      });
    }

    // ADHS Slider
    if (this.dom.adhsSlider) {
      this.dom.adhsSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        this.dom.adhsValBadge.textContent = val;
        this.updateAdhsBadge(val);
      });
    }

    // Skin Slider (also syncs with painSkinInput)
    this.dom.skinItchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      this.dom.skinItchValBadge.textContent = val;
      if (this.dom.painSkinInput) {
        this.dom.painSkinInput.value = val;
      }
      this.updateSkinScorePill(val);
      this.updateDualPainBadges();
    });

    // Dog Lameness Slider
    this.dom.dogLamenessInput.addEventListener('input', (e) => {
      this.updateDogLamenessBadge(e.target.value);
    });

    // Limitation Slider
    this.dom.limitationSlider.addEventListener('input', (e) => {
      this.updateLimitationBadge(e.target.value);
    });

    // Setup Multi-Select Chip groups
    [this.dom.painTypeChips, this.dom.adhsSymptomChips, this.dom.skinSymptomChips, this.dom.dogSymptomChips, this.dom.heatSymptomChips, this.dom.limitationChips].forEach(group => {
      if (!group) return;
      group.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('selected');
        });
      });
    });

    // Setup Medication Presets Chips (Click to append / remove from input)
    document.querySelectorAll('.med-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const medName = chip.getAttribute('data-med');
        if (!medName) return;
        this.toggleMedicationName(medName);
      });
    });

    if (this.dom.medicationInput) {
      this.dom.medicationInput.addEventListener('input', () => {
        this.syncMedicationChips();
      });
    }

    // Setup Single-Select Heat Phase Chips
    if (this.dom.heatPhaseChips) {
      this.dom.heatPhaseChips.querySelectorAll('.cycle-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.dom.heatPhaseChips.querySelectorAll('.cycle-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          this.updateHeatStatusBadge(chip.getAttribute('data-val'));
        });
      });
    }

    // Save Entry Form
    this.dom.entryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveCurrentEntry();
    });
  }

  updateDualPainBadges() {
    const jointsNum = this.dom.painJointsInput ? parseInt(this.dom.painJointsInput.value, 10) : 0;
    const skinNum = this.dom.painSkinInput ? parseInt(this.dom.painSkinInput.value, 10) : 0;

    if (this.dom.painJointsBadge) {
      this.dom.painJointsBadge.textContent = `${jointsNum}/10`;
    }
    if (this.dom.painSkinBadge) {
      this.dom.painSkinBadge.textContent = `${skinNum}/10`;
    }

    const maxVal = Math.max(jointsNum, skinNum);
    this.updatePainBadge(maxVal, jointsNum, skinNum);
  }

  updatePainBadge(maxVal, jointsNum = null, skinNum = null) {
    const num = parseInt(maxVal, 10);
    const j = jointsNum !== null ? jointsNum : (this.dom.painJointsInput ? parseInt(this.dom.painJointsInput.value, 10) : num);
    const s = skinNum !== null ? skinNum : (this.dom.painSkinInput ? parseInt(this.dom.painSkinInput.value, 10) : 0);

    let summaryText = `${num}/10`;
    if (num === 0) {
      summaryText = '0 - Schmerzfrei';
    } else {
      summaryText = `Max: ${num}/10 (🦴 ${j} | 🧴 ${s})`;
    }

    this.dom.painScoreBadge.textContent = summaryText;
    this.dom.painScoreBadge.className = 'pain-score-display';
    if (num >= 7) {
      this.dom.painScoreBadge.classList.add('severe');
    } else if (num >= 4) {
      this.dom.painScoreBadge.classList.add('moderate');
    }
  }

  updateSkinScorePill(val) {
    const num = parseInt(val, 10);
    if (num === 0) {
      this.dom.skinScorePill.textContent = 'Kein Juckreiz/Hautschmerz';
      this.dom.skinScorePill.style.color = 'var(--text-secondary)';
    } else if (num <= 3) {
      this.dom.skinScorePill.textContent = `Leicht (${num}/10)`;
      this.dom.skinScorePill.style.color = '#38bdf8';
    } else if (num <= 6) {
      this.dom.skinScorePill.textContent = `Mäßig (${num}/10)`;
      this.dom.skinScorePill.style.color = '#fbbf24';
    } else {
      this.dom.skinScorePill.textContent = `Stark entzündet/juckend (${num}/10)`;
      this.dom.skinScorePill.style.color = '#f43f5e';
    }
  }

  updateDogLamenessBadge(val) {
    const num = parseInt(val, 10);
    const labels = [
      '0 - Flott & Schmerzfrei',
      '1 - Leichtes Ticken / Steif',
      '2 - Sichtbare Lahmheit im Schritt',
      '3 - Deutliche Entlastung / Hinken',
      '4 - Bein kaum belastet',
      '5 - Dreibeiniger Gang / Akut'
    ];
    this.dom.dogLamenessBadge.textContent = labels[num] || `${num}/5`;
    this.dom.dogGaitBadge.textContent = num === 0 ? 'Normal' : `Grad ${num} Lahmheit`;
    this.dom.dogGaitBadge.style.color = num === 0 ? 'var(--accent-emerald)' : '#f87171';
  }

  updateHeatStatusBadge(phase) {
    const map = {
      'keine': { text: 'Inaktiv', color: 'var(--text-muted)' },
      'vorbrunst': { text: '🩸 1. Vorbrunst (Blutung)', color: '#f43f5e' },
      'standhitze': { text: '💖 2. Standhitze (Deckbereit)', color: '#ec4899' },
      'nachbrunst': { text: '🔄 3. Nachbrunst (Abklingen)', color: '#a855f7' },
      'scheintraechtigkeit': { text: '🍼 Scheinträchtigkeit', color: '#f59e0b' }
    };
    const info = map[phase] || map['keine'];
    this.dom.heatStatusBadge.textContent = info.text;
  }

  updateLimitationBadge(val) {
    const num = parseInt(val, 10);
    this.dom.limitationScoreBadge.textContent = `${num * 10}% Einschränkung`;
  }

  selectChips(group, values) {
    if (!group) return;
    group.querySelectorAll('.tag-chip').forEach(chip => {
      chip.classList.toggle('selected', values.includes(chip.getAttribute('data-val')));
    });
  }

  selectSingleChip(group, value) {
    if (!group) return;
    group.querySelectorAll('.tag-chip').forEach(chip => {
      chip.classList.toggle('selected', chip.getAttribute('data-val') === value);
    });
  }

  unselectAllChips(group) {
    if (!group) return;
    group.querySelectorAll('.tag-chip').forEach(chip => chip.classList.remove('selected'));
  }

  getSelectedChipValues(group) {
    if (!group) return [];
    const selected = [];
    group.querySelectorAll('.tag-chip.selected').forEach(chip => {
      selected.push(chip.getAttribute('data-val'));
    });
    return selected;
  }

  onBodyRegionsChanged(regions) {
    // Sync quick chips
    if (window.bodyMapManager) {
      window.bodyMapManager.updateQuickChips();
    }
  }

  // =========================================================================
  // Multi-Day Period Distribution Engine (Documents across ALL days)
  // =========================================================================
  async applyMultiDayPeriodToAllDays() {
    const isEpisode = this.dom.isMultiDayEpisode ? this.dom.isMultiDayEpisode.checked : false;
    if (!isEpisode) {
      alert('Bitte aktivieren Sie zuerst die Checkbox "Dauerschmerz / Mehrtägige Periode & Schub".');
      return;
    }

    const startDateStr = this.dom.episodeStartDateInput.value || this.currentDate;
    const endDateStr = this.dom.episodeEndDateInput.value || this.currentDate;

    if (startDateStr > endDateStr) {
      alert('Das Enddatum darf nicht vor dem Startdatum liegen.');
      return;
    }

    const dStart = new Date(startDateStr + 'T12:00:00');
    const dEnd = new Date(endDateStr + 'T12:00:00');
    const totalDays = Math.ceil((dEnd - dStart) / (1000 * 60 * 60 * 24)) + 1;

    this.dom.saveStatusMsg.textContent = `Dokumentiere Periode auf ${totalDays} Tage...`;

    const episodeType = this.getSelectedChipValues(this.dom.episodeTypeChips)[0] || 'schmerz_schub';
    const episodeDurationDays = this.dom.episodeDurationDays.value.trim() || `${totalDays} Tage`;

    const jointsPain = this.dom.painJointsInput ? parseInt(this.dom.painJointsInput.value, 10) : 0;
    const skinPain = this.dom.painSkinInput ? parseInt(this.dom.painSkinInput.value, 10) : (this.dom.skinItchInput ? parseInt(this.dom.skinItchInput.value, 10) : 0);
    const overallPain = Math.max(jointsPain, skinPain);

    const templateData = {
      painIntensity: overallPain,
      painJointsIntensity: jointsPain,
      painSkinIntensity: skinPain,
      painMorning: this.dom.painMorning.value,
      painNoon: this.dom.painNoon.value,
      painEvening: this.dom.painEvening.value,
      painNight: this.dom.painNight.value,
      isMultiDayEpisode: true,
      episodeType,
      episodeStartDate: startDateStr,
      episodeEndDate: endDateStr,
      episodeTotalDays: totalDays,
      episodeDurationDays,
      painTypes: this.getSelectedChipValues(this.dom.painTypeChips),
      adhsLevel: this.dom.adhsSlider ? parseInt(this.dom.adhsSlider.value, 10) : 0,
      adhsSymptoms: this.getSelectedChipValues(this.dom.adhsSymptomChips),
      adhsNotes: this.dom.adhsNotes ? this.dom.adhsNotes.value.trim() : '',
      skinItch: skinPain,
      skinSymptoms: this.getSelectedChipValues(this.dom.skinSymptomChips),
      skinNotes: this.dom.skinNotes.value.trim(),
      heatPhase: this.getSelectedChipValues(this.dom.heatPhaseChips)[0] || 'keine',
      heatSymptoms: this.getSelectedChipValues(this.dom.heatSymptomChips),
      heatNotes: this.dom.heatCycleNotes.value.trim(),
      dogLameness: parseInt(this.dom.dogLamenessInput.value, 10),
      dogSymptoms: this.getSelectedChipValues(this.dom.dogSymptomChips),
      bodyRegions: Array.from(window.bodyMapManager.selectedRegions),
      limitationLevel: parseInt(this.dom.limitationSlider.value, 10),
      limitations: this.getSelectedChipValues(this.dom.limitationChips),
      medication: this.dom.medicationInput.value.trim(),
      treatment: this.dom.treatmentInput.value.trim(),
      notes: this.dom.notesInput.value.trim()
    };

    let curDate = new Date(dStart);
    for (let i = 0; i < totalDays; i++) {
      const y = curDate.getFullYear();
      const m = String(curDate.getMonth() + 1).padStart(2, '0');
      const d = String(curDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      // Check existing entry for that date to preserve photos or notes if any
      const existing = await window.symptomDB.getEntry(this.currentProfile, dateStr);
      let dayWeather = existing ? existing.weather : null;
      if (!dayWeather) {
        try {
          dayWeather = await window.weatherService.getWeatherForDate(dateStr);
        } catch (e) {
          dayWeather = null;
        }
      }

      const dayEntry = {
        ...(existing || {}),
        ...templateData,
        profile: this.currentProfile,
        date: dateStr,
        weather: dayWeather || templateData.weather || this.currentWeather,
        episodeDayIndex: i + 1,
        photos: existing ? existing.photos : []
      };

      await window.symptomDB.saveEntry(dayEntry);
      curDate.setDate(curDate.getDate() + 1);
    }

    this.dom.saveStatusMsg.textContent = `✓ Erfolgreich auf alle ${totalDays} Tage (${startDateStr} bis ${endDateStr}) dokumentiert!`;
    this.dom.saveStatusMsg.className = 'save-status-msg success';
    if (navigator.vibrate) navigator.vibrate(80);

    setTimeout(() => {
      this.dom.saveStatusMsg.textContent = '';
    }, 4000);
  }

  // =========================================================================
  // Saving Entry
  // =========================================================================
  async saveCurrentEntry() {
    this.dom.btnSaveEntry.disabled = true;
    this.dom.saveStatusMsg.textContent = 'Speichere...';
    this.dom.saveStatusMsg.className = 'save-status-msg';

    const isMultiDay = this.dom.isMultiDayEpisode ? this.dom.isMultiDayEpisode.checked : false;
    const startDateStr = this.dom.episodeStartDateInput ? (this.dom.episodeStartDateInput.value || this.currentDate) : this.currentDate;
    const endDateStr = this.dom.episodeEndDateInput ? (this.dom.episodeEndDateInput.value || this.currentDate) : this.currentDate;

    // If it's a multi-day span (e.g. startDate != endDate), automatically document across all days!
    if (isMultiDay && startDateStr && endDateStr && startDateStr !== endDateStr) {
      await this.applyMultiDayPeriodToAllDays();
      this.dom.btnSaveEntry.disabled = false;
      return;
    }

    const jointsPain = this.dom.painJointsInput ? parseInt(this.dom.painJointsInput.value, 10) : 0;
    const skinPain = this.dom.painSkinInput ? parseInt(this.dom.painSkinInput.value, 10) : (this.dom.skinItchInput ? parseInt(this.dom.skinItchInput.value, 10) : 0);
    const overallPain = Math.max(jointsPain, skinPain);

    const entry = {
      profile: this.currentProfile,
      date: this.currentDate,
      weather: this.currentWeather,
      
      // Separate Pain
      painIntensity: overallPain,
      painJointsIntensity: jointsPain,
      painSkinIntensity: skinPain,
      painMorning: this.dom.painMorning.value,
      painNoon: this.dom.painNoon.value,
      painEvening: this.dom.painEvening.value,
      painNight: this.dom.painNight.value,

      // Multi-Day Episode / Dauerschmerz
      isMultiDayEpisode: isMultiDay,
      episodeType: this.getSelectedChipValues(this.dom.episodeTypeChips)[0] || 'schmerz_schub',
      episodeStartDate: startDateStr,
      episodeEndDate: endDateStr,
      episodeDurationDays: this.dom.episodeDurationDays ? this.dom.episodeDurationDays.value.trim() : '',

      painTypes: this.getSelectedChipValues(this.dom.painTypeChips),
      
      // ADHS (Human)
      adhsLevel: this.dom.adhsSlider ? parseInt(this.dom.adhsSlider.value, 10) : 0,
      adhsSymptoms: this.getSelectedChipValues(this.dom.adhsSymptomChips),
      adhsNotes: this.dom.adhsNotes ? this.dom.adhsNotes.value.trim() : '',

      // Skin (Human)
      skinItch: skinPain,
      skinSymptoms: this.getSelectedChipValues(this.dom.skinSymptomChips),
      skinNotes: this.dom.skinNotes.value.trim(),

      // Heat Cycle (Milla & Bella)
      heatPhase: this.getSelectedChipValues(this.dom.heatPhaseChips)[0] || 'keine',
      heatSymptoms: this.getSelectedChipValues(this.dom.heatSymptomChips),
      heatNotes: this.dom.heatCycleNotes.value.trim(),

      // Dog Mobility
      dogLameness: parseInt(this.dom.dogLamenessInput.value, 10),
      dogSymptoms: this.getSelectedChipValues(this.dom.dogSymptomChips),

      // Body Regions
      bodyRegions: Array.from(window.bodyMapManager.selectedRegions),

      // Limitations
      limitationLevel: parseInt(this.dom.limitationSlider.value, 10),
      limitations: this.getSelectedChipValues(this.dom.limitationChips),

      // Notes & Meds
      medication: this.dom.medicationInput.value.trim(),
      treatment: this.dom.treatmentInput.value.trim(),
      notes: this.dom.notesInput.value.trim(),

      // Photos metadata
      photoCount: this.currentPhotos.length,
      photos: this.currentPhotos.map(p => p.id)
    };

    try {
      await window.symptomDB.saveEntry(entry);
      this.currentEntry = entry;
      this.dom.saveStatusMsg.textContent = '✓ Erfolgreich in der App gespeichert!';
      this.dom.saveStatusMsg.classList.add('success');

      // Trigger slight haptic vibration if supported on iOS/mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      setTimeout(() => {
        this.dom.saveStatusMsg.textContent = '';
      }, 3000);
    } catch (err) {
      console.error('Save entry failed:', err);
      this.dom.saveStatusMsg.textContent = '❌ Fehler beim Speichern!';
    } finally {
      this.dom.btnSaveEntry.disabled = false;
    }
  }

  // =========================================================================
  // Photo Upload, Capture & IndexedDB Storage
  // =========================================================================
  setupPhotoHandlers() {
    const handleFiles = async (files) => {
      if (!files || files.length === 0) return;
      
      for (const file of Array.from(files)) {
        try {
          const dataUrl = await this.compressAndReadFile(file);
          const photoId = `photo_${this.currentProfile}_${this.currentDate}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
          const photoObj = {
            id: photoId,
            entryId: `${this.currentProfile}_${this.currentDate}`,
            profile: this.currentProfile,
            date: this.currentDate,
            dataUrl: dataUrl,
            name: file.name,
            createdAt: new Date().toISOString()
          };

          await window.symptomDB.savePhoto(photoObj);
          this.currentPhotos.push(photoObj);
        } catch (err) {
          console.error('Photo read error:', err);
        }
      }

      this.renderAttachedPhotos();
      await this.saveCurrentEntry();
    };

    this.dom.photoCameraInput.addEventListener('change', (e) => handleFiles(e.target.files));
    this.dom.photoGalleryInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // Fullscreen Modal Close
    this.dom.btnClosePhotoModal.addEventListener('click', () => {
      this.dom.photoModal.style.display = 'none';
    });
    this.dom.photoModal.addEventListener('click', (e) => {
      if (e.target === this.dom.photoModal) {
        this.dom.photoModal.style.display = 'none';
      }
    });
  }

  compressAndReadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1280; // Optimized size for iOS & IndexedDB
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  renderAttachedPhotos() {
    this.dom.attachedPhotosGrid.innerHTML = '';
    this.dom.photoCountBadge.textContent = `${this.currentPhotos.length} Foto${this.currentPhotos.length === 1 ? '' : 's'}`;

    this.currentPhotos.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'photo-item';
      item.innerHTML = `
        <img src="${photo.dataUrl}" alt="Dokumentation">
        <button type="button" class="photo-delete-btn" title="Foto löschen">✕</button>
      `;

      item.querySelector('img').addEventListener('click', () => {
        this.dom.photoModalImg.src = photo.dataUrl;
        this.dom.photoModalCaption.textContent = `${photo.date} • ${this.getProfileDisplayName(photo.profile)}`;
        this.dom.photoModal.style.display = 'flex';
      });

      item.querySelector('.photo-delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Möchten Sie dieses Foto wirklich entfernen?')) {
          await window.symptomDB.deletePhoto(photo.id);
          this.currentPhotos = this.currentPhotos.filter(p => p.id !== photo.id);
          this.renderAttachedPhotos();
          await this.saveCurrentEntry();
        }
      });

      this.dom.attachedPhotosGrid.appendChild(item);
    });
  }

  getProfileDisplayName(profile) {
    const map = {
      'human': 'Ich (Mensch)',
      'buddy': 'Buddy',
      'milla': 'Milla',
      'bella': 'Bella'
    };
    return map[profile] || profile;
  }

  // =========================================================================
  // TAB 2: History & Timeline (2016 - 2026)
  // =========================================================================
  setupHistoryFilters() {
    this.historyFilter = {
      profile: 'all',
      severity: 'all',
      search: ''
    };

    this.dom.filterProfileButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.filterProfileButtons.forEach(b => b.classList.toggle('active', b === btn));
        this.historyFilter.profile = btn.getAttribute('data-filter-profile');
        this.renderHistoryList();
      });
    });

    this.dom.filterSeverityButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.filterSeverityButtons.forEach(b => b.classList.toggle('active', b === btn));
        this.historyFilter.severity = btn.getAttribute('data-filter-severity');
        this.renderHistoryList();
      });
    });

    this.dom.historySearchInput.addEventListener('input', (e) => {
      this.historyFilter.search = e.target.value;
      this.renderHistoryList();
    });
  }

  async renderHistoryList() {
    const entries = await window.symptomDB.queryEntries(this.historyFilter);
    const container = this.dom.historyListContainer;

    if (!entries || entries.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📅</span>
          <p>Keine Einträge für diese Filterung gefunden.</p>
          <span style="font-size:12px;color:var(--text-muted);">Erfassen Sie im Tagebuch-Tab Einträge für beliebige Tage ab 2016.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    for (const entry of entries) {
      const card = document.createElement('div');
      card.className = 'history-entry-card';

      // Load thumbnails if any
      const entryPhotos = await window.symptomDB.getPhotos(entry.id);

      const painPillClass = (entry.painIntensity >= 7 || entry.dogLameness >= 4) ? 'pain-high' : 
                            (entry.painIntensity >= 4 || entry.dogLameness >= 2) ? 'pain-mid' : 'pain-low';

      const weatherText = entry.weather ? `${entry.weather.icon} ${entry.weather.tempMean}°C (UV: ${entry.weather.uvIndex})` : '93047 Regensburg';

      const dogOrHumanBadge = entry.profile === 'human' 
        ? `👤 Ich` 
        : `🐕 ${entry.profile.toUpperCase()}`;

      let heatPill = '';
      if (entry.heatPhase && entry.heatPhase !== 'keine') {
        heatPill = `<span class="metric-pill heat">🌸 ${entry.heatPhase}</span>`;
      }

      let adhsPill = '';
      if (entry.adhsLevel > 0 || (entry.adhsSymptoms && entry.adhsSymptoms.length > 0)) {
        adhsPill = `<span class="metric-pill" style="background:rgba(139,92,246,0.22);color:#c4b5fd;">🧠 ADHS: ${entry.adhsLevel || 0}/10</span>`;
      }

      let daytimePill = '';
      if (entry.painMorning || entry.painNoon || entry.painEvening || entry.painNight) {
        daytimePill = `<span class="metric-pill" style="background:rgba(255,255,255,0.06);">🌅${entry.painMorning || '-'} ☀️${entry.painNoon || '-'} 🌆${entry.painEvening || '-'} 🌙${entry.painNight || '-'}</span>`;
      }

      let episodePill = '';
      if (entry.isMultiDayEpisode) {
        const dayProgress = entry.episodeTotalDays ? ` (Tag ${entry.episodeDayIndex || 1} von ${entry.episodeTotalDays})` : ` (${entry.episodeDurationDays || 'mehrtägig'})`;
        episodePill = `<span class="metric-pill" style="background:rgba(239,68,68,0.2);color:#fca5a5;">⚡ Periode${dayProgress}</span>`;
      }

      const formattedRegions = (entry.bodyRegions || []).map(r => window.bodyMapManager ? window.bodyMapManager.getRegionDisplayName(r) : r).join(', ');

      card.innerHTML = `
        <div class="entry-card-top">
          <span class="entry-profile-badge">${dogOrHumanBadge}</span>
          <span class="entry-date-badge">${entry.date}</span>
        </div>

        <div class="entry-card-metrics">
          <span class="metric-pill ${painPillClass}">🦴 Gelenke: ${entry.painJointsIntensity !== undefined ? entry.painJointsIntensity : (entry.painIntensity || 0)}/10</span>
          ${entry.profile === 'human' ? `<span class="metric-pill uv">🧴 Haut: ${entry.painSkinIntensity !== undefined ? entry.painSkinIntensity : (entry.skinItch || 0)}/10</span>` : ''}
          ${daytimePill}
          ${episodePill}
          ${adhsPill}
          ${entry.dogLameness ? `<span class="metric-pill ${painPillClass}">Lahmheit: ${entry.dogLameness}/5</span>` : ''}
          ${heatPill}
          <span class="metric-pill uv">${weatherText}</span>
        </div>

        <div class="entry-card-summary">
          ${formattedRegions ? `<strong>Schmerzregionen:</strong> ${formattedRegions}<br>` : ''}
          ${entry.notes ? `<strong>Notiz:</strong> ${entry.notes}<br>` : ''}
          ${entry.adhsNotes ? `<strong>ADHS:</strong> ${entry.adhsNotes}<br>` : ''}
          ${entry.skinNotes ? `<strong>Haut:</strong> ${entry.skinNotes}<br>` : ''}
          ${entry.medication ? `<strong>Medikamente:</strong> ${entry.medication}<br>` : ''}
          ${(entry.limitations && entry.limitations.length > 0) ? `<strong>Einschränkung:</strong> ${entry.limitations.join(', ')}` : ''}
        </div>

        ${entryPhotos.length > 0 ? `
          <div class="entry-card-photos-thumb">
            ${entryPhotos.slice(0, 4).map(p => `<img src="${p.dataUrl}" class="thumb-mini" alt="Foto">`).join('')}
            ${entryPhotos.length > 4 ? `<span style="font-size:11px;color:var(--text-muted);align-self:center;">+${entryPhotos.length - 4} weitere</span>` : ''}
          </div>
        ` : ''}
      `;

      // Jump to entry on click
      card.addEventListener('click', async () => {
        this.currentProfile = entry.profile;
        this.currentDate = entry.date;
        this.dom.currentDateInput.value = this.currentDate;
        
        // Update profile chips
        this.dom.profileSelector.querySelectorAll('.profile-chip').forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-profile') === this.currentProfile);
        });

        this.adaptUIForCurrentProfile();
        this.updateDateDisplay();
        await this.loadDateAndProfileData();
        this.switchTab('entry');
      });

      container.appendChild(card);
    }
  }

  // =========================================================================
  // TAB 3: Analytics & Weather Correlations (UV, Pressure, Pain)
  // =========================================================================
  setupAnalytics() {
    // Initialized when switching to Analytics tab
  }

  async renderAnalytics() {
    const entries = await window.symptomDB.queryEntries();
    
    this.dom.statTotalEntries.textContent = entries.length;

    if (entries.length === 0) {
      this.dom.statAvgPain.textContent = '0.0';
      this.dom.statUvCorrelation.textContent = '--';
      this.dom.statPressureCorrelation.textContent = '--';
      this.renderAnalyticsChart([]);
      return;
    }

    const totalPain = entries.reduce((acc, e) => acc + (Number(e.painIntensity) || 0), 0);
    this.dom.statAvgPain.textContent = (totalPain / entries.length).toFixed(1);

    // Calculate correlation with UV Index & Pressure
    let highUvCount = 0;
    let highUvPainSum = 0;
    let lowPressureCount = 0;
    let lowPressurePainSum = 0;

    entries.forEach(e => {
      const pain = Number(e.painIntensity) || 0;
      if (e.weather) {
        if (e.weather.uvIndex >= 5) {
          highUvCount++;
          highUvPainSum += pain;
        }
        if (e.weather.pressure < 1013) {
          lowPressureCount++;
          lowPressurePainSum += pain;
        }
      }
    });

    if (highUvCount > 0) {
      const avgPainHighUv = (highUvPainSum / highUvCount).toFixed(1);
      this.dom.statUvCorrelation.textContent = `Ø ${avgPainHighUv} bei UV ≥ 5`;
    } else {
      this.dom.statUvCorrelation.textContent = 'Zu wenige Daten';
    }

    if (lowPressureCount > 0) {
      const avgPainLowPressure = (lowPressurePainSum / lowPressureCount).toFixed(1);
      this.dom.statPressureCorrelation.textContent = `Ø ${avgPainLowPressure} b. Tiefdruck`;
    } else {
      this.dom.statPressureCorrelation.textContent = 'Ausgeglichen';
    }

    // Top Symptoms Breakdown
    const symptomCounts = {};
    entries.forEach(e => {
      [...(e.painTypes || []), ...(e.adhsSymptoms || []), ...(e.skinSymptoms || []), ...(e.dogSymptoms || []), ...(e.limitations || [])].forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });

    const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    this.dom.topSymptomsList.innerHTML = sortedSymptoms.map(([name, count]) => {
      const pct = Math.round((count / entries.length) * 100);
      return `
        <div class="symptom-bar-item">
          <div class="symptom-bar-info">
            <span>${name}</span>
            <span>${count}x (${pct}%)</span>
          </div>
          <div class="symptom-bar-track">
            <div class="symptom-bar-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');

    this.renderAnalyticsChart(entries);
  }

  renderAnalyticsChart(entries = []) {
    const canvas = this.dom.correlationChart;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 320;
    const height = canvas.height = 200;

    ctx.clearRect(0, 0, width, height);

    if (entries.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Noch keine Daten für die Diagrammanzeige vorhanden.', width / 2, height / 2);
      return;
    }

    // Sort chronologically ascending
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14); // Last 14 days

    const padding = 30;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    if (sorted.length < 2) return;

    // Draw Pain Curve (Red / Orange)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    sorted.forEach((e, idx) => {
      const x = padding + (chartW / (sorted.length - 1)) * idx;
      const pain = Number(e.painIntensity) || 0;
      const y = padding + chartH - (pain / 10) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw UV Index Curve (Cyan / Blue)
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    sorted.forEach((e, idx) => {
      const x = padding + (chartW / (sorted.length - 1)) * idx;
      const uv = e.weather ? (Number(e.weather.uvIndex) || 0) : 0;
      const y = padding + chartH - (uv / 11) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px sans-serif';
    ctx.fillText('— Schmerz (0-10)', padding, padding - 10);
    ctx.fillStyle = '#0ea5e9';
    ctx.fillText('- - UV-Index (93047)', padding + 110, padding - 10);
  }

  // =========================================================================
  // TAB 4: Medical / Vet Export & Backup
  // =========================================================================
  setupExportAndBackup() {
    this.dom.exportStartDate.value = '2016-01-01';
    this.dom.exportEndDate.value = this.getTodayDateString();

    this.dom.btnGenerateReport.addEventListener('click', async () => {
      await this.generateMedicalReport();
    });

    this.dom.btnPrintReport.addEventListener('click', () => {
      window.print();
    });

    this.dom.btnCloseReportModal.addEventListener('click', () => {
      this.dom.reportModal.style.display = 'none';
    });

    // 1-Click Restore of Embedded Backup
    if (this.dom.btnRestoreEmbeddedBackup) {
      this.dom.btnRestoreEmbeddedBackup.addEventListener('click', async () => {
        try {
          await window.symptomDB.importFullBackup(USER_EMBEDDED_BACKUP);
          this.currentProfile = 'human';
          this.currentDate = '2026-08-14';
          this.dom.currentDateInput.value = this.currentDate;
          this.updateDateDisplay();
          await this.loadDateAndProfileData();
          alert('✓ Sicherung erfolgreich wiederhergestellt!\n\nEintrag vom 14. August 2026 (Schub, Cyndaclin, Zugsalbe, Ibuprofen/Tilidin) und Wetterarchiv wurden geladen.');
          this.switchTab('entry');
        } catch (err) {
          console.error('Embedded restore error:', err);
          alert('❌ Fehler beim Wiederherstellen.');
        }
      });
    }

    // Backup Export
    this.dom.btnExportBackup.addEventListener('click', async () => {
      const backup = await window.symptomDB.exportFullBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SymptomTagebuch_Backup_93047_${this.getTodayDateString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Backup Import via File Picker
    if (this.dom.importBackupFile) {
      this.dom.importBackupFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
          try {
            const data = JSON.parse(evt.target.result);
            await window.symptomDB.importFullBackup(data);
            alert('✓ Backup erfolgreich importiert!');
            await this.loadDateAndProfileData();
          } catch (err) {
            console.error('Import error:', err);
            alert('❌ Ungültige Backup-Datei: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Paste JSON Backup Text
    if (this.dom.btnOpenPasteBackupModal) {
      this.dom.btnOpenPasteBackupModal.addEventListener('click', () => {
        const isHidden = this.dom.pasteBackupContainer.style.display === 'none';
        this.dom.pasteBackupContainer.style.display = isHidden ? 'block' : 'none';
        if (isHidden && this.dom.pasteBackupText) {
          this.dom.pasteBackupText.focus();
        }
      });
    }

    if (this.dom.btnCancelPasteBackup) {
      this.dom.btnCancelPasteBackup.addEventListener('click', () => {
        this.dom.pasteBackupContainer.style.display = 'none';
      });
    }

    if (this.dom.btnApplyPasteBackup) {
      this.dom.btnApplyPasteBackup.addEventListener('click', async () => {
        const text = (this.dom.pasteBackupText.value || '').trim();
        if (!text) {
          alert('Bitte fügen Sie zuerst Ihren JSON-Sicherungstext ein.');
          return;
        }

        try {
          const data = JSON.parse(text);
          await window.symptomDB.importFullBackup(data);
          this.dom.pasteBackupContainer.style.display = 'none';
          this.dom.pasteBackupText.value = '';
          alert('✓ Sicherung erfolgreich aus Text wiederhergestellt!');
          await this.loadDateAndProfileData();
        } catch (err) {
          console.error('Text restore error:', err);
          alert('❌ Fehler beim Verarbeiten des JSON-Textes: ' + err.message);
        }
      });
    }
  }

  async generateMedicalReport() {
    const startDate = this.dom.exportStartDate.value || '2016-01-01';
    const endDate = this.dom.exportEndDate.value || this.getTodayDateString();
    const profile = this.dom.exportProfileSelect.value;

    const entries = await window.symptomDB.queryEntries({ profile, startDate, endDate });

    const container = this.dom.printableReportBody;
    const profileTitle = profile === 'all' ? 'Alle Profile (Mensch & Hunde)' : this.getProfileDisplayName(profile);

    let rowsHtml = '';
    for (const e of entries) {
      const photos = await window.symptomDB.getPhotos(e.id);
      const weatherStr = e.weather ? `${e.weather.condition}, ${e.weather.tempMean}°C, UV ${e.weather.uvIndex}, ${e.weather.pressure} hPa` : '-';
      
      let episodeInfo = '';
      if (e.isMultiDayEpisode) {
        const spanText = e.episodeStartDate && e.episodeEndDate ? `${e.episodeStartDate} bis ${e.episodeEndDate}` : (e.episodeDurationDays || 'laufend');
        const dayIdxText = e.episodeTotalDays ? ` • Tag ${e.episodeDayIndex || 1} von ${e.episodeTotalDays}` : '';
        episodeInfo = `<span style="color:#b91c1c;font-weight:bold;">⚡ Mehrtägige Periode / Schub (${spanText}${dayIdxText})</span><br>`;
      }

      let daytimeInfo = '';
      if (e.painMorning || e.painNoon || e.painEvening || e.painNight) {
        daytimeInfo = `<small>Tageszeiten: Morgens ${e.painMorning || '-'}, Mittags ${e.painNoon || '-'}, Abends ${e.painEvening || '-'}, Nachts ${e.painNight || '-'}</small><br>`;
      }

      const formattedRegions = (e.bodyRegions || []).map(r => window.bodyMapManager ? window.bodyMapManager.getRegionDisplayName(r) : r).join(', ');

      let adhsInfo = '';
      if (e.adhsLevel > 0 || (e.adhsSymptoms && e.adhsSymptoms.length > 0)) {
        adhsInfo = `<strong>ADHS: ${e.adhsLevel || 0}/10</strong> ${(e.adhsSymptoms || []).join(', ')}<br>`;
      }

      let painSummary = '';
      if (e.profile === 'human') {
        const joints = e.painJointsIntensity !== undefined ? e.painJointsIntensity : (e.painIntensity || 0);
        const skin = e.painSkinIntensity !== undefined ? e.painSkinIntensity : (e.skinItch || 0);
        painSummary = `<strong>🦴 Gelenke: ${joints}/10</strong><br><strong>🧴 Haut: ${skin}/10</strong><br>`;
      } else {
        painSummary = `<strong>Schmerz: ${e.painIntensity || 0}/10</strong><br>`;
      }

      rowsHtml += `
        <tr>
          <td><strong>${e.date}</strong><br><small>${this.getProfileDisplayName(e.profile)}</small></td>
          <td>
            ${painSummary}
            ${daytimeInfo}
            ${episodeInfo}
            ${adhsInfo}
            ${e.dogLameness ? `Lahmheit: ${e.dogLameness}/5<br>` : ''}
            ${e.heatPhase && e.heatPhase !== 'keine' ? `Zyklus: ${e.heatPhase}<br>` : ''}
            <small>${(e.painTypes || []).join(', ')}</small>
          </td>
          <td>
            ${formattedRegions ? `<strong>Schmerzregionen:</strong> ${formattedRegions}<br>` : ''}
            ${e.limitations && e.limitations.length > 0 ? `<strong>Einschränkungen:</strong> ${e.limitations.join(', ')}<br>` : ''}
            ${e.notes ? `<strong>Notizen:</strong> ${e.notes}<br>` : ''}
            ${e.adhsNotes ? `<strong>ADHS-Notiz:</strong> ${e.adhsNotes}<br>` : ''}
            ${e.skinNotes ? `<strong>Haut-Notiz:</strong> ${e.skinNotes}<br>` : ''}
            ${e.medication ? `<strong>Medikation:</strong> ${e.medication}` : ''}
          </td>
          <td><small>${weatherStr}</small></td>
          <td>
            ${photos.length > 0 ? `<span style="font-weight:bold;color:#0284c7;">${photos.length} Foto(s)</span>` : '-'}
          </td>
        </tr>
      `;
    }

    container.innerHTML = `
      <div class="report-header-section">
        <div>
          <h1 style="font-size:20px;color:#0f172a;margin-bottom:4px;">Medizinischer Verlaufsbericht & Symptomtagebuch</h1>
          <p style="color:#64748b;">Standort: 93047 Regensburg Innenstadt • Patient / Profil: <strong>${profileTitle}</strong></p>
          <p style="color:#64748b;">Zeitraum: <strong>${startDate} bis ${endDate}</strong> • Erfasste Tage: <strong>${entries.length}</strong></p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:11px;color:#94a3b8;">Erstellt am: ${new Date().toLocaleDateString('de-DE')}</span>
        </div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width:15%;">Datum / Profil</th>
            <th style="width:20%;">Intensität & Art</th>
            <th style="width:35%;">Alltagseinschränkungen, Gelenke & Befunde</th>
            <th style="width:20%;">Wetter & UV (93047)</th>
            <th style="width:10%;">Fotos</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="5" style="text-align:center;padding:20px;">Keine Einträge für diesen Zeitraum gefunden.</td></tr>'}
        </tbody>
      </table>
    `;

    this.dom.reportModal.style.display = 'flex';
  }
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.symptomApp = new SymptomApp();
});
