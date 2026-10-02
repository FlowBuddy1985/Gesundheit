/**
 * Detailed Interactive Body Map Engine for Human and Dog Anatomies
 * High-Resolution anatomical vectors, touch-friendly segmentation,
 * real-time hover feedback, view switching, and large-scale rendering.
 */

class BodyMapManager {
  constructor() {
    this.selectedRegions = new Set();
    this.onSelectionChange = null;
    this.currentViewMode = 'both'; // 'both', 'front', 'back'
  }

  init(onSelectionChangeCallback) {
    this.onSelectionChange = onSelectionChangeCallback;
    this.renderHumanFront();
    this.renderHumanBack();
    this.renderDogMap();
    this.attachEvents();
    this.setupViewControls();
    this.updateVisualSelection();
  }

  setRegions(regions = []) {
    this.selectedRegions = new Set(regions || []);
    this.updateVisualSelection();
    if (this.onSelectionChange) {
      this.onSelectionChange(Array.from(this.selectedRegions));
    }
  }

  clear() {
    this.selectedRegions.clear();
    this.updateVisualSelection();
    if (this.onSelectionChange) {
      this.onSelectionChange([]);
    }
  }

  toggleRegion(regionId) {
    if (!regionId) return;
    if (this.selectedRegions.has(regionId)) {
      this.selectedRegions.delete(regionId);
    } else {
      this.selectedRegions.add(regionId);
    }
    
    // Haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }

    this.updateVisualSelection();
    if (this.onSelectionChange) {
      this.onSelectionChange(Array.from(this.selectedRegions));
    }
  }

