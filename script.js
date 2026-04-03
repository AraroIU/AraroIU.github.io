// state dictionary to hold the counts of each button
const counts = {
    'phy-sukh': 0,
    'phy-dukkh': 0,
    'men-sukh': 0,
    'men-dukkh': 0,
    'men-neutral': 0
};

// Current language state
let currentLang = 'th';

// ===== MINDFULNESS TIMER STATE =====
let mindfulnessActive = false;
let mindfulnessStartTime = null;
let mindfulnessElapsed = 0; // in seconds
let mindfulnessInterval = null;

/**
 * Handle SPA Navigation Strategy
 */
function navigateTo(viewId) {
    // Check if returning to home while mindfulness is active → show summary
    if (viewId === 'home' && mindfulnessActive) {
        stopMindfulness();
        showSummary();
    }

    // 1. Hide all sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });

    // 2. Remove active class from nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // 3. Show target section
    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
        targetSection.style.display = 'block';
        setTimeout(() => targetSection.classList.add('active'), 10);
    }

    // 4. Update Nav link active state
    const indexMap = { 'home': 0, 'body': 1, 'vedana': 2, 'mind': 3 };
    const idx = indexMap[viewId];
    if(idx !== undefined && navItems[idx]) {
        navItems[idx].classList.add('active');
    }
}

// ===== MINDFULNESS TIMER FUNCTIONS =====

/**
 * Start mindfulness session - triggered by "เริ่มต้นวันนี้" button
 */
function startMindfulness() {
    if (mindfulnessActive) return; // Already running

    mindfulnessActive = true;
    mindfulnessStartTime = Date.now();
    mindfulnessElapsed = 0;

    // Show floating timer
    const timerEl = document.getElementById('mindfulnessTimer');
    if (timerEl) {
        timerEl.style.display = 'flex';
    }

    // Start the interval that updates the timer every second
    mindfulnessInterval = setInterval(updateTimerDisplay, 1000);

    // Navigate to vedana as the first practice page
    navigateTo('vedana');
}

/**
 * Stop mindfulness session
 */
function stopMindfulness() {
    if (!mindfulnessActive) return;

    mindfulnessActive = false;

    // Calculate final elapsed time
    if (mindfulnessStartTime) {
        mindfulnessElapsed = Math.floor((Date.now() - mindfulnessStartTime) / 1000);
    }

    // Stop interval
    if (mindfulnessInterval) {
        clearInterval(mindfulnessInterval);
        mindfulnessInterval = null;
    }

    // Hide floating timer
    const timerEl = document.getElementById('mindfulnessTimer');
    if (timerEl) {
        timerEl.style.display = 'none';
    }
}

/**
 * Update the floating timer display
 */
function updateTimerDisplay() {
    if (!mindfulnessStartTime) return;

    mindfulnessElapsed = Math.floor((Date.now() - mindfulnessStartTime) / 1000);
    const formatted = formatTime(mindfulnessElapsed);

    const displayEl = document.getElementById('timerDisplay');
    if (displayEl) {
        displayEl.textContent = formatted;
    }
}

/**
 * Format seconds to HH:MM:SS
 */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Show summary modal with all collected scores
 */
