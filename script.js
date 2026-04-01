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
 * Handle SPA Navigation Strategy
 */
function navigateTo(viewId) {
    // 1. Hide all sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });

    // 2. Remove active class from nav items (desktop + mobile)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => item.classList.remove('active'));

    // 3. Show target section
    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
        targetSection.style.display = 'block';
        setTimeout(() => targetSection.classList.add('active'), 10);
    }

    // 4. Update Nav link active state (desktop)
    const indexMap = { 'home': 0, 'body': 1, 'vedana': 2, 'mind': 3 };
    const idx = indexMap[viewId];
    if(idx !== undefined && navItems[idx]) {
        navItems[idx].classList.add('active');
    }

    // 5. Update mobile nav active state
    if(idx !== undefined && mobileNavItems[idx]) {
        mobileNavItems[idx].classList.add('active');
    }
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
        startBtn: 'เริ่มต้นวันนี้',
        
        // Home Navigation Cards
        homeTitle: 'สวัสดี, อราโร',
        homeSubtitle: 'เริ่มต้นวันใหม่ด้วยสติและความสงบของคุณ',
        contactTitle: 'ติดต่อเรา',

        // View Titles
        pageTitleBody: 'กายานุปัสสนาสติปัฏฐาน',
        pageTitleMind: 'จิตตานุปัสสนาสติปัฏฐาน',
        devNotice: '(อยู่ระหว่างการพัฒนา)'
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
        startBtn: 'Start Today',
        
        // Home Navigation Cards
        homeTitle: 'Hello, Araro',
        homeSubtitle: 'Start your day with mindfulness and peace',
        contactTitle: 'Contact Us',

        // View Titles
        pageTitleBody: 'Kayanupassana Satipatthana',
        pageTitleMind: 'Cittanupassana Satipatthana',
        devNotice: '(Under Development)'
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

    // Update Mobile Nav
    const mHome = document.getElementById('mNavHome');
    if(mHome) mHome.innerText = dict.navHome;
    const mBody = document.getElementById('mNavBody');
    if(mBody) mBody.innerText = dict.navBody;
    const mVedana = document.getElementById('mNavVedana');
    if(mVedana) mVedana.innerText = dict.navVedana;
    const mMind = document.getElementById('mNavMind');
    if(mMind) mMind.innerText = dict.navMind;

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

    // Update Footer Link
    const footerLink = document.querySelector('.footer-link');
    if (footerLink) {
        footerLink.innerText = dict.footerLink;
    }

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