  getRegionDisplayName(id) {
    const names = {
      // Human - Front / Kopf & Hals
      'kopf_stirn': 'Kopf / Stirn & Schläfen',
      'gesicht_wangen': 'Gesicht, Augen & Wangen',
      'kiefer': 'Kiefer & Kiefergelenk (TMJ)',
      'hals_v': 'Hals vorn / Kehle & Schilddrüse',
      'clavicula_li': 'Schlüsselbein (Clavicula) links',
      'clavicula_re': 'Schlüsselbein (Clavicula) rechts',
      
      // Human - Torso Front
      'sternum': 'Brustbein (Sternum)',
      'brust_li': 'Brustkorb / Muskel links',
      'brust_re': 'Brustkorb / Muskel rechts',
      'oberbauch_li': 'Oberbauch / Rippenbogen links',
      'oberbauch_re': 'Oberbauch / Rippenbogen rechts',
      'bauch_mitte': 'Bauchmitte / Bauchnabel',
      'unterbauch': 'Unterbauch / Blasenbereich',
      'leiste_li': 'Leiste / Psoas links',
      'leiste_re': 'Leiste / Psoas rechts',

      // Human - Arme Front
      'schulter_li_v': 'Schulter vorn (Deltoideus) links',
      'schulter_re_v': 'Schulter vorn (Deltoideus) rechts',
      'oberarm_li': 'Oberarm / Bizeps links',
      'oberarm_re': 'Oberarm / Bizeps rechts',
      'ellbogen_li': 'Ellbogenbeuge / Gelenk links',
      'ellbogen_re': 'Ellbogenbeuge / Gelenk rechts',
      'unterarm_li': 'Unterarm vorn links',
      'unterarm_re': 'Unterarm vorn rechts',
      'handgelenk_li': 'Handgelenk links',
      'handgelenk_re': 'Handgelenk rechts',
      'hand_li': 'Handfläche & Finger links',
      'hand_re': 'Handfläche & Finger rechts',

      // Human - Beine Front (Hüfte, Knie, Füße detailliert)
      'huefte_li_v': 'Hüftgelenk links vorn',
      'huefte_re_v': 'Hüftgelenk rechts vorn',
      'oberschenkel_li_v': 'Oberschenkel (Quadrizeps) links',
      'oberschenkel_re_v': 'Oberschenkel (Quadrizeps) rechts',
      'patella_li': 'Kniescheibe (Patella) links',
      'patella_re': 'Kniescheibe (Patella) rechts',
      'knie_innen_li': 'Knie-Innenseite / Innenmeniskus links',
      'knie_innen_re': 'Knie-Innenseite / Innenmeniskus rechts',
      'knie_aussen_li': 'Knie-Außenseite / Außenmeniskus links',
      'knie_aussen_re': 'Knie-Außenseite / Außenmeniskus rechts',
      'schienbein_li': 'Schienbein (Tibia) links',
      'schienbein_re': 'Schienbein (Tibia) rechts',
      'sprunggelenk_li': 'Sprunggelenk / Knöchel links',
      'sprunggelenk_re': 'Sprunggelenk / Knöchel rechts',
      'fuss_li': 'Fußrücken & Zehen links',
      'fuss_re': 'Fußrücken & Zehen rechts',

      // Human - Back / Rückseite (Wirbelsäule, Nacken, Gesäß, Waden, Ferse)
      'hinterkopf': 'Hinterkopf / Okziput',
      'nacken_hws': 'Nacken & Halswirbelsäule (HWS C1-C7)',
      'trapez_li': 'Trapezmuskel / Nacken-Schulter links',
      'trapez_re': 'Trapezmuskel / Nacken-Schulter rechts',
      'scapula_li': 'Schulterblatt (Scapula) links',
      'scapula_re': 'Schulterblatt (Scapula) rechts',
      'schulter_li_h': 'Schulter hinten links',
      'schulter_re_h': 'Schulter hinten rechts',
      'bws_wirbelsaeule': 'Brustwirbelsäule (BWS Th1-Th12)',
      'rippen_h_li': 'Rippen hinten links',
      'rippen_h_re': 'Rippen hinten rechts',
      'lws_wirbelsaeule': 'Lendenwirbelsäule (LWS L1-L5)',
      'flanken_li': 'Flanke / Nierenbereich links',
      'flanken_re': 'Flanke / Nierenbereich rechts',
      'isg_kreuzbein': 'ISG (Iliosakralgelenk) & Kreuzbein',
      'gesaess_li': 'Gesäß / Gluteus links',
      'gesaess_re': 'Gesäß / Gluteus rechts',
      
      // Human - Arme Back
      'oberarm_li_h': 'Oberarm hinten / Trizeps links',
      'oberarm_re_h': 'Oberarm hinten / Trizeps rechts',
      'ellbogen_li_h': 'Ellbogenspitze (Olekranon) links',
      'ellbogen_re_h': 'Ellbogenspitze (Olekranon) rechts',
      'unterarm_li_h': 'Unterarm hinten links',
      'unterarm_re_h': 'Unterarm hinten rechts',
      'handruecken_li': 'Handrücken & Finger links',
      'handruecken_re': 'Handrücken & Finger rechts',

      // Human - Beine Back
      'oberschenkel_li_h': 'Oberschenkel hinten (Hamstrings / Ischias) links',
      'oberschenkel_re_h': 'Oberschenkel hinten (Hamstrings / Ischias) rechts',
      'kniekehle_li': 'Kniekehle links',
      'kniekehle_re': 'Kniekehle rechts',
      'wade_li': 'Wadenmuskel (Gastrocnemius) links',
      'wade_re': 'Wadenmuskel (Gastrocnemius) rechts',
      'achilles_li': 'Achillessehne links',
      'achilles_re': 'Achillessehne rechts',
      'ferse_li': 'Ferse & Fersensporn links',
      'ferse_re': 'Ferse & Fersensporn rechts',
      'sohle_li': 'Fußsohle / Plantarfaszie links',
      'sohle_re': 'Fußsohle / Plantarfaszie rechts',
      'ganzkoerper_haut': 'Ganzkörper Haut / Ekzem / Juckreiz',

      // Dog Anatomy (Buddy, Milla, Bella)
      'dog_schnauze': 'Hund: Fang, Schnauze & Zähne',
      'dog_kopf': 'Hund: Stirn, Augen & Schädel',
      'dog_ohren': 'Hund: Ohren',
      'dog_hws': 'Hund: Halswirbelsäule (HWS)',
      'dog_schulter': 'Hund: Schulterblatt & Schultergelenk',
      'dog_ellbogen': 'Hund: Oberarm & Ellbogengelenk',
      'dog_karpal': 'Hund: Vorderfußwurzel (Karpalgelenk)',
      'dog_vorderpfoten': 'Hund: Vorderpfoten & Ballen',
      'dog_bws': 'Hund: Brustwirbelsäule & Rücken',
      'dog_brustkorb': 'Hund: Brustkorb & Rippen',
      'dog_lws': 'Hund: Lendenwirbelsäule (LWS)',
      'dog_bauch': 'Hund: Bauch & Gesäugeleiste',
      'dog_becken': 'Hund: Becken & Kreuzbein',
      'dog_huefte': 'Hund: Hüftgelenk (HD-Bereich)',
      'dog_knie': 'Hund: Kniegelenk & Kreuzband',
      'dog_sprunggelenk': 'Hund: Sprunggelenk (Tarsus)',
      'dog_hinterpfoten': 'Hund: Hinterpfoten & Ballen',
      'dog_rute': 'Hund: Rute & Rutenansatz'
    };
    return names[id] || id;
  }