function showSummary() {
    const overlay = document.getElementById('summaryOverlay');
    if (!overlay) return;

    // Set time
    const timeValueEl = document.getElementById('summaryTimeValue');
    if (timeValueEl) {
        timeValueEl.textContent = formatTime(mindfulnessElapsed);
    }

    // Set Vedana Physical scores
    document.getElementById('sumPhySukh').textContent = counts['phy-sukh'];
    document.getElementById('sumPhyDukkh').textContent = counts['phy-dukkh'];

    // Set Vedana Mental scores
    document.getElementById('sumMenSukh').textContent = counts['men-sukh'];
    document.getElementById('sumMenDukkh').textContent = counts['men-dukkh'];
    document.getElementById('sumMenNeutral').textContent = counts['men-neutral'];

    // Set Mind State scores
    document.getElementById('sumLobha').textContent = mindCounts['mind-lobha'];
    document.getElementById('sumAlobha').textContent = mindCounts['mind-alobha'];
    document.getElementById('sumDosa').textContent = mindCounts['mind-dosa'];
    document.getElementById('sumAdosa').textContent = mindCounts['mind-adosa'];
    document.getElementById('sumMoha').textContent = mindCounts['mind-moha'];
    document.getElementById('sumAmoha').textContent = mindCounts['mind-amoha'];

    // Set Mind Input Notes
    const note1Field = document.getElementById('mindInput1');
    const note2Field = document.getElementById('mindInput2');
    const note1Text = note1Field ? note1Field.innerText.trim() : '';
    const note2Text = note2Field ? note2Field.innerText.trim() : '';

    const notesSection = document.getElementById('sumMindNotesSection');
    const note1El = document.getElementById('sumNote1');
    const note2El = document.getElementById('sumNote2');

    let hasNotes = false;

    if (note1Text) {
        document.getElementById('sumNote1Text').textContent = note1Text;
        document.getElementById('sumNote1Count').textContent = mindInputCounts['mindInput1'];
        note1El.style.display = 'flex';
        hasNotes = true;
    } else {
        note1El.style.display = 'none';
    }

    if (note2Text) {
        document.getElementById('sumNote2Text').textContent = note2Text;
        document.getElementById('sumNote2Count').textContent = mindInputCounts['mindInput2'];
        note2El.style.display = 'flex';
        hasNotes = true;
    } else {
        note2El.style.display = 'none';
    }

    notesSection.style.display = hasNotes ? 'block' : 'none';

    // Update language-specific labels in summary
    updateSummaryLanguage();

    // Show the overlay
    overlay.style.display = 'flex';
}

/**
 * Close the summary modal
 */
