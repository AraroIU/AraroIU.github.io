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
        navVedana: 'เวทนา',
        navMind: 'จิต',
        footerLink: 'วิธีการเล่นเกมเจริญสติสังเกตเวทนา'
    },
    'en': {
        flag: 'https://flagcdn.com/w40/gb.png',
        text: 'ENG',
        pageTitle: 'Contemplation of Feelings',
        phyTitle: 'Physical Sensation',
        menTitle: 'Mental Sensation',
        sukh: 'Happy',
        dukkh: 'Suffering',
        neutral: 'Neutral',
        reset: 'Reset',
        navHome: 'Home',
        navVedana: 'Vedana',
        navMind: 'Mind',
        footerLink: 'How to play the mindfulness game of observing feelings.'
    }
};

document.getElementById('langSwitchBtn').addEventListener('click', () => {
    // Toggle language
    currentLang = currentLang === 'th' ? 'en' : 'th';
    const dict = langDict[currentLang];

    // Update Switcher Button
    document.getElementById('langFlag').src = dict.flag;
    document.getElementById('langText').innerText = dict.text;

    // Update Global Titles
    document.getElementById('pageTitle').innerText = dict.pageTitle;
    document.getElementById('phyTitle').innerText = dict.phyTitle;
    document.getElementById('menTitle').innerText = dict.menTitle;

    // Update Nav
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems.length >= 3) {
        navItems[0].innerText = dict.navHome;
        navItems[1].innerText = dict.navVedana;
        navItems[2].innerText = dict.navMind;
    }

    // Update Buttons
    document.querySelectorAll('.btn-sukh').forEach(el => el.innerText = dict.sukh);
    document.querySelectorAll('.btn-dukkh').forEach(el => el.innerText = dict.dukkh);
    document.querySelectorAll('.btn-neutral').forEach(el => el.innerText = dict.neutral);
    document.querySelectorAll('.reset-btn').forEach(el => el.innerText = dict.reset);

    // Update Footer Link
    const footerLink = document.querySelector('.footer-link');
    if (footerLink) {
        footerLink.innerText = dict.footerLink;
    }

    // Adjust button font size based on language
    updateButtonFontSize();
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