  attachEvents() {
    // Robust Global Event Delegation for Clicks & Touches
    const handleElementClick = (e) => {
      const part = e.target.closest('.body-part-clickable');
      if (part) {
        e.preventDefault();
        e.stopPropagation();
        const region = part.getAttribute('data-region');
        if (region) this.toggleRegion(region);
        return;
      }

      const quickChip = e.target.closest('.body-quick-chip');
      if (quickChip) {
        e.preventDefault();
        e.stopPropagation();
        const region = quickChip.getAttribute('data-region');
        if (region) this.toggleRegion(region);
        return;
      }

      const removeBtn = e.target.closest('.remove-region-btn');
      if (removeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const region = removeBtn.getAttribute('data-remove');
        if (region) this.toggleRegion(region);
        return;
      }
    };

    document.addEventListener('click', handleElementClick);

    // Hover listeners
    document.addEventListener('mouseover', (e) => {
      const part = e.target.closest('.body-part-clickable');
      if (part) {
        const region = part.getAttribute('data-region');
        this.showHoverLabel(this.getRegionDisplayName(region));
      }
    });

    document.addEventListener('mouseout', (e) => {
      const part = e.target.closest('.body-part-clickable');
      if (part) {
        this.clearHoverLabel();
      }
    });

    const btnClear = document.getElementById('btnClearBodyMap');
    if (btnClear) {
      btnClear.addEventListener('click', (e) => {
        e.preventDefault();
        this.clear();
      });
    }
  }