function closeSummary() {
    const overlay = document.getElementById('summaryOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }

    // Reset timer state for next session
    mindfulnessStartTime = null;
    mindfulnessElapsed = 0;
    const displayEl = document.getElementById('timerDisplay');
    if (displayEl) {
        displayEl.textContent = '00:00:00';
    }

    // ===== Reset ALL counters in every category =====

    // Reset Vedana Physical & Mental
    resetGroup('phy');
    resetGroup('men');

    // Reset Mind State groups
    resetMindGroup('lobha');
    resetMindGroup('dosa');
    resetMindGroup('moha');

    // Reset Mind Inputs
    resetMindInputs();
}

/**
 * Update language-specific labels in the summary modal
 */
function updateSummaryLanguage() {
    const dict = langDict[currentLang];
    if (!dict) return;

    // Summary title & time labels
    const sumTitle = document.getElementById('summaryTitle');
    if (sumTitle) sumTitle.textContent = dict.summaryTitle || 'สรุปการเจริญสติ';
    const sumTimeLabel = document.getElementById('summaryTimeLabel');
    if (sumTimeLabel) sumTimeLabel.textContent = dict.summaryTimeLabel || 'เวลาเจริญสติ';
    const sumCloseBtn = document.getElementById('summaryCloseBtn');
    if (sumCloseBtn) sumCloseBtn.textContent = dict.summaryClose || 'ปิด';

    // Category titles
    const sumPhyTitle = document.getElementById('sumPhyTitle');
    if (sumPhyTitle) sumPhyTitle.textContent = dict.phyTitle;
    const sumMenTitle = document.getElementById('sumMenTitle');
    if (sumMenTitle) sumMenTitle.textContent = dict.menTitle;
    const sumMindTitle = document.getElementById('sumMindTitle');
    if (sumMindTitle) sumMindTitle.textContent = dict.sumMindTitle || 'สภาวะจิต';
    const sumMindNotesTitle = document.getElementById('sumMindNotesTitle');
    if (sumMindNotesTitle) sumMindNotesTitle.textContent = dict.mindNoteTitle;

    // Score labels
    document.getElementById('sumPhySukhLabel').textContent = dict.sukh;
    document.getElementById('sumPhyDukkhLabel').textContent = dict.dukkh;
    document.getElementById('sumMenSukhLabel').textContent = dict.sukh;
    document.getElementById('sumMenDukkhLabel').textContent = dict.dukkh;
    document.getElementById('sumMenNeutralLabel').textContent = dict.neutral;

    document.getElementById('sumLobhaLabel').textContent = dict.mindLobha;
    document.getElementById('sumAlobhaLabel').textContent = dict.mindAlobha;
    document.getElementById('sumDosaLabel').textContent = dict.mindDosa;
    document.getElementById('sumAdosaLabel').textContent = dict.mindAdosa;
    document.getElementById('sumMohaLabel').textContent = dict.mindMoha;
    document.getElementById('sumAmohaLabel').textContent = dict.mindAmoha;
}

/**
 * Handle sensation button clicks
 * @param {string} group - Either 'phy' or 'men' (physical or mental)
 * @param {string} emoType - 'sukh', 'dukkh', or 'neutral'
 * @param {string} id - The specific html ID of the button
 */
function recordSensation(group, emoType, id) {
    // 1. Increment counter
    counts[id]++;

    // 2. Update UI Counter
    const counterEl = document.getElementById(`count-${id}`);
    counterEl.innerText = counts[id];

    // Animate counter pop
    counterEl.classList.remove('pop');
    void counterEl.offsetWidth; // trigger reflow
    counterEl.classList.add('pop');

    // Add pop animation to button
    const btn = document.getElementById(id);
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
}

/**
 * Handle reset button clicks
 * @param {string} group - Either 'phy' or 'men'
 */
function resetGroup(group) {
    // Reset all buttons and counters within that group
    Object.keys(counts).forEach(key => {
        if (key.startsWith(group)) {
            // Reset state
            counts[key] = 0;
            // Update UI
            document.getElementById(`count-${key}`).innerText = '0';
        }
    });
}

// Add event listeners for button press light effects
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.circle-btn');

    buttons.forEach(btn => {
        let litTimeout = null;

        const turnOn = () => {
            // Clear any pending turn-off timer
            if (litTimeout) {
                clearTimeout(litTimeout);
                litTimeout = null;
            }
            btn.classList.add('lit');
        };

        const turnOff = () => {
            // Keep lit for 1 second after release
            litTimeout = setTimeout(() => {
                btn.classList.remove('lit');
                litTimeout = null;
            }, 1000);
        };

        btn.addEventListener('mousedown', turnOn);
        btn.addEventListener('touchstart', turnOn, { passive: true });

        btn.addEventListener('mouseup', turnOff);
        btn.addEventListener('mouseleave', turnOff);
        btn.addEventListener('touchend', turnOff);
        btn.addEventListener('touchcancel', turnOff);
    });
});

/**
 * Language Switcher Logic
 */
