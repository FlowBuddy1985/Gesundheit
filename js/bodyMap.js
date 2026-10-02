/**
 * Interactive Anatomical Body Map Engine (Human & Canine)
 * Clean, high-resolution organic anatomy vectors, large touch-targets,
 * multi-view switcher, live hover/tap feedback, and region synchronization.
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
    // Delegated click and touch event listeners
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

    // Hover feedback
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
        el.style.strokeWidth = '2px';
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
  // Clean, High-Resolution Human Anatomy (Front View)
  // ViewBox: 0 0 260 520
  // =========================================================================
  renderHumanFront() {
    const container = document.getElementById('humanBodyFront');
    if (!container) return;
    container.innerHTML = `
      <svg viewBox="0 0 260 520" xmlns="http://www.w3.org/2000/svg" class="anatomical-svg" style="cursor:pointer; pointer-events:auto;">
        <!-- Background guide line -->
        <line x1="130" y1="10" x2="130" y2="510" stroke="#38bdf8" stroke-dasharray="4 4" stroke-width="1" opacity="0.15" pointer-events="none"/>

        <!-- HEAD & NECK -->
        <!-- Forehead & Temples -->
        <path d="M 108,24 C 108,10 152,10 152,24 C 152,40 108,40 108,24 Z" class="body-part-clickable" data-region="kopf_stirn" title="Stirn & Schläfen"/>
        
        <!-- Face & Eyes -->
        <path d="M 110,40 C 110,40 150,40 150,40 C 150,56 110,56 110,40 Z" class="body-part-clickable" data-region="gesicht_wangen" title="Gesicht & Augen"/>
        
        <!-- Jaw & TMJ -->
        <path d="M 114,56 L 146,56 L 140,70 L 120,70 Z" class="body-part-clickable" data-region="kiefer" title="Kiefer & Kiefergelenk"/>

        <!-- Neck Front / Throat -->
        <path d="M 120,70 L 140,70 L 142,88 L 118,88 Z" class="body-part-clickable" data-region="hals_v" title="Hals vorn / Kehlkopf"/>

        <!-- SHOULDERS & CLAVICLES -->
        <path d="M 86,86 L 118,88 L 116,96 L 84,93 Z" class="body-part-clickable" data-region="clavicula_li" title="Schlüsselbein Links"/>
        <path d="M 142,88 L 174,86 L 176,93 L 144,96 Z" class="body-part-clickable" data-region="clavicula_re" title="Schlüsselbein Rechts"/>

        <!-- Shoulders Front (Deltoideus) -->
        <ellipse cx="74" cy="106" rx="15" ry="13" class="body-part-clickable" data-region="schulter_li_v" title="Schulter Links"/>
        <ellipse cx="186" cy="106" rx="15" ry="13" class="body-part-clickable" data-region="schulter_re_v" title="Schulter Rechts"/>

        <!-- CHEST & STERNUM -->
        <path d="M 124,88 L 136,88 L 134,148 L 126,148 Z" class="body-part-clickable" data-region="sternum" title="Brustbein (Sternum)"/>
        <path d="M 88,96 L 124,96 L 124,146 L 86,138 Z" class="body-part-clickable" data-region="brust_li" title="Brustkorb Links"/>
        <path d="M 136,96 L 172,96 L 174,138 L 136,146 Z" class="body-part-clickable" data-region="brust_re" title="Brustkorb Rechts"/>

        <!-- ARMS FRONT -->
        <rect x="56" y="122" width="22" height="52" rx="8" class="body-part-clickable" data-region="oberarm_li" title="Oberarm Links"/>
        <rect x="182" y="122" width="22" height="52" rx="8" class="body-part-clickable" data-region="oberarm_re" title="Oberarm Rechts"/>

        <ellipse cx="67" cy="180" rx="11" ry="9" class="body-part-clickable" data-region="ellbogen_li" title="Ellbogen Links"/>
        <ellipse cx="193" cy="180" rx="11" ry="9" class="body-part-clickable" data-region="ellbogen_re" title="Ellbogen Rechts"/>

        <rect x="56" y="190" width="20" height="54" rx="7" class="body-part-clickable" data-region="unterarm_li" title="Unterarm Links"/>
        <rect x="184" y="190" width="20" height="54" rx="7" class="body-part-clickable" data-region="unterarm_re" title="Unterarm Rechts"/>

        <ellipse cx="66" cy="249" rx="9" ry="7" class="body-part-clickable" data-region="handgelenk_li" title="Handgelenk Links"/>
        <ellipse cx="194" cy="249" rx="9" ry="7" class="body-part-clickable" data-region="handgelenk_re" title="Handgelenk Rechts"/>

        <path d="M 57,256 C 53,270 53,282 66,290 C 78,290 78,270 76,256 Z" class="body-part-clickable" data-region="hand_li" title="Hand & Finger Links"/>
        <path d="M 203,256 C 207,270 207,282 194,290 C 182,290 182,270 184,256 Z" class="body-part-clickable" data-region="hand_re" title="Hand & Finger Rechts"/>

        <!-- ABDOMEN & TORSO -->
        <path d="M 86,140 L 124,148 L 124,175 L 90,175 Z" class="body-part-clickable" data-region="oberbauch_li" title="Oberbauch Links"/>
        <path d="M 136,148 L 174,140 L 170,175 L 136,175 Z" class="body-part-clickable" data-region="oberbauch_re" title="Oberbauch Rechts"/>

        <path d="M 90,177 L 170,177 L 166,210 L 94,210 Z" class="body-part-clickable" data-region="bauch_mitte" title="Bauchmitte / Bauchnabel"/>

        <path d="M 94,212 L 166,212 L 160,240 L 100,240 Z" class="body-part-clickable" data-region="unterbauch" title="Unterbauch"/>

        <!-- HIPS & PELVIS -->
        <path d="M 90,222 L 124,240 L 116,268 L 84,250 Z" class="body-part-clickable" data-region="huefte_li_v" title="Hüfte Links vorn"/>
        <path d="M 136,240 L 170,222 L 176,250 L 144,268 Z" class="body-part-clickable" data-region="huefte_re_v" title="Hüfte Rechts vorn"/>

        <!-- LEGS & KNEES FRONT -->
        <rect x="82" y="256" width="32" height="80" rx="12" class="body-part-clickable" data-region="oberschenkel_li_v" title="Oberschenkel Links"/>
        <rect x="146" y="256" width="32" height="80" rx="12" class="body-part-clickable" data-region="oberschenkel_re_v" title="Oberschenkel Rechts"/>

        <!-- Kneecaps / Patella & Meniscus -->
        <ellipse cx="98" cy="344" rx="13" ry="12" class="body-part-clickable" data-region="patella_li" title="Kniescheibe / Knie Links"/>
        <path d="M 106,336 L 116,336 L 116,354 L 106,354 Z" class="body-part-clickable" data-region="knie_innen_li" title="Innenmeniskus Links"/>

        <path d="M 144,336 L 154,336 L 154,354 L 144,354 Z" class="body-part-clickable" data-region="knie_innen_re" title="Innenmeniskus Rechts"/>
        <ellipse cx="162" cy="344" rx="13" ry="12" class="body-part-clickable" data-region="patella_re" title="Kniescheibe / Knie Rechts"/>

        <!-- Lower Leg / Shin -->
        <rect x="86" y="360" width="24" height="78" rx="9" class="body-part-clickable" data-region="schienbein_li" title="Schienbein Links"/>
        <rect x="150" y="360" width="24" height="78" rx="9" class="body-part-clickable" data-region="schienbein_re" title="Schienbein Rechts"/>

        <!-- Ankle -->
        <ellipse cx="98" cy="446" rx="11" ry="8" class="body-part-clickable" data-region="sprunggelenk_li" title="Sprunggelenk / Knöchel Links"/>
        <ellipse cx="162" cy="446" rx="11" ry="8" class="body-part-clickable" data-region="sprunggelenk_re" title="Sprunggelenk / Knöchel Rechts"/>

        <!-- Foot & Toes -->
        <path d="M 85,455 C 85,455 113,455 113,462 C 113,480 78,480 80,462 Z" class="body-part-clickable" data-region="fuss_li" title="Fuß Links (Spann & Zehen)"/>
        <path d="M 147,455 C 147,455 175,455 175,462 C 177,480 142,480 144,462 Z" class="body-part-clickable" data-region="fuss_re" title="Fuß Rechts (Spann & Zehen)"/>
      </svg>
    `;
  }

  // =========================================================================
  // Clean, High-Resolution Human Anatomy (Back View)
  // ViewBox: 0 0 260 520
  // =========================================================================
  renderHumanBack() {
    const container = document.getElementById('humanBodyBack');
    if (!container) return;
    container.innerHTML = `
      <svg viewBox="0 0 260 520" xmlns="http://www.w3.org/2000/svg" class="anatomical-svg" style="cursor:pointer; pointer-events:auto;">
        <!-- Background guide line -->
        <line x1="130" y1="10" x2="130" y2="510" stroke="#38bdf8" stroke-dasharray="4 4" stroke-width="1" opacity="0.15" pointer-events="none"/>

        <!-- HEAD & CERVICAL SPINE (HWS) -->
        <path d="M 108,18 C 108,6 152,6 152,18 C 152,50 108,50 108,18 Z" class="body-part-clickable" data-region="hinterkopf" title="Hinterkopf / Okziput"/>

        <!-- Cervical Spine (Nacken / HWS C1-C7) -->
        <path d="M 120,52 L 140,52 L 138,86 L 122,86 Z" class="body-part-clickable" data-region="nacken_hws" title="Nacken & HWS (C1-C7)"/>

        <!-- Trapezius -->
        <path d="M 84,86 L 122,86 L 120,110 L 82,104 Z" class="body-part-clickable" data-region="trapez_li" title="Trapezmuskel Links"/>
        <path d="M 138,86 L 176,86 L 178,104 L 140,110 Z" class="body-part-clickable" data-region="trapez_re" title="Trapezmuskel Rechts"/>

        <!-- Shoulders Back -->
        <ellipse cx="74" cy="106" rx="15" ry="13" class="body-part-clickable" data-region="schulter_li_h" title="Schulter hinten Links"/>
        <ellipse cx="186" cy="106" rx="15" ry="13" class="body-part-clickable" data-region="schulter_re_h" title="Schulter hinten Rechts"/>

        <!-- Scapula (Shoulder Blades) -->
        <path d="M 80,108 L 118,112 L 114,154 L 78,148 Z" class="body-part-clickable" data-region="scapula_li" title="Schulterblatt Links"/>
        <path d="M 142,112 L 180,108 L 182,148 L 146,154 Z" class="body-part-clickable" data-region="scapula_re" title="Schulterblatt Rechts"/>

        <!-- Thoracic Spine (BWS Th1-Th12) -->
        <path d="M 122,86 L 138,86 L 136,166 L 124,166 Z" class="body-part-clickable" data-region="bws_wirbelsaeule" title="Brustwirbelsäule (BWS)"/>

        <!-- Ribs Back / Mid Back -->
        <path d="M 78,150 L 122,156 L 120,192 L 82,186 Z" class="body-part-clickable" data-region="rippen_h_li" title="Rippen hinten Links"/>
        <path d="M 138,156 L 182,150 L 178,186 L 140,192 Z" class="body-part-clickable" data-region="rippen_h_re" title="Rippen hinten Rechts"/>

        <!-- Lumbar Spine (LWS L1-L5) -->
        <path d="M 124,168 L 136,168 L 134,215 L 126,215 Z" class="body-part-clickable" data-region="lws_wirbelsaeule" title="Lendenwirbelsäule (LWS)"/>

        <!-- Flanks / Kidneys -->
        <path d="M 84,188 L 122,194 L 118,222 L 90,216 Z" class="body-part-clickable" data-region="flanken_li" title="Flanke / Nierenbereich Links"/>
        <path d="M 138,194 L 176,188 L 170,216 L 142,222 Z" class="body-part-clickable" data-region="flanken_re" title="Flanke / Nierenbereich Rechts"/>

        <!-- Sacrum & SI Joints (ISG / Kreuzbein) -->
        <path d="M 118,216 L 142,216 L 138,252 L 122,252 Z" class="body-part-clickable" data-region="isg_kreuzbein" title="ISG (Iliosakralgelenk) & Kreuzbein"/>

        <!-- Gluteal Muscles (Gesäß / Gluteus) -->
        <path d="M 84,225 L 120,244 L 114,276 L 78,266 Z" class="body-part-clickable" data-region="gesaess_li" title="Gesäß / Gluteus Links"/>
        <path d="M 140,244 L 176,225 L 182,266 L 146,276 Z" class="body-part-clickable" data-region="gesaess_re" title="Gesäß / Gluteus Rechts"/>

        <!-- ARMS BACK -->
        <rect x="56" y="122" width="22" height="52" rx="8" class="body-part-clickable" data-region="oberarm_li_h" title="Oberarm / Trizeps Links"/>
        <rect x="182" y="122" width="22" height="52" rx="8" class="body-part-clickable" data-region="oberarm_re_h" title="Oberarm / Trizeps Rechts"/>

        <ellipse cx="67" cy="180" rx="10" ry="9" class="body-part-clickable" data-region="ellbogen_li_h" title="Ellbogenspitze Links"/>
        <ellipse cx="193" cy="180" rx="10" ry="9" class="body-part-clickable" data-region="ellbogen_re_h" title="Ellbogenspitze Rechts"/>

        <rect x="56" y="190" width="20" height="54" rx="7" class="body-part-clickable" data-region="unterarm_li_h" title="Unterarm hinten Links"/>
        <rect x="184" y="190" width="20" height="54" rx="7" class="body-part-clickable" data-region="unterarm_re_h" title="Unterarm hinten Rechts"/>

        <path d="M 57,256 C 53,270 53,282 66,290 C 78,290 78,270 76,256 Z" class="body-part-clickable" data-region="handruecken_li" title="Handrücken Links"/>
        <path d="M 203,256 C 207,270 207,282 194,290 C 182,290 182,270 184,256 Z" class="body-part-clickable" data-region="handruecken_re" title="Handrücken Rechts"/>

        <!-- LEGS & KNEES BACK -->
        <rect x="82" y="270" width="32" height="74" rx="12" class="body-part-clickable" data-region="oberschenkel_li_h" title="Oberschenkel hinten / Ischias Links"/>
        <rect x="146" y="270" width="32" height="74" rx="12" class="body-part-clickable" data-region="oberschenkel_re_h" title="Oberschenkel hinten / Ischias Rechts"/>

        <!-- Popliteal Fossa (Kniekehlen) -->
        <ellipse cx="98" cy="350" rx="13" ry="10" class="body-part-clickable" data-region="kniekehle_li" title="Kniekehle Links"/>
        <ellipse cx="162" cy="350" rx="13" ry="10" class="body-part-clickable" data-region="kniekehle_re" title="Kniekehle Rechts"/>

        <!-- Calves (Waden) -->
        <rect x="86" y="362" width="24" height="60" rx="9" class="body-part-clickable" data-region="wade_li" title="Wade Links"/>
        <rect x="150" y="362" width="24" height="60" rx="9" class="body-part-clickable" data-region="wade_re" title="Wade Rechts"/>

        <!-- Achilles Tendon -->
        <rect x="92" y="426" width="13" height="26" rx="5" class="body-part-clickable" data-region="achilles_li" title="Achillessehne Links"/>
        <rect x="155" y="426" width="13" height="26" rx="5" class="body-part-clickable" data-region="achilles_re" title="Achillessehne Rechts"/>

        <!-- Heels & Soles -->
        <ellipse cx="98" cy="462" rx="13" ry="11" class="body-part-clickable" data-region="ferse_li" title="Ferse & Fußsohle Links"/>
        <ellipse cx="162" cy="462" rx="13" ry="11" class="body-part-clickable" data-region="ferse_re" title="Ferse & Fußsohle Rechts"/>
      </svg>
    `;
  }

  // =========================================================================
  // Detailed Canine Anatomy Map (Buddy, Milla, Bella)
  // ViewBox: 0 0 540 320
  // =========================================================================
  renderDogMap() {
    const container = document.getElementById('dogBodyMap');
    if (!container) return;
    container.innerHTML = `
      <svg viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg" class="anatomical-svg dog-svg" style="cursor:pointer; pointer-events:auto;">
        <!-- Muzzle / Jaws / Teeth -->
        <path d="M 40,95 L 90,65 L 100,105 L 55,125 Z" class="body-part-clickable" data-region="dog_schnauze" title="Hund: Fang, Schnauze & Zähne"/>
        
        <!-- Cranium / Forehead / Eyes -->
        <path d="M 90,65 L 130,55 L 140,95 L 100,105 Z" class="body-part-clickable" data-region="dog_kopf" title="Hund: Stirn, Augen & Schädel"/>

        <!-- Ears -->
        <path d="M 120,55 L 145,20 L 155,60 Z" class="body-part-clickable" data-region="dog_ohren" title="Hund: Ohren"/>

        <!-- Cervical Spine (HWS / Nacken) -->
        <path d="M 130,55 L 185,65 L 175,115 L 130,95 Z" class="body-part-clickable" data-region="dog_hws" title="Hund: Halswirbelsäule (HWS)"/>

        <!-- Withers & Shoulder Blade (Scapula) -->
        <path d="M 185,65 L 245,70 L 225,135 L 175,115 Z" class="body-part-clickable" data-region="dog_schulter" title="Hund: Schulterblatt & Widerrist"/>

        <!-- Upper Arm & Elbow Joint -->
        <path d="M 175,115 L 225,135 L 205,185 L 165,170 Z" class="body-part-clickable" data-region="dog_ellbogen" title="Hund: Oberarm & Ellbogengelenk"/>

        <!-- Forearm & Carpal Joint (Vorderfußwurzel) -->
        <rect x="170" y="180" width="24" height="70" rx="8" class="body-part-clickable" data-region="dog_karpal" title="Hund: Vorderfußwurzel & Unterarm"/>

        <!-- Front Paws & Claws -->
        <ellipse cx="182" cy="260" rx="18" ry="12" class="body-part-clickable" data-region="dog_vorderpfoten" title="Hund: Vorderpfoten & Ballen"/>

        <!-- Thoracic Spine (BWS / Rücken) -->
        <path d="M 245,70 L 345,75 L 335,120 L 240,120 Z" class="body-part-clickable" data-region="dog_bws" title="Hund: Brustwirbelsäule & Rücken"/>

        <!-- Ribcage & Chest -->
        <path d="M 230,120 L 335,120 L 325,175 L 220,170 Z" class="body-part-clickable" data-region="dog_brustkorb" title="Hund: Brustkorb & Rippen"/>

        <!-- Lumbar Spine (LWS) -->
        <path d="M 345,75 L 420,80 L 410,125 L 335,120 Z" class="body-part-clickable" data-region="dog_lws" title="Hund: Lendenwirbelsäule (LWS)"/>

        <!-- Abdomen / Mammary Chain (Bauch & Gesäuge) -->
        <path d="M 325,175 L 400,175 L 395,210 L 320,205 Z" class="body-part-clickable" data-region="dog_bauch" title="Hund: Bauch & Gesäugeleiste"/>

        <!-- Pelvis & Sacrum (Kreuzbein & Becken) -->
        <path d="M 420,80 L 475,90 L 460,145 L 410,125 Z" class="body-part-clickable" data-region="dog_becken" title="Hund: Becken & Kreuzbein"/>

        <!-- Hip Joint (Hüfte / HD) -->
        <ellipse cx="440" cy="140" rx="22" ry="19" class="body-part-clickable" data-region="dog_huefte" title="Hund: Hüftgelenk (HD-Bereich)"/>

        <!-- Thigh & Stifle / Knee Joint (Knie & Kreuzband) -->
        <path d="M 425,150 L 470,150 L 455,215 L 410,210 Z" class="body-part-clickable" data-region="dog_knie" title="Hund: Kniegelenk & Oberschenkel"/>

        <!-- Hock / Tarsus (Sprunggelenk & Unterschenkel) -->
        <rect x="420" y="210" width="26" height="52" rx="8" class="body-part-clickable" data-region="dog_sprunggelenk" title="Hund: Sprunggelenk (Tarsus)"/>

        <!-- Hind Paws & Claws -->
        <ellipse cx="433" cy="270" rx="18" ry="12" class="body-part-clickable" data-region="dog_hinterpfoten" title="Hund: Hinterpfoten & Ballen"/>

        <!-- Tail (Rute) -->
        <path d="M 475,90 Q 520,70 530,35 Q 540,55 500,115 Z" class="body-part-clickable" data-region="dog_rute" title="Hund: Rute & Rutenansatz"/>
      </svg>
    `;
  }
}

window.bodyMapManager = new BodyMapManager();