  setupViewControls() {
    const viewButtons = document.querySelectorAll('.body-view-toggle-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-view-mode');
        this.setViewMode(mode);
        viewButtons.forEach(b => b.classList.toggle('active', b === btn));
      });
    });
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    const frontBox = document.getElementById('bodyMapBoxFront');
    const backBox = document.getElementById('bodyMapBoxBack');
    if (!frontBox || !backBox) return;

    if (mode === 'front') {
      frontBox.style.display = 'flex';
      frontBox.classList.add('fullscreen-mode');
      backBox.style.display = 'none';
    } else if (mode === 'back') {
      frontBox.style.display = 'none';
      backBox.style.display = 'flex';
      backBox.classList.add('fullscreen-mode');
    } else {
      frontBox.style.display = 'flex';
      frontBox.classList.remove('fullscreen-mode');
      backBox.style.display = 'flex';
      backBox.classList.remove('fullscreen-mode');
    }
  }

  showHoverLabel(text) {
    const label = document.getElementById('bodyMapHoverLabel');
    if (label) {
      label.textContent = text;
      label.style.opacity = '1';
    }
  }

  clearHoverLabel() {
    const label = document.getElementById('bodyMapHoverLabel');
    if (label) {
      label.style.opacity = '0.7';
      label.textContent = 'Tippen Sie auf eine Körperregion oder ein Gelenk';
    }
  }

  updateQuickChips() {
    document.querySelectorAll('.body-quick-chip').forEach(chip => {
      const region = chip.getAttribute('data-region');
      if (this.selectedRegions.has(region)) {
        chip.classList.add('selected');
      } else {
        chip.classList.remove('selected');
      }
    });
  }

  updateVisualSelection() {
    // Update SVG elements directly with class and direct inline attributes
    document.querySelectorAll('.body-part-clickable').forEach(el => {
      const regionId = el.getAttribute('data-region');
      const isSelected = this.selectedRegions.has(regionId);
      const isDog = el.closest('.interactive-dog') !== null;

      if (isSelected) {
        el.classList.add('active');
        const activeFill = isDog ? '#f59e0b' : '#ef4444';
        const activeStroke = isDog ? '#fef3c7' : '#fee2e2';
        el.style.fill = activeFill;
        el.style.stroke = activeStroke;
        el.style.strokeWidth = '2.5px';
        el.style.filter = `drop-shadow(0 0 10px ${isDog ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)'})`;
      } else {
        el.classList.remove('active');
        el.style.fill = '';
        el.style.stroke = '';
        el.style.strokeWidth = '';
        el.style.filter = '';
      }
    });

    this.updateQuickChips();

    const tagsContainer = document.getElementById('selectedRegionsTags');
    if (tagsContainer) {
      if (this.selectedRegions.size === 0) {
        tagsContainer.innerHTML = '<span class="empty-tag">Keine Region markiert</span>';
      } else {
        tagsContainer.innerHTML = Array.from(this.selectedRegions).map(r => `
          <span class="region-badge">
            ${this.getRegionDisplayName(r)}
            <button type="button" class="remove-region-btn" data-remove="${r}" style="background:none;border:none;color:inherit;cursor:pointer;margin-left:4px;font-size:12px;font-weight:bold;">×</button>
          </span>
        `).join('');
      }
    }
  }

  // =========================================================================
  // High-Resolution Large-Scale Detailed Human Anatomy (Front View)
  // ViewBox: 0 0 320 640
  // =========================================================================
  renderHumanFront() {
    const container = document.getElementById('humanBodyFront');
    if (!container) return;
    container.innerHTML = `
      <svg viewBox="0 0 320 640" xmlns="http://www.w3.org/2000/svg" class="anatomical-svg" style="cursor:pointer; pointer-events:auto;">
        <!-- Background Grid & Body Silhouette Aura (Non-interactive) -->
        <g class="body-background-lines" opacity="0.15" pointer-events="none" style="pointer-events:none;">
          <line x1="160" y1="10" x2="160" y2="630" stroke="#38bdf8" stroke-dasharray="4 4" stroke-width="1.5"/>
          <line x1="40" y1="200" x2="280" y2="200" stroke="#38bdf8" stroke-dasharray="2 4" stroke-width="1"/>
          <line x1="60" y1="360" x2="260" y2="360" stroke="#38bdf8" stroke-dasharray="2 4" stroke-width="1"/>
          <line x1="80" y1="510" x2="240" y2="510" stroke="#38bdf8" stroke-dasharray="2 4" stroke-width="1"/>
        </g>

        <!-- HEAD & NECK -->
        <!-- Forehead & Temples -->
        <path d="M 132,22 C 132,8 188,8 188,22 C 188,42 132,42 132,22 Z" class="body-part-clickable" data-region="kopf_stirn" title="Stirn & Schläfen"/>
        
        <!-- Eyes, Cheeks & Face -->
        <path d="M 134,42 C 134,42 186,42 186,42 C 186,64 134,64 134,42 Z" class="body-part-clickable" data-region="gesicht_wangen" title="Gesicht & Augen"/>
        
        <!-- Jaw & TMJ -->
        <path d="M 138,64 L 182,64 L 174,82 L 146,82 Z" class="body-part-clickable" data-region="kiefer" title="Kiefer & Kiefergelenk"/>

        <!-- Throat & Neck Front -->
        <path d="M 148,82 L 172,82 L 174,106 L 146,106 Z" class="body-part-clickable" data-region="hals_v" title="Hals vorn / Kehlkopf"/>

        <!-- SHOULDERS & CLAVICLES -->
        <!-- Clavicles (Schlüsselbeine) -->
        <path d="M 102,104 L 146,106 L 144,116 L 100,113 Z" class="body-part-clickable" data-region="clavicula_li" title="Schlüsselbein Links"/>
        <path d="M 174,106 L 218,104 L 220,113 L 176,116 Z" class="body-part-clickable" data-region="clavicula_re" title="Schlüsselbein Rechts"/>

        <!-- Deltoid / Shoulders Front -->
        <path d="M 76,116 C 62,130 62,156 76,170 C 94,170 102,148 100,116 Z" class="body-part-clickable" data-region="schulter_li_v" title="Schulter Links"/>
        <path d="M 244,116 C 258,130 258,156 244,170 C 226,170 218,148 220,116 Z" class="body-part-clickable" data-region="schulter_re_v" title="Schulter Rechts"/>

        <!-- CHEST & STERNUM -->
        <!-- Sternum (Brustbein) -->
        <path d="M 154,106 L 166,106 L 164,180 L 156,180 Z" class="body-part-clickable" data-region="sternum" title="Brustbein (Sternum)"/>
        <!-- Pectoralis Left -->
        <path d="M 104,116 L 154,116 L 154,178 L 102,168 Z" class="body-part-clickable" data-region="brust_li" title="Brustkorb Links"/>
        <!-- Pectoralis Right -->
        <path d="M 166,116 L 216,116 L 218,168 L 166,178 Z" class="body-part-clickable" data-region="brust_re" title="Brustkorb Rechts"/>

        <!-- ARMS FRONT -->
        <!-- Upper Arm / Biceps -->
        <rect x="62" y="170" width="28" height="66" rx="10" class="body-part-clickable" data-region="oberarm_li" title="Oberarm Links"/>
        <rect x="230" y="170" width="28" height="66" rx="10" class="body-part-clickable" data-region="oberarm_re" title="Oberarm Rechts"/>

        <!-- Elbow Crease / Joint -->
        <ellipse cx="76" cy="246" rx="14" ry="11" class="body-part-clickable" data-region="ellbogen_li" title="Ellbogen Links"/>
        <ellipse cx="244" cy="246" rx="14" ry="11" class="body-part-clickable" data-region="ellbogen_re" title="Ellbogen Rechts"/>

        <!-- Forearm Front -->
        <rect x="64" y="258" width="24" height="68" rx="9" class="body-part-clickable" data-region="unterarm_li" title="Unterarm Links"/>
        <rect x="232" y="258" width="24" height="68" rx="9" class="body-part-clickable" data-region="unterarm_re" title="Unterarm Rechts"/>

        <!-- Wrist Joint -->
        <ellipse cx="76" cy="334" rx="12" ry="8" class="body-part-clickable" data-region="handgelenk_li" title="Handgelenk Links"/>
        <ellipse cx="244" cy="334" rx="12" ry="8" class="body-part-clickable" data-region="handgelenk_re" title="Handgelenk Rechts"/>

        <!-- Hand & Fingers -->
        <path d="M 64,342 C 60,360 60,375 74,385 C 88,385 88,360 86,342 Z" class="body-part-clickable" data-region="hand_li" title="Hand & Finger Links"/>
        <path d="M 256,342 C 260,360 260,375 246,385 C 232,385 232,360 234,342 Z" class="body-part-clickable" data-region="hand_re" title="Hand & Finger Rechts"/>

        <!-- ABDOMEN & TORSO -->
        <!-- Upper Abdomen / Rib Margin -->
        <path d="M 102,170 L 154,180 L 154,218 L 106,218 Z" class="body-part-clickable" data-region="oberbauch_li" title="Oberbauch Links"/>
        <path d="M 166,180 L 218,170 L 214,218 L 166,218 Z" class="body-part-clickable" data-region="oberbauch_re" title="Oberbauch Rechts"/>

        <!-- Mid Abdomen / Navel -->
        <path d="M 108,220 L 212,220 L 206,264 L 114,264 Z" class="body-part-clickable" data-region="bauch_mitte" title="Bauchmitte / Bauchnabel"/>

        <!-- Lower Abdomen / Bladder Area -->
        <path d="M 114,266 L 206,266 L 198,302 L 122,302 Z" class="body-part-clickable" data-region="unterbauch" title="Unterbauch"/>

        <!-- HIPS & PELVIS (LARGE & DETAILED) -->
        <!-- Left Hip Joint / Groin -->
        <path d="M 102,280 L 148,302 L 138,338 L 94,314 Z" class="body-part-clickable" data-region="huefte_li_v" title="Hüfte Links vorn"/>
        <!-- Right Hip Joint / Groin -->
        <path d="M 172,302 L 218,280 L 226,314 L 182,338 Z" class="body-part-clickable" data-region="huefte_re_v" title="Hüfte Rechts vorn"/>

        <!-- LEGS & KNEES FRONT -->
        <!-- Thigh / Quadriceps -->
        <rect x="98" y="324" width="40" height="98" rx="15" class="body-part-clickable" data-region="oberschenkel_li_v" title="Oberschenkel Links"/>
        <rect x="182" y="324" width="40" height="98" rx="15" class="body-part-clickable" data-region="oberschenkel_re_v" title="Oberschenkel Rechts"/>

        <!-- Kneecaps / Patella & Meniscus (Big clickable target) -->
        <path d="M 98,426 L 112,426 L 110,458 L 96,458 Z" class="body-part-clickable" data-region="knie_aussen_li" title="Knie-Außenseite Links"/>
        <ellipse cx="118" cy="442" rx="15" ry="14" class="body-part-clickable" data-region="patella_li" title="Kniescheibe / Knie Links"/>
        <path d="M 126,426 L 140,426 L 140,458 L 126,458 Z" class="body-part-clickable" data-region="knie_innen_li" title="Knie-Innenseite / Innenmeniskus Links"/>

        <path d="M 180,426 L 194,426 L 194,458 L 180,458 Z" class="body-part-clickable" data-region="knie_innen_re" title="Knie-Innenseite / Innenmeniskus Rechts"/>
        <ellipse cx="202" cy="442" rx="15" ry="14" class="body-part-clickable" data-region="patella_re" title="Kniescheibe / Knie Rechts"/>
        <path d="M 208,426 L 222,426 L 224,458 L 210,458 Z" class="body-part-clickable" data-region="knie_aussen_re" title="Knie-Außenseite Rechts"/>

        <!-- Lower Leg / Shin (Schienbein) -->
        <rect x="104" y="462" width="30" height="98" rx="11" class="body-part-clickable" data-region="schienbein_li" title="Schienbein Links"/>
        <rect x="186" y="462" width="30" height="98" rx="11" class="body-part-clickable" data-region="schienbein_re" title="Schienbein Rechts"/>

        <!-- Ankle Joint (Sprunggelenk) -->
        <ellipse cx="119" cy="570" rx="14" ry="10" class="body-part-clickable" data-region="sprunggelenk_li" title="Sprunggelenk / Knöchel Links"/>
        <ellipse cx="201" cy="570" rx="14" ry="10" class="body-part-clickable" data-region="sprunggelenk_re" title="Sprunggelenk / Knöchel Rechts"/>

        <!-- Foot & Toes (Große Zielfläche) -->
        <path d="M 102,582 C 102,582 136,582 136,590 C 136,616 94,616 96,590 Z" class="body-part-clickable" data-region="fuss_li" title="Fuß Links (Spann & Zehen)"/>
        <path d="M 184,582 C 184,582 218,582 218,590 C 220,616 178,616 180,590 Z" class="body-part-clickable" data-region="fuss_re" title="Fuß Rechts (Spann & Zehen)"/>
      </svg>
    `;
  }

  // =========================================================================
  // High-Resolution Large-Scale Detailed Human Anatomy (Back View)
  // ViewBox: 0 0 320 640
  // =========================================================================
  renderHumanBack() {
    const container = document.getElementById('humanBodyBack');
    if (!container) return;
    container.innerHTML = `
      <svg viewBox="0 0 320 640" xmlns="http://www.w3.org/2000/svg" class="anatomical-svg" style="cursor:pointer; pointer-events:auto;">
        <!-- Background Grid (Non-interactive) -->
        <g class="body-background-lines" opacity="0.15" pointer-events="none" style="pointer-events:none;">
          <line x1="160" y1="10" x2="160" y2="630" stroke="#38bdf8" stroke-dasharray="4 4" stroke-width="1.5"/>
          <line x1="40" y1="200" x2="280" y2="200" stroke="#38bdf8" stroke-dasharray="2 4" stroke-width="1"/>
          <line x1="60" y1="360" x2="260" y2="360" stroke="#38bdf8" stroke-dasharray="2 4" stroke-width="1"/>
          <line x1="80" y1="510" x2="240" y2="510" stroke="#38bdf8" stroke-dasharray="2 4" stroke-width="1"/>
        </g>

        <!-- HEAD & CERVICAL SPINE (HWS) -->
        <!-- Occiput / Back of Head -->
        <path d="M 132,18 C 132,6 188,6 188,18 C 188,58 132,58 132,18 Z" class="body-part-clickable" data-region="hinterkopf" title="Hinterkopf / Okziput"/>

        <!-- Cervical Spine (Nacken / HWS C1-C7) -->
        <path d="M 148,60 L 172,60 L 170,104 L 150,104 Z" class="body-part-clickable" data-region="nacken_hws" title="Nacken & HWS (C1-C7)"/>

        <!-- Trapezius / Neck-Shoulder Bridge -->
        <path d="M 100,104 L 148,104 L 146,134 L 98,126 Z" class="body-part-clickable" data-region="trapez_li" title="Trapezmuskel Links"/>
        <path d="M 172,104 L 220,104 L 222,126 L 174,134 Z" class="body-part-clickable" data-region="trapez_re" title="Trapezmuskel Rechts"/>

        <!-- Shoulders Back -->
        <path d="M 76,116 C 62,130 62,156 76,170 C 94,170 102,148 100,116 Z" class="body-part-clickable" data-region="schulter_li_h" title="Schulter hinten Links"/>
        <path d="M 244,116 C 258,130 258,156 244,170 C 226,170 218,148 220,116 Z" class="body-part-clickable" data-region="schulter_re_h" title="Schulter hinten Rechts"/>

        <!-- Scapula (Shoulder Blades) -->
        <path d="M 96,128 L 146,134 L 142,192 L 92,182 Z" class="body-part-clickable" data-region="scapula_li" title="Schulterblatt Links"/>
        <path d="M 174,134 L 224,128 L 228,182 L 178,192 Z" class="body-part-clickable" data-region="scapula_re" title="Schulterblatt Rechts"/>

        <!-- Thoracic Spine (Brustwirbelsäule BWS Th1-Th12) -->
        <path d="M 150,106 L 170,106 L 168,206 L 152,206 Z" class="body-part-clickable" data-region="bws_wirbelsaeule" title="Brustwirbelsäule (BWS)"/>

        <!-- Ribs Back / Mid Back -->
        <path d="M 94,186 L 150,194 L 148,238 L 98,230 Z" class="body-part-clickable" data-region="rippen_h_li" title="Rippen / Rücken hinten Links"/>
        <path d="M 170,194 L 226,186 L 222,230 L 172,238 Z" class="body-part-clickable" data-region="rippen_h_re" title="Rippen / Rücken hinten Rechts"/>

        <!-- Lumbar Spine (LWS L1-L5) -->
        <path d="M 152,208 L 168,208 L 166,268 L 154,268 Z" class="body-part-clickable" data-region="lws_wirbelsaeule" title="Lendenwirbelsäule (LWS)"/>

        <!-- Flanks / Kidneys -->
        <path d="M 100,232 L 150,240 L 146,276 L 108,268 Z" class="body-part-clickable" data-region="flanken_li" title="Flanke / Nierenbereich Links"/>
        <path d="M 170,240 L 220,232 L 212,268 L 174,276 Z" class="body-part-clickable" data-region="flanken_re" title="Flanke / Nierenbereich Rechts"/>

        <!-- Sacrum & SI Joints (ISG / Kreuzbein) -->
        <path d="M 144,270 L 176,270 L 172,314 L 148,314 Z" class="body-part-clickable" data-region="isg_kreuzbein" title="ISG (Iliosakralgelenk) & Kreuzbein"/>

        <!-- Gluteal Muscles (Gesäß / Gluteus) -->
        <path d="M 100,280 L 144,306 L 138,348 L 92,334 Z" class="body-part-clickable" data-region="gesaess_li" title="Gesäß / Gluteus Links"/>
        <path d="M 176,306 L 220,280 L 228,334 L 182,348 Z" class="body-part-clickable" data-region="gesaess_re" title="Gesäß / Gluteus Rechts"/>

        <!-- ARMS BACK -->
        <!-- Triceps / Upper Arm Back -->
        <rect x="62" y="170" width="28" height="66" rx="10" class="body-part-clickable" data-region="oberarm_li_h" title="Oberarm / Trizeps Links"/>
        <rect x="230" y="170" width="28" height="66" rx="10" class="body-part-clickable" data-region="oberarm_re_h" title="Oberarm / Trizeps Rechts"/>

        <!-- Elbow Tip (Olekranon) -->
        <ellipse cx="76" cy="246" rx="13" ry="11" class="body-part-clickable" data-region="ellbogen_li_h" title="Ellbogenspitze Links"/>
        <ellipse cx="244" cy="246" rx="13" ry="11" class="body-part-clickable" data-region="ellbogen_re_h" title="Ellbogenspitze Rechts"/>

        <!-- Forearm Back -->
        <rect x="64" y="258" width="24" height="68" rx="9" class="body-part-clickable" data-region="unterarm_li_h" title="Unterarm hinten Links"/>
        <rect x="232" y="258" width="24" height="68" rx="9" class="body-part-clickable" data-region="unterarm_re_h" title="Unterarm hinten Rechts"/>

        <!-- Hand Back / Dorsum -->
        <path d="M 64,342 C 60,360 60,375 74,385 C 88,385 88,360 86,342 Z" class="body-part-clickable" data-region="handruecken_li" title="Handrücken Links"/>
        <path d="M 256,342 C 260,360 260,375 246,385 C 232,385 232,360 234,342 Z" class="body-part-clickable" data-region="handruecken_re" title="Handrücken Rechts"/>

        <!-- LEGS & KNEES BACK -->
        <!-- Hamstrings / Thighs Back -->
        <rect x="98" y="342" width="40" height="92" rx="15" class="body-part-clickable" data-region="oberschenkel_li_h" title="Oberschenkel hinten / Ischias Links"/>
        <rect x="182" y="342" width="40" height="92" rx="15" class="body-part-clickable" data-region="oberschenkel_re_h" title="Oberschenkel hinten / Ischias Rechts"/>

        <!-- Popliteal Fossa (Kniekehlen) -->
        <ellipse cx="118" cy="446" rx="16" ry="12" class="body-part-clickable" data-region="kniekehle_li" title="Kniekehle Links"/>
        <ellipse cx="202" cy="446" rx="16" ry="12" class="body-part-clickable" data-region="kniekehle_re" title="Kniekehle Rechts"/>

        <!-- Calves / Gastrocnemius (Waden) -->
        <rect x="104" y="462" width="30" height="76" rx="11" class="body-part-clickable" data-region="wade_li" title="Wade Links"/>
        <rect x="186" y="462" width="30" height="76" rx="11" class="body-part-clickable" data-region="wade_re" title="Wade Rechts"/>

        <!-- Achilles Tendon (Achillessehnen) -->
        <rect x="110" y="542" width="18" height="34" rx="6" class="body-part-clickable" data-region="achilles_li" title="Achillessehne Links"/>
        <rect x="192" y="542" width="18" height="34" rx="6" class="body-part-clickable" data-region="achilles_re" title="Achillessehne Rechts"/>

        <!-- Heels & Soles (Ferse & Fersensporn) -->
        <ellipse cx="119" cy="590" rx="16" ry="14" class="body-part-clickable" data-region="ferse_li" title="Ferse & Fußsohle Links"/>
        <ellipse cx="201" cy="590" rx="16" ry="14" class="body-part-clickable" data-region="ferse_re" title="Ferse & Fußsohle Rechts"/>
      </svg>
    `;
  }

  // =========================================================================
  // Detailed Canine Anatomy Map (Buddy, Milla, Bella)
  // ViewBox: 0 0 640 380
  // =========================================================================
  renderDogMap() {
    const container = document.getElementById('dogBodyMap');
    if (!container) return;
    container.innerHTML = `
      <svg viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg" class="anatomical-svg dog-svg" style="cursor:pointer; pointer-events:auto;">
        <!-- Background Grid (Non-interactive) -->
        <g class="body-background-lines" opacity="0.12" pointer-events="none" style="pointer-events:none;">
          <line x1="30" y1="190" x2="610" y2="190" stroke="#f59e0b" stroke-dasharray="4 4" stroke-width="1.5"/>
          <line x1="260" y1="20" x2="260" y2="360" stroke="#f59e0b" stroke-dasharray="2 4" stroke-width="1"/>
          <line x1="480" y1="20" x2="480" y2="360" stroke="#f59e0b" stroke-dasharray="2 4" stroke-width="1"/>
        </g>

        <!-- Muzzle / Jaws / Teeth -->
        <path d="M 40,110 L 95,70 L 110,120 L 55,145 Z" class="body-part-clickable" data-region="dog_schnauze" title="Hund: Fang, Schnauze & Zähne"/>
        
        <!-- Cranium / Forehead / Eyes -->
        <path d="M 95,70 L 145,60 L 160,105 L 110,120 Z" class="body-part-clickable" data-region="dog_kopf" title="Hund: Stirn, Augen & Schädel"/>

        <!-- Ears -->
        <path d="M 135,60 L 165,20 L 178,65 Z" class="body-part-clickable" data-region="dog_ohren" title="Hund: Ohren"/>

        <!-- Cervical Spine (HWS / Nacken) -->
        <path d="M 145,60 L 210,75 L 195,135 L 145,110 Z" class="body-part-clickable" data-region="dog_hws" title="Hund: Halswirbelsäule (HWS)"/>

        <!-- Withers & Shoulder Blade (Scapula) -->
        <path d="M 210,75 L 285,80 L 260,155 L 195,135 Z" class="body-part-clickable" data-region="dog_schulter" title="Hund: Schulterblatt & Widerrist"/>

        <!-- Upper Arm & Elbow Joint -->
        <path d="M 195,135 L 260,155 L 235,215 L 185,195 Z" class="body-part-clickable" data-region="dog_ellbogen" title="Hund: Oberarm & Ellbogengelenk"/>

        <!-- Forearm & Carpal Joint (Vorderfußwurzel) -->
        <rect x="190" y="210" width="28" height="82" rx="10" class="body-part-clickable" data-region="dog_karpal" title="Hund: Vorderfußwurzel & Unterarm"/>

        <!-- Front Paws & Claws -->
        <ellipse cx="204" cy="305" rx="20" ry="14" class="body-part-clickable" data-region="dog_vorderpfoten" title="Hund: Vorderpfoten & Ballen"/>

        <!-- Thoracic Spine (BWS / Rücken) -->
        <path d="M 285,80 L 400,85 L 390,135 L 280,135 Z" class="body-part-clickable" data-region="dog_bws" title="Hund: Brustwirbelsäule & Rücken"/>

        <!-- Ribcage & Chest -->
        <path d="M 265,135 L 390,135 L 375,205 L 255,195 Z" class="body-part-clickable" data-region="dog_brustkorb" title="Hund: Brustkorb & Rippen"/>

        <!-- Lumbar Spine (LWS) -->
        <path d="M 400,85 L 490,95 L 475,145 L 390,135 Z" class="body-part-clickable" data-region="dog_lws" title="Hund: Lendenwirbelsäule (LWS)"/>

        <!-- Abdomen / Mammary Chain (Bauch & Gesäuge) -->
        <path d="M 375,205 L 465,205 L 455,245 L 370,235 Z" class="body-part-clickable" data-region="dog_bauch" title="Hund: Bauch & Gesäugeleiste"/>

        <!-- Pelvis & Sacrum (Kreuzbein & Becken) -->
        <path d="M 490,95 L 555,105 L 535,165 L 475,145 Z" class="body-part-clickable" data-region="dog_becken" title="Hund: Becken & Kreuzbein"/>

        <!-- Hip Joint (Hüfte / HD) -->
        <ellipse cx="515" cy="160" rx="26" ry="22" class="body-part-clickable" data-region="dog_huefte" title="Hund: Hüftgelenk (HD-Bereich)"/>

        <!-- Thigh & Stifle / Knee Joint (Knie & Kreuzband) -->
        <path d="M 495,170 L 548,170 L 530,248 L 480,240 Z" class="body-part-clickable" data-region="dog_knie" title="Hund: Kniegelenk & Oberschenkel"/>

        <!-- Hock / Tarsus (Sprunggelenk & Unterschenkel) -->
        <rect x="490" y="242" width="30" height="60" rx="10" class="body-part-clickable" data-region="dog_sprunggelenk" title="Hund: Sprunggelenk (Tarsus)"/>

        <!-- Hind Paws & Claws -->
        <ellipse cx="505" cy="310" rx="20" ry="14" class="body-part-clickable" data-region="dog_hinterpfoten" title="Hund: Hinterpfoten & Ballen"/>

        <!-- Tail (Rute) -->
        <path d="M 555,105 Q 610,80 625,40 Q 635,60 585,130 Z" class="body-part-clickable" data-region="dog_rute" title="Hund: Rute & Rutenansatz"/>
      </svg>
    `;
  }
}

window.bodyMapManager = new BodyMapManager();