const langDict = {
    'th': {
        flag: 'https://flagcdn.com/w40/th.png',
        text: 'ไทย',
        pageTitle: 'เวทนานุปัสสนาสติปัฏฐาน',
        phyTitle: 'เวทนาทางกาย',
        menTitle: 'เวทนาทางใจ',
        sukh: 'สุข',
        dukkh: 'ทุกข์',
        neutral: 'เฉยๆ',
        reset: 'รีเซ็ต',
        navHome: 'หน้าแรก',
        navBody: 'กาย',
        navVedana: 'เวทนา',
        navMind: 'จิต',
        footerLink: 'วิธีการเล่นเกมเจริญสติสังเกตเวทนา',
        search: 'ค้นหา',
        startBtn: 'กดเริ่มต้นวันนี้',
        
        // Home Navigation Cards
        homeTitle: 'สวัสดี, อราโร',
        homeSubtitle: 'เริ่มต้นวันใหม่ด้วยสติ',
        homeFooterNoteHtml: '<p>สามารถนำลิงค์ไปวางบนกูเกิ้ล และใช้แอปพลิเคชันบนกูเกิ้ล<br>และ แอพกำลังพัฒนา ควรกดรีเซ็ตแอพใหม่ทุกวัน เพื่อได้รับการอัพเดต</p>',
        contactTitle: 'ติดต่อเรา',

        // View Titles
        pageTitleBody: 'กายานุปัสสนาสติปัฏฐาน',
        pageTitleMind: 'จิตตานุปัสสนาสติปัฏฐาน',
        devNotice: '(อยู่ระหว่างการพัฒนา)',

        // Mind Page
        mindNoteTitle: 'บันทึกสภาวะจิต',
        mindInput1Placeholder: 'พิมพ์ความรู้สึกของคุณ...',
        mindInput2Placeholder: 'พิมพ์ความรู้สึกเพิ่มเติม...',
        mindLobhaTitle: 'โลภะ · อโลภะ',
        mindDosaTitle: 'โทสะ · อโทสะ',
        mindMohaTitle: 'โมหะ · อโมหะ',
        mindLobha: 'จิตโลภ',
        mindAlobha: 'จิตไม่โลภ',
        mindDosa: 'จิตโกรธ',
        mindAdosa: 'จิตไม่โกรธ',
        mindMoha: 'จิตหลง',
        mindAmoha: 'จิตไม่หลง',
        mindFooterLink: 'วิธีการเล่นเกมเจริญสติสังเกตจิต',
        confirm: 'ตกลง',

        // Summary Modal
        summaryTitle: 'สรุปการเจริญสติ',
        summaryTimeLabel: 'เวลาเจริญสติ',
        summaryClose: 'ปิด',
        sumMindTitle: 'สภาวะจิต'
    },
    'en': {
        flag: 'https://flagcdn.com/w40/us.png',
        text: 'ENG',
        pageTitle: 'Vedananupassana Satipatthana',
        phyTitle: 'Physical Sensation',
        menTitle: 'Mental Sensation',
        sukh: 'Happy',
        dukkh: 'Suffering',
        neutral: 'Neutral',
        reset: 'Reset',
        navHome: 'Home',
        navBody: 'Body',
        navVedana: 'Vedana',
        navMind: 'Mind',
        footerLink: 'How to play the mindfulness game of observing feelings',
        search: 'Search',
        startBtn: 'Press Start Today',
        
        // Home Navigation Cards
        homeTitle: 'Hello, Araro',
        homeSubtitle: 'Start your day with mindfulness',
        homeFooterNoteHtml: '<p>You can launch the application from the web browser.<br>The app is under development, please refresh or reset daily to receive updates.</p>',
        contactTitle: 'Contact Us',

        // View Titles
        pageTitleBody: 'Kayanupassana Satipatthana',
        pageTitleMind: 'Cittanupassana Satipatthana',
        devNotice: '(Under Development)',

        // Mind Page
        mindNoteTitle: 'Record Mind State',
        mindInput1Placeholder: 'Type your feelings...',
        mindInput2Placeholder: 'Type additional feelings...',
        mindLobhaTitle: 'Greed · Non-Greed',
        mindDosaTitle: 'Anger · Non-Anger',
        mindMohaTitle: 'Delusion · Non-Delusion',
        mindLobha: 'Greedy',
        mindAlobha: 'Not Greedy',
        mindDosa: 'Angry',
        mindAdosa: 'Not Angry',
        mindMoha: 'Deluded',
        mindAmoha: 'Not Deluded',
        mindFooterLink: 'How to play the mindfulness game of observing mind',
        confirm: 'OK',

        // Summary Modal
        summaryTitle: 'Mindfulness Summary',
        summaryTimeLabel: 'Meditation Time',
        summaryClose: 'Close',
        sumMindTitle: 'Mind States'
    }
};

function updateLanguageUI() {
    const dict = langDict[currentLang];

    // Update Switcher Button
    const flagImg = document.getElementById('langFlag');
    const langTxt = document.getElementById('langText');
    if (flagImg) flagImg.src = dict.flag;
    if (langTxt) langTxt.innerText = dict.text;

    // Update Global Titles
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.innerText = dict.pageTitle;
    const phyTitle = document.getElementById('phyTitle');
    if (phyTitle) phyTitle.innerText = dict.phyTitle;
    const menTitle = document.getElementById('menTitle');
    if (menTitle) menTitle.innerText = dict.menTitle;

    // Update Nav
    const nHome = document.getElementById('navHome');
    if(nHome) nHome.innerText = dict.navHome;
    const nBody = document.getElementById('navBody');
    if(nBody) nBody.innerText = dict.navBody;
    const nVedana = document.getElementById('navVedana');
    if(nVedana) nVedana.innerText = dict.navVedana;
    const nMind = document.getElementById('navMind');
    if(nMind) nMind.innerText = dict.navMind;

    // Update Home Section
    const homeTitleEl = document.getElementById('homeTitle');
    if(homeTitleEl) homeTitleEl.innerText = dict.homeTitle;
    const homeSubEl = document.getElementById('homeSubtitle');
    if(homeSubEl) homeSubEl.innerText = dict.homeSubtitle;
    const startBtn = document.getElementById('startBtn');
    if(startBtn) startBtn.innerText = dict.startBtn;
    const searchText = document.getElementById('searchText');
    if(searchText) searchText.innerText = dict.search;
    
    
    // Update Home Cards Titles
    const cardBodyT = document.getElementById('cardBodyTitle');
    if(cardBodyT) cardBodyT.innerText = dict.navBody;

    const cardVedanaT = document.getElementById('cardVedanaTitle');
    if(cardVedanaT) cardVedanaT.innerText = dict.navVedana;

    const cardMindT = document.getElementById('cardMindTitle');
    if(cardMindT) cardMindT.innerText = dict.navMind;

    // Card descriptions removed - icons only design

    const contactEl = document.getElementById('contactTitle');
    if(contactEl) contactEl.innerText = dict.contactTitle;

    // Update specific pages
    const ptb = document.getElementById('pageTitleBody');
    if(ptb) ptb.innerText = dict.pageTitleBody;
    const ptm = document.getElementById('pageTitleMind');
    if(ptm) ptm.innerText = dict.pageTitleMind;
    
    document.querySelectorAll('.text-red').forEach(el => {
        if(el.innerText.includes('พัฒนา') || el.innerText.includes('Development')){
            el.innerText = dict.devNotice;
        }
    });

    // Update Buttons
    document.querySelectorAll('.btn-sukh').forEach(el => el.innerText = dict.sukh);
    document.querySelectorAll('.btn-dukkh').forEach(el => el.innerText = dict.dukkh);
    document.querySelectorAll('.btn-neutral').forEach(el => el.innerText = dict.neutral);
    document.querySelectorAll('.reset-btn').forEach(el => el.innerText = dict.reset);
    document.querySelectorAll('.confirm-btn').forEach(el => el.innerText = dict.confirm);

    // Update Vedana Footer Link
    const footerLink = document.querySelector('#view-vedana .footer-link');
    if (footerLink) {
        footerLink.innerText = dict.footerLink;
    }

    // ===== Update Mind Page =====
    const mindNoteTitle = document.getElementById('mindNoteTitle');
    if(mindNoteTitle) mindNoteTitle.innerText = dict.mindNoteTitle;

    const mindLobhaTitle = document.getElementById('mindLobhaTitle');
    if(mindLobhaTitle) mindLobhaTitle.innerText = dict.mindLobhaTitle;
    const mindDosaTitle = document.getElementById('mindDosaTitle');
    if(mindDosaTitle) mindDosaTitle.innerText = dict.mindDosaTitle;
    const mindMohaTitle = document.getElementById('mindMohaTitle');
    if(mindMohaTitle) mindMohaTitle.innerText = dict.mindMohaTitle;

    // Mind Buttons
    const lobhaBtn = document.getElementById('mind-lobha');
    if(lobhaBtn) lobhaBtn.innerText = dict.mindLobha;
    const alobhaBtn = document.getElementById('mind-alobha');
    if(alobhaBtn) alobhaBtn.innerText = dict.mindAlobha;
    const dosaBtn = document.getElementById('mind-dosa');
    if(dosaBtn) dosaBtn.innerText = dict.mindDosa;
    const adosaBtn = document.getElementById('mind-adosa');
    if(adosaBtn) adosaBtn.innerText = dict.mindAdosa;
    const mohaBtn = document.getElementById('mind-moha');
    if(mohaBtn) mohaBtn.innerText = dict.mindMoha;
    const amohaBtn = document.getElementById('mind-amoha');
    if(amohaBtn) amohaBtn.innerText = dict.mindAmoha;

    // Mind Input Placeholders
    const mindInput1 = document.getElementById('mindInput1');
    if(mindInput1) mindInput1.setAttribute('data-placeholder', dict.mindInput1Placeholder);
    const mindInput2 = document.getElementById('mindInput2');
    if(mindInput2) mindInput2.setAttribute('data-placeholder', dict.mindInput2Placeholder);

    // Mind Footer Link
    const mindFooterLink = document.getElementById('mindFooterLink');
    if(mindFooterLink) mindFooterLink.innerText = dict.mindFooterLink;

    // Adjust button font size based on language
    updateButtonFontSize();
}

const langBtn = document.getElementById('langSwitchBtn');
if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'th' ? 'en' : 'th';
        updateLanguageUI();
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateLanguageUI();
});

function updateButtonFontSize() {
    const buttons = document.querySelectorAll('.circle-btn');
    const isMobile = window.innerWidth <= 480;
    if (currentLang === 'th') {
        buttons.forEach(btn => btn.style.fontSize = isMobile ? '1.5rem' : '1.8rem');
    } else {
        buttons.forEach(btn => btn.style.fontSize = '');
    }
}

// Set initial Thai font size on load
document.addEventListener('DOMContentLoaded', () => {
    updateButtonFontSize();
});

// ===== MIND PAGE LOGIC =====

// Mind state counters
const mindCounts = {
    'mind-lobha': 0,
    'mind-alobha': 0,
    'mind-dosa': 0,
    'mind-adosa': 0,
    'mind-moha': 0,
    'mind-amoha': 0
};

/**
 * Record a mind state click
 */
function recordMindState(stateType, id) {
    mindCounts[id]++;

    const counterEl = document.getElementById(`count-${id}`);
    counterEl.innerText = mindCounts[id];

    // Animate counter pop
    counterEl.classList.remove('pop');
    void counterEl.offsetWidth;
    counterEl.classList.add('pop');

    // Add pop animation to button
    const btn = document.getElementById(id);
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
}

/**
 * Reset mind state group
 * @param {string} group - 'lobha', 'dosa', or 'moha'
 */
function resetMindGroup(group) {
    const pairs = {
        'lobha': ['mind-lobha', 'mind-alobha'],
        'dosa': ['mind-dosa', 'mind-adosa'],
        'moha': ['mind-moha', 'mind-amoha']
    };

    const keys = pairs[group];
    if (keys) {
        keys.forEach(key => {
            mindCounts[key] = 0;
            document.getElementById(`count-${key}`).innerText = '0';
        });
    }
}

/**
 * Clear mind input field
 */
function clearMindInput(inputId) {
    const field = document.getElementById(inputId);
    if (field) {
        field.innerHTML = '';
        field.focus();
    }
    // Hide clear button
    const clearBtn = document.getElementById(inputId.replace('mindInput', 'mindClear'));
    if (clearBtn) clearBtn.style.display = 'none';
}

// Mind input counters
const mindInputCounts = {
    'mindInput1': 0,
    'mindInput2': 0
};

/**
 * Record mind input as a button press (click to count)
 */
function recordMindInput(inputId, btnId) {
    const field = document.getElementById(inputId);
    // Only count if the click is not inside the editable field (to allow typing)
    // The onclick on the wrapper handles this; clicks on the field itself propagate
    
    mindInputCounts[inputId]++;

    const counterEl = document.getElementById(`count-${inputId}`);
    counterEl.innerText = mindInputCounts[inputId];

    // Animate counter pop
    counterEl.classList.remove('pop');
    void counterEl.offsetWidth;
    counterEl.classList.add('pop');

    // Add pop animation to button
    const btn = document.getElementById(btnId);
    if (!btn.classList.contains('disabled-input')) {
        btn.classList.remove('pop');
        void btn.offsetWidth;
        btn.classList.add('pop');
    }
}

/**
 * Confirm mind inputs and disable them
 */
function confirmMindInputs() {
    ['mindInput1', 'mindInput2'].forEach(id => {
        const field = document.getElementById(id);
        const clearBtn = document.getElementById(id.replace('mindInput', 'mindClear'));
        const wrapperBtn = document.getElementById(id.replace('mindInput', 'mindInputBtn'));
        
        if (field) {
            field.setAttribute('contenteditable', 'false');
        }
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
        if (wrapperBtn) {
            wrapperBtn.classList.add('disabled-input');
        }
    });

    const confirmBtn = document.getElementById('mindConfirmBtn');
    if (confirmBtn) {
        confirmBtn.style.display = 'none'; // Hide confirm button after clicking
    }
}

/**
 * Reset mind input counters and enable input
 */
function resetMindInputs() {
    ['mindInput1', 'mindInput2'].forEach(id => {
        mindInputCounts[id] = 0;
        document.getElementById(`count-${id}`).innerText = '0';
        
        const field = document.getElementById(id);
        const wrapperBtn = document.getElementById(id.replace('mindInput', 'mindInputBtn'));
        
        if (field) {
            field.innerHTML = '';
            field.setAttribute('contenteditable', 'true');
        }
        if (wrapperBtn) {
            wrapperBtn.classList.remove('disabled-input');
        }
    });
    
    // Always show confirm button when reset
    const confirmBtn = document.getElementById('mindConfirmBtn');
    if (confirmBtn) {
        confirmBtn.style.display = 'inline-block';
    }
}

// Mind text input - show/hide clear button based on content
document.addEventListener('DOMContentLoaded', () => {
    const mindInputs = [
        { field: 'mindInput1', clear: 'mindClear1', btn: 'mindInputBtn1' },
        { field: 'mindInput2', clear: 'mindClear2', btn: 'mindInputBtn2' }
    ];

    mindInputs.forEach(({ field, clear, btn }) => {
        const fieldEl = document.getElementById(field);
        const clearEl = document.getElementById(clear);
        const btnEl = document.getElementById(btn);

        if (fieldEl && clearEl) {
            // Show/hide clear button
            fieldEl.addEventListener('input', () => {
                clearEl.style.display = fieldEl.innerText.trim().length > 0 && fieldEl.getAttribute('contenteditable') === 'true' ? 'flex' : 'none';
            });

            // Stop click propagation when typing inside the field
            fieldEl.addEventListener('click', (e) => {
                if(fieldEl.getAttribute('contenteditable') === 'true') {
                    e.stopPropagation();
                }
            });
        }

        // Lit effect for input buttons (only if not disabled)
        if (btnEl) {
            let litTimeout = null;

            btnEl.addEventListener('click', () => {
                if (btnEl.classList.contains('disabled-input')) return;
                
                if (litTimeout) {
                    clearTimeout(litTimeout);
                    litTimeout = null;
                }
                btnEl.classList.add('lit');
                litTimeout = setTimeout(() => {
                    btnEl.classList.remove('lit');
                    litTimeout = null;
                }, 1000);
            });
        }
    });

    // Add lit effect event listeners for mind buttons
    const mindButtons = document.querySelectorAll('.mind-btn');
    mindButtons.forEach(btn => {
        let litTimeout = null;

        const turnOn = () => {
            if (litTimeout) {
                clearTimeout(litTimeout);
                litTimeout = null;
            }
            btn.classList.add('lit');
        };

        const turnOff = () => {
            litTimeout = setTimeout(() => {
                btn.classList.remove('lit');
                litTimeout = null;
            }, 1000);
        };

        btn.addEventListener('mousedown', turnOn);
        btn.addEventListener('touchstart', turnOn, { passive: true });
        btn.addEventListener('mouseup', turnOff);
        btn.addEventListener('mouseleave', turnOff);
        btn.addEventListener('touchend', turnOff);
        btn.addEventListener('touchcancel', turnOff);
    });
});
