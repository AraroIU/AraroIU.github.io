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
    const indexMap = { 'home': 0, 'body': 1, 'vedana': 2, 'mind': 3, 'guide': 2, 'body-guide': 1, 'mind-guide': 3 };
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

    // Set Body Posture scores
    document.getElementById('sumWalk').textContent = bodyCounts['body-walk'];
    document.getElementById('sumStand').textContent = bodyCounts['body-stand'];
    document.getElementById('sumSit').textContent = bodyCounts['body-sit'];
    document.getElementById('sumLie').textContent = bodyCounts['body-lie'];

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

    // Reset Body Postures
    resetBodyPostures();
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
    const sumBodyTitle = document.getElementById('sumBodyTitle');
    if (sumBodyTitle) sumBodyTitle.textContent = dict.sumBodyTitle || 'กาย (อิริยาบถ 4)';
    const sumPhyTitle = document.getElementById('sumPhyTitle');
    if (sumPhyTitle) sumPhyTitle.textContent = dict.phyTitle;
    const sumMenTitle = document.getElementById('sumMenTitle');
    if (sumMenTitle) sumMenTitle.textContent = dict.menTitle;
    const sumMindTitle = document.getElementById('sumMindTitle');
    if (sumMindTitle) sumMindTitle.textContent = dict.sumMindTitle || 'สภาวะจิต';
    const sumMindNotesTitle = document.getElementById('sumMindNotesTitle');
    if (sumMindNotesTitle) sumMindNotesTitle.textContent = dict.mindNoteTitle;

    // Score labels
    // Body posture labels
    const sumWalkLabel = document.getElementById('sumWalkLabel');
    if (sumWalkLabel) sumWalkLabel.textContent = dict.bodyWalk;
    const sumStandLabel = document.getElementById('sumStandLabel');
    if (sumStandLabel) sumStandLabel.textContent = dict.bodyStand;
    const sumSitLabel = document.getElementById('sumSitLabel');
    if (sumSitLabel) sumSitLabel.textContent = dict.bodySit;
    const sumLieLabel = document.getElementById('sumLieLabel');
    if (sumLieLabel) sumLieLabel.textContent = dict.bodyLie;

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
        homeIntroText1: 'การเจริญสติ ด้วย กาย หรือ เวทนา หรือ จิต หรือ ธรรม ไม่จำเป็นจะต้องเจริญทุกอย่าง',
        homeIntroText2: 'การเจริญสติ จะสังเกตการเจริญสติตามจริตนิสัยใจคอ ลองใช้เกมนี้เป็นเครื่องทดสอบของสติว่า ถูกจริตนิสัยกับกรรมฐานกองไหน กาย หรือ เวทนา หรือ จิต (ในเบื้องต้น) เพื่อต่อยอดไปสู่การเจริญสติที่ยิ่งๆขึ้นไปในหมวดธรรม',
        homeFooterNoteHtml: '<p>สามารถนำลิงค์ไปวางบนกูเกิ้ล และใช้แอปพลิเคชันบนกูเกิ้ล แอพกำลังพัฒนา ควรกดรีเซ็ตแอพใหม่ทุกวัน เพื่อได้รับการอัพเดต</p>',
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
        mindFooterLink: 'วิธีการเจริญสติสังเกตจิต',
        confirm: 'ตกลง',

        // Summary Modal
        summaryTitle: 'สรุปการเจริญสติ',
        summaryTimeLabel: 'เวลาเจริญสติ',
        summaryClose: 'ปิด',
        sumBodyTitle: 'กาย (อิริยาบถ 4)',
        sumMindTitle: 'สภาวะจิต',

        // Guide Page
        guideBackText: 'กลับ',
        guideMainTitle: 'เวทนานุปัสสนาสติปัฏฐาน',
        guideMainSubtitle: 'วิธีการเจริญสติด้วยการสังเกตเวทนา',
        guideOverviewBadge: 'ภาพรวม',
        guideOverviewText: 'เวทนาจะมีตั้งแต่ <strong>เวทนา 2</strong> ไปจนถึง <strong>เวทนา 108</strong>',
        guideOverviewNote: 'เวทนา 2 จะมี <em>เวทนาทางร่างกาย</em> กับ <em>เวทนาทางใจ</em>',
        guideBodyTitleText: 'เวทนาทางร่างกาย',
        guideBodyDesc: 'เวทนาทางร่างกาย แบ่งออกเป็น <strong>2</strong> คือ',
        guideBodySukh: 'ความรู้สึกสุข',
        guideBodySukhSub: '(ทางร่างกาย)',
        guideBodyDukkh: 'ความรู้สึกทุกข์',
        guideBodyDukkhSub: '(ทางร่างกาย)',
        guideMindTitleText: 'เวทนาทางใจ',
        guideMindDesc: 'เวทนาทางใจ แบ่งออกเป็น <strong>3</strong> คือ',
        guideMindSukh: 'ความรู้สึกสุข',
        guideMindSukhSub: '(ทางใจ)',
        guideMindDukkh: 'ความรู้สึกทุกข์',
        guideMindDukkhSub: '(ทางใจ)',
        guideMindNeutral: 'ความรู้สึกเฉยๆ',
        guideMindNeutralSub: '(ทางใจ)',
        guidePracticeTitleText: 'วิธีเจริญสติด้วยการดูเวทนา',
        guidePracticeBody: 'ถ้าเวทนาทางกาย (สุข, ทุกข์) ตรงส่วนไหนของกาย ก็ให้มีสติ กำหนดรู้เวทนา ไปตรงนั้น ในส่วนต่างๆ ของกาย',
        guidePracticeMind: 'ถ้ามีความรู้สึก (สุข, ทุกข์ หรือ เฉยๆ) ทางใจ ก็ให้มีสติ กำหนดรู้ เวทนาทางใจ ไป ณ ขณะนั้น',
        guidePracticeInsight: 'แต่เวทนาทางใจ จะเกิดได้ทีละอย่าง เช่น ขณะที่มีความสุขใจอยู่ ในขณะนั้น ความทุกข์ และ ความเฉยๆ ทางใจจะไม่มี ให้มีสติกำหนดรู้ เวทนาทางใจ',
        guideObserveTitleText: 'ลองสังเกต ณ ขณะนี้',
        guideObserveText: 'ความรู้สึกทางใจเป็นแบบไหน?',
        guideObserveSukh: 'ขณะนี้ จิตใจมีความสุข',
        guideObserveDukkh: 'หรือ มีความทุกข์',
        guideObserveNeutral: 'หรือ เฉยๆ',
        guideObserveConclusion: 'ให้มีสติ รู้เท่าทันเวทนา',
        guideSensesBadge: 'หรือ…',
        guideSenseEye: 'ในขณะที่.. <strong>ตา</strong> มองเห็น <strong>รูป</strong>',
        guideSenseEyeVedana: 'จิตใจ มี(ความสุข ทุกข์ หรือ เฉยๆ) ให้มีสติ รู้ทัน',
        guideSenseEar: 'ในขณะที่.. <strong>หู</strong> ได้ยิน <strong>เสียง</strong>',
        guideSenseEarVedana: 'จิตใจ มี(ความสุข ทุกข์ หรือ เฉยๆ) ให้มีสติ รู้ทัน',
        guideSenseThink: 'ในขณะที่ มี<strong>ความคิด</strong> เกิดขึ้น',
        guideSenseThinkVedana: 'จิตใจ มี(ความสุข ทุกข์ หรือ เฉยๆ) ให้มีสติ รู้ทัน',
        guideVedana5Desc: 'แล้วให้สังเกตเห็นว่า..',
        guideV5BodyLabel: 'เวทนา 2 ทางร่างกาย',
        guideV5MindLabel: 'เวทนา 3 ทางใจ',
        guideV5SepText: 'แยกออกจากกัน คนละส่วนกัน',
        guideVedana5Conclusion: 'ก็จะเรียกว่า <strong>เวทนา 5</strong>',
        guideLiberationText: 'เกมส์เจริญสตินี้ ก็เปรียบเสมือนเครื่องมือที่ช่วยในการเจริญสติ ช่วยให้มีการระลึกถึงสติ ในเบื้องต้น เพราะขณะที่กดปุ่ม มีการนับจำนวนเวทนาแต่ละครั้ง นั้นก็เท่ากับว่า ขณะนั้นมีสติ เท่ากับจำนวนที่กดปุ่มลงไปนั้น',

        // Body Page
        bodyPostureTitle: 'อิริยาบถ 4',
        bodyWalk: 'เดิน',
        bodyStand: 'ยืน',
        bodySit: 'นั่ง',
        bodyLie: 'นอน',
        bodyWalkText: 'เมื่อร่างกายเดินอยู่ ก็รู้ชัดว่าร่างกายเดินอยู่',
        bodyStandText: 'เมื่อร่างกายยืนอยู่ ก็รู้ชัดว่าร่างกายยืนอยู่',
        bodySitText: 'เมื่อร่างกายนั่งอยู่ ก็รู้ชัดว่าร่างกายนั่งอยู่',
        bodyLieText: 'เมื่อร่างกายนอนอยู่ ก็รู้ชัดว่าร่างกายนอนอยู่',
        bodyFooterWisdom: 'หรือตั้งกายไว้ด้วยอาการอย่างใดๆ ก็รู้ชัดอาการอย่างนั้น',
        bodyGuideLink: 'วิธีการเจริญสติสังเกตกาย',

        // Body Guide Page
        bodyGuideBackText: 'กลับ',
        bodyGuideMainTitle: 'กายานุปัสสนาสติปัฏฐาน',
        bodyGuideMainSubtitle: 'วิธีการเจริญสติสังเกตกาย',
        bodyGuideOverviewBadge: 'ภาพรวม',
        bodyGuideOverviewText: 'วิธีการเจริญสติสังเกตในหมวดกายนี้ สามารถมีสติระลึกรู้กายได้หลายอย่าง หลายกรรมฐาน ในเบื้องต้นจะขอยกตัวอย่าง การเจริญสติด้วยกายในหมวด อริยาบท 4 คือ',
        bodyGuideWalkTitleText: 'เดิน',
        bodyGuideWalkDesc: 'เมื่อร่างกาย เดิน ก็มีสติรู้ชัด เห็นร่างกายเดิน (เห็นร่างกาย เหมือนเห็นคนอื่น)',
        bodyGuideStandTitleText: 'ยืน',
        bodyGuideStandDesc: 'เมื่อร่างกาย ยืน ก็มีสติรู้ชัด เห็นร่างกายยืน (เห็นร่างกาย เหมือนเห็นคนอื่น)',
        bodyGuideSitTitleText: 'นั่ง',
        bodyGuideSitDesc: 'เมื่อร่างกาย นั่ง ก็มีสติรู้ชัด เห็นร่างกายนั่ง (เห็นร่างกาย เหมือนเห็นคนอื่น)',
        bodyGuideLieTitleText: 'นอน',
        bodyGuideLieDesc: 'เมื่อร่างกาย นอน ก็มีสติรู้ชัด เห็นร่างกายนอน (เห็นร่างกาย เหมือนเห็นคนอื่น)',
        bodyGuideOtherTitleText: 'อาการอื่นๆ',
        bodyGuideOtherDesc: 'หรือตั้งกายไว้ด้วยอาการอย่างใดๆ ก็รู้ชัดอาการอย่างนั้น (เห็นร่างกาย เหมือนเห็นคนอื่น)',
        bodyGuideFinalText: 'เกมส์เจริญสตินี้ ก็เปรียบเสมือนเครื่องมือที่ช่วยในการเจริญสติ ช่วยให้มีการระลึกถึงสติ ในเบื้องต้น เพราะขณะที่กดปุ่ม มีการนับจำนวนอริยาบทกายแต่ละครั้ง นั้นก็เท่ากับว่า ขณะนั้นมีสติ เท่ากับจำนวนที่กดปุ่มลงไปนั้น',

        // Mind Guide Page
        mindGuideBackText: 'กลับ',
        mindGuideMainTitle: 'จิตตานุปัสสนาสติปัฏฐาน',
        mindGuideMainSubtitle: 'วิธีการเจริญสติสังเกตจิต',
        mindGuideOverviewBadge: 'ภาพรวม',
        mindGuideOverviewText: 'การดูจิต ท่านสอนให้ดูจิตเป็นคู่ๆ ให้รู้ถึงความมีอยู่และความไม่มีอยู่ของจิตชนิดนั้นๆ เพื่อให้เห็นถึงความไม่เที่ยงแท้แน่นอนของจิตชนิดนั้นๆ',
        mindGuideImpermanenceTitleText: 'ความไม่เที่ยงของจิต',
        mindGuideImpermanenceDesc: 'ถ้าสิ่งนั้นเที่ยงแท้แน่นอนจริง สิ่งนั้นจะต้องแน่ สิ่งนั้นจะต้องหนึ่ง สิ่งนั้นจะต้องไม่เปลี่ยนแปลง ก็ในเมื่อสิ่งนั้นเป็นสอง ไม่เที่ยง เปลี่ยนแปลง สิ่งนั้น จะเที่ยงแท้แน่นอนได้อย่างไร เมื่อสิ่งนั้นไม่เที่ยงแท้แน่นอน ควรหรือที่จะเข้าไปยึดมั่นถือมั่นสิ่งนั้นว่า สิ่งนั้นเป็นตัวเราเป็นของเรา',
        mindGuidePracticeTitleText: 'วิธีปฏิบัติ',
        mindGuidePracticeDesc: 'ให้จับคู่จิตเป็นคู่ๆ แล้วพิมพ์ลงไปในช่องบันทึกสภาวะจิตก็ได้เช่น (จิตหงุดหงิด , จิตไม่หงุดหงิด) แล้วสังเกตถึงความมีอยู่ และความไม่มีอยู่ของจิตอยู่อย่างนั้น ทั้งวัน ทั้งคืน ยืน เดิน นั่ง นอน ฯลฯ แล้วจะเห็นความไม่เที่ยงแท้แน่นอนของจิต',
        mindGuideFinalText: 'เกมส์เจริญสตินี้ ก็เปรียบเสมือนเครื่องมือที่ช่วยในการเจริญสติ ช่วยให้มีการระลึกถึงสติ ในเบื้องต้น เพราะขณะที่กดปุ่ม มีการนับจำนวนจิตแต่ละครั้ง นั้นก็เท่ากับว่า ขณะนั้นมีสติ เท่ากับจำนวนที่กดปุ่มลงไปนั้น'
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
        homeIntroText1: 'Practicing mindfulness through Body, Vedana, Mind, or Dhamma does not require practicing everything.',
        homeIntroText2: 'Mindfulness practice observes one\'s own character and temperament. Try using this game as a test to see which meditation object suits your nature—Body, Vedana, or Mind (initially)—in order to advance towards higher mindfulness practice in the Dhamma section.',
        homeFooterNoteHtml: '<p>You can paste the link in Google and use it as a Google application. The app is in development, please reset the app daily to receive updates.</p>',
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
        mindFooterLink: 'How to practice mindfulness by observing the mind',
        confirm: 'OK',

        // Summary Modal
        summaryTitle: 'Mindfulness Summary',
        summaryTimeLabel: 'Meditation Time',
        summaryClose: 'Close',
        sumBodyTitle: 'Body (4 Postures)',
        sumMindTitle: 'Mind States',

        // Guide Page
        guideBackText: 'Back',
        guideMainTitle: 'Vedananupassana Satipatthana',
        guideMainSubtitle: 'How to practice mindfulness by observing feelings',
        guideOverviewBadge: 'OVERVIEW',
        guideOverviewText: 'Vedana (feelings) range from <strong>Vedana 2</strong> up to <strong>Vedana 108</strong>',
        guideOverviewNote: 'Vedana 2 consists of <em>Physical Vedana</em> and <em>Mental Vedana</em>',
        guideBodyTitleText: 'Physical Vedana',
        guideBodyDesc: 'Physical Vedana is divided into <strong>2</strong> types:',
        guideBodySukh: 'Pleasant feeling',
        guideBodySukhSub: '(Physical)',
        guideBodyDukkh: 'Unpleasant feeling',
        guideBodyDukkhSub: '(Physical)',
        guideMindTitleText: 'Mental Vedana',
        guideMindDesc: 'Mental Vedana is divided into <strong>3</strong> types:',
        guideMindSukh: 'Pleasant feeling',
        guideMindSukhSub: '(Mental)',
        guideMindDukkh: 'Unpleasant feeling',
        guideMindDukkhSub: '(Mental)',
        guideMindNeutral: 'Neutral feeling',
        guideMindNeutralSub: '(Mental)',
        guidePracticeTitleText: 'How to practice mindfulness through Vedana',
        guidePracticeBody: 'If there is physical vedana (pleasant or unpleasant) in any part of the body, be mindful and note that vedana in that particular part of the body.',
        guidePracticeMind: 'If there is a feeling (pleasant, unpleasant, or neutral) in the mind, be mindful and note the mental vedana at that moment.',
        guidePracticeInsight: 'Mental vedana can only arise one at a time. For example, when there is happiness in the mind, suffering and neutrality are absent. Be mindful and note the mental vedana.',
        guideObserveTitleText: 'Try observing right now',
        guideObserveText: 'What kind of mental feeling do you have?',
        guideObserveSukh: 'Right now, the mind feels happy',
        guideObserveDukkh: 'Or feels suffering',
        guideObserveNeutral: 'Or feels neutral',
        guideObserveConclusion: 'Be mindful, aware of vedana',
        guideSensesBadge: 'Or…',
        guideSenseEye: 'When the <strong>eyes</strong> see a <strong>form</strong>',
        guideSenseEyeVedana: 'The mind feels (happy, suffering, or neutral) — be mindful and aware',
        guideSenseEar: 'When the <strong>ears</strong> hear a <strong>sound</strong>',
        guideSenseEarVedana: 'The mind feels (happy, suffering, or neutral) — be mindful and aware',
        guideSenseThink: 'When a <strong>thought</strong> arises',
        guideSenseThinkVedana: 'The mind feels (happy, suffering, or neutral) — be mindful and aware',
        guideVedana5Desc: 'Then observe that...',
        guideV5BodyLabel: 'Vedana 2 (Physical)',
        guideV5MindLabel: 'Vedana 3 (Mental)',
        guideV5SepText: 'Are separate from each other',
        guideVedana5Conclusion: 'This is called <strong>Vedana 5</strong>',
        guideLiberationText: 'This mindfulness game is like a tool that helps in practicing mindfulness, helping to remember sati in the beginning. Because every time you press the button and count each vedana, it means that at that moment you have mindfulness — equal to the number of times you pressed the button.',

        // Body Page
        bodyPostureTitle: 'The 4 Postures',
        bodyWalk: 'Walk',
        bodyStand: 'Stand',
        bodySit: 'Sit',
        bodyLie: 'Lie Down',
        bodyWalkText: 'When the body is walking, one knows clearly that the body is walking.',
        bodyStandText: 'When the body is standing, one knows clearly that the body is standing.',
        bodySitText: 'When the body is sitting, one knows clearly that the body is sitting.',
        bodyLieText: 'When the body is lying down, one knows clearly that the body is lying down.',
        bodyFooterWisdom: 'Or in whatever posture the body is placed, one knows that posture clearly.',
        bodyGuideLink: 'How to practice mindfulness by observing the body',

        // Body Guide Page
        bodyGuideBackText: 'Back',
        bodyGuideMainTitle: 'Kayanupassana Satipatthana',
        bodyGuideMainSubtitle: 'How to practice mindfulness by observing the body',
        bodyGuideOverviewBadge: 'OVERVIEW',
        bodyGuideOverviewText: 'The method of practicing mindfulness in the body section can involve being mindful of the body in many ways, through many meditation subjects. As a starting point, here is an example of body mindfulness through the 4 Postures:',
        bodyGuideWalkTitleText: 'Walking',
        bodyGuideWalkDesc: 'When the body is walking, one is clearly aware, seeing the body walking (seeing the body as if seeing another person)',
        bodyGuideStandTitleText: 'Standing',
        bodyGuideStandDesc: 'When the body is standing, one is clearly aware, seeing the body standing (seeing the body as if seeing another person)',
        bodyGuideSitTitleText: 'Sitting',
        bodyGuideSitDesc: 'When the body is sitting, one is clearly aware, seeing the body sitting (seeing the body as if seeing another person)',
        bodyGuideLieTitleText: 'Lying Down',
        bodyGuideLieDesc: 'When the body is lying down, one is clearly aware, seeing the body lying down (seeing the body as if seeing another person)',
        bodyGuideOtherTitleText: 'Other Postures',
        bodyGuideOtherDesc: 'Or in whatever posture the body is placed, one knows that posture clearly (seeing the body as if seeing another person)',
        bodyGuideFinalText: 'This mindfulness game is like a tool that helps in practicing mindfulness, helping to remember sati in the beginning. Because every time you press the button and count each body posture, it means that at that moment you have mindfulness — equal to the number of times you pressed the button.',

        // Mind Guide Page
        mindGuideBackText: 'Back',
        mindGuideMainTitle: 'Cittanupassana Satipatthana',
        mindGuideMainSubtitle: 'How to practice mindfulness by observing the mind',
        mindGuideOverviewBadge: 'OVERVIEW',
        mindGuideOverviewText: 'The practice of observing the mind involves watching the mind in pairs — recognizing the presence and absence of each type of mind state, in order to see the impermanence of that mind state.',
        mindGuideImpermanenceTitleText: 'Impermanence of the mind',
        mindGuideImpermanenceDesc: 'If something were truly permanent, it would have to be certain, it would have to be one, it would have to be unchanging. Since it comes in pairs, is impermanent, and changes, how can it be truly permanent? When it is not truly permanent, should we cling to it and consider it as our self or belonging to us?',
        mindGuidePracticeTitleText: 'How to practice',
        mindGuidePracticeDesc: 'Pair up mind states and type them into the mind state note field, for example (irritated mind, non-irritated mind). Then observe the presence and absence of that mind state throughout the day and night — standing, walking, sitting, lying down — and you will see the impermanence of the mind.',
        mindGuideFinalText: 'This mindfulness game is like a tool that helps in practicing mindfulness, helping to remember sati in the beginning. Because every time you press the button and count each mind state, it means that at that moment you have mindfulness — equal to the number of times you pressed the button.'
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
    const homeIntro1 = document.getElementById('homeIntroText1');
    if(homeIntro1) homeIntro1.innerText = dict.homeIntroText1;
    const homeIntro2 = document.getElementById('homeIntroText2');
    if(homeIntro2) homeIntro2.innerText = dict.homeIntroText2;
    const homeFooterNote = document.getElementById('homeFooterNote');
    if(homeFooterNote) homeFooterNote.innerHTML = dict.homeFooterNoteHtml;
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

    // ===== Update Body Page =====
    const bodyPostureTitle = document.getElementById('bodyPostureTitle');
    if(bodyPostureTitle) bodyPostureTitle.innerText = dict.bodyPostureTitle;
    const bodyWalkBtn = document.getElementById('body-walk');
    if(bodyWalkBtn) bodyWalkBtn.innerText = dict.bodyWalk;
    const bodyStandBtn = document.getElementById('body-stand');
    if(bodyStandBtn) bodyStandBtn.innerText = dict.bodyStand;
    const bodySitBtn = document.getElementById('body-sit');
    if(bodySitBtn) bodySitBtn.innerText = dict.bodySit;
    const bodyLieBtn = document.getElementById('body-lie');
    if(bodyLieBtn) bodyLieBtn.innerText = dict.bodyLie;
    const bodyWalkText = document.getElementById('bodyWalkText');
    if(bodyWalkText) bodyWalkText.innerText = dict.bodyWalkText;
    const bodyStandText = document.getElementById('bodyStandText');
    if(bodyStandText) bodyStandText.innerText = dict.bodyStandText;
    const bodySitText = document.getElementById('bodySitText');
    if(bodySitText) bodySitText.innerText = dict.bodySitText;
    const bodyLieText = document.getElementById('bodyLieText');
    if(bodyLieText) bodyLieText.innerText = dict.bodyLieText;
    const bodyFooterWisdom = document.getElementById('bodyFooterWisdom');
    if(bodyFooterWisdom) bodyFooterWisdom.innerText = dict.bodyFooterWisdom;

    // Body Guide Link
    const bodyGuideLink = document.getElementById('bodyGuideLink');
    if(bodyGuideLink) bodyGuideLink.innerText = dict.bodyGuideLink;

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

    // ===== Update Guide Page =====
    updateGuidePageLanguage(dict);

    // ===== Update Body Guide Page =====
    updateBodyGuidePageLanguage(dict);

    // ===== Update Mind Guide Page =====
    updateMindGuidePageLanguage(dict);

    // Adjust button font size based on language
    updateButtonFontSize();
}

/**
 * Update guide page text for current language
 */
function updateGuidePageLanguage(dict) {
    // Helper: update text node only (preserving child SVG elements in h2 titles)
    function setTitleText(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        // Find the last text node (after the SVG span)
        const nodes = el.childNodes;
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].nodeType === Node.TEXT_NODE && nodes[i].textContent.trim()) {
                nodes[i].textContent = '\n                                ' + text + '\n                            ';
                return;
            }
        }
    }

    // Helper: set innerHTML for elements containing HTML tags
    function setHTML(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    // Helper: set text content
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Back button
    setText('guideBackText', dict.guideBackText);

    // Hero
    setText('guideMainTitle', dict.guideMainTitle);
    setText('guideMainSubtitle', dict.guideMainSubtitle);

    // Overview
    setText('guideOverviewBadge', dict.guideOverviewBadge);
    setHTML('guideOverviewText', dict.guideOverviewText);
    setHTML('guideOverviewNote', dict.guideOverviewNote);

    // Physical Vedana section
    setTitleText('guideBodyTitle', dict.guideBodyTitleText);
    setHTML('guideBodyDesc', dict.guideBodyDesc);
    setText('guideBodySukh', dict.guideBodySukh);
    setText('guideBodySukhSub', dict.guideBodySukhSub);
    setText('guideBodyDukkh', dict.guideBodyDukkh);
    setText('guideBodyDukkhSub', dict.guideBodyDukkhSub);

    // Mental Vedana section
    setTitleText('guideMindTitle', dict.guideMindTitleText);
    setHTML('guideMindDesc', dict.guideMindDesc);
    setText('guideMindSukh', dict.guideMindSukh);
    setText('guideMindSukhSub', dict.guideMindSukhSub);
    setText('guideMindDukkh', dict.guideMindDukkh);
    setText('guideMindDukkhSub', dict.guideMindDukkhSub);
    setText('guideMindNeutral', dict.guideMindNeutral);
    setText('guideMindNeutralSub', dict.guideMindNeutralSub);

    // Practice section
    setTitleText('guidePracticeTitle', dict.guidePracticeTitleText);
    setText('guidePracticeBody', dict.guidePracticeBody);
    setText('guidePracticeMind', dict.guidePracticeMind);
    setText('guidePracticeInsight', dict.guidePracticeInsight);

    // Observe section
    setTitleText('guideObserveTitle', dict.guideObserveTitleText);
    setText('guideObserveText', dict.guideObserveText);
    setText('guideObserveSukh', dict.guideObserveSukh);
    setText('guideObserveDukkh', dict.guideObserveDukkh);
    setText('guideObserveNeutral', dict.guideObserveNeutral);
    setText('guideObserveConclusion', dict.guideObserveConclusion);

    // Senses section
    setText('guideSensesBadge', dict.guideSensesBadge);
    setHTML('guideSenseEye', dict.guideSenseEye);
    setText('guideSenseEyeVedana', dict.guideSenseEyeVedana);
    setHTML('guideSenseEar', dict.guideSenseEar);
    setText('guideSenseEarVedana', dict.guideSenseEarVedana);
    setHTML('guideSenseThink', dict.guideSenseThink);
    setText('guideSenseThinkVedana', dict.guideSenseThinkVedana);

    // Vedana 5 section
    setText('guideVedana5Desc', dict.guideVedana5Desc);
    setText('guideV5BodyLabel', dict.guideV5BodyLabel);
    setText('guideV5MindLabel', dict.guideV5MindLabel);
    setText('guideV5SepText', dict.guideV5SepText);
    setHTML('guideVedana5Conclusion', dict.guideVedana5Conclusion);

    // Liberation section
    setText('guideLiberationText', dict.guideLiberationText);
}

/**
 * Update body guide page text for current language
 */
function updateBodyGuidePageLanguage(dict) {
    // Helper: update text node only (preserving child SVG elements in h2 titles)
    function setTitleText(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        const nodes = el.childNodes;
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].nodeType === Node.TEXT_NODE && nodes[i].textContent.trim()) {
                nodes[i].textContent = '\n                                ' + text + '\n                            ';
                return;
            }
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Back button
    setText('bodyGuideBackText', dict.bodyGuideBackText);

    // Hero
    setText('bodyGuideMainTitle', dict.bodyGuideMainTitle);
    setText('bodyGuideMainSubtitle', dict.bodyGuideMainSubtitle);

    // Overview
    setText('bodyGuideOverviewBadge', dict.bodyGuideOverviewBadge);
    setText('bodyGuideOverviewText', dict.bodyGuideOverviewText);

    // Posture sections
    setTitleText('bodyGuideWalkTitle', dict.bodyGuideWalkTitleText);
    setText('bodyGuideWalkDesc', dict.bodyGuideWalkDesc);

    setTitleText('bodyGuideStandTitle', dict.bodyGuideStandTitleText);
    setText('bodyGuideStandDesc', dict.bodyGuideStandDesc);

    setTitleText('bodyGuideSitTitle', dict.bodyGuideSitTitleText);
    setText('bodyGuideSitDesc', dict.bodyGuideSitDesc);

    setTitleText('bodyGuideLieTitle', dict.bodyGuideLieTitleText);
    setText('bodyGuideLieDesc', dict.bodyGuideLieDesc);

    // Other postures
    setTitleText('bodyGuideOtherTitle', dict.bodyGuideOtherTitleText);
    setText('bodyGuideOtherDesc', dict.bodyGuideOtherDesc);

    // Final insight
    setText('bodyGuideFinalText', dict.bodyGuideFinalText);
}

/**
 * Update mind guide page text for current language
 */
function updateMindGuidePageLanguage(dict) {
    // Helper: update text node only (preserving child SVG elements in h2 titles)
    function setTitleText(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        const nodes = el.childNodes;
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].nodeType === Node.TEXT_NODE && nodes[i].textContent.trim()) {
                nodes[i].textContent = '\n                                ' + text + '\n                            ';
                return;
            }
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Back button
    setText('mindGuideBackText', dict.mindGuideBackText);

    // Hero
    setText('mindGuideMainTitle', dict.mindGuideMainTitle);
    setText('mindGuideMainSubtitle', dict.mindGuideMainSubtitle);

    // Overview
    setText('mindGuideOverviewBadge', dict.mindGuideOverviewBadge);
    setText('mindGuideOverviewText', dict.mindGuideOverviewText);

    // Impermanence section
    setTitleText('mindGuideImpermanenceTitle', dict.mindGuideImpermanenceTitleText);
    setText('mindGuideImpermanenceDesc', dict.mindGuideImpermanenceDesc);

    // Practice section
    setTitleText('mindGuidePracticeTitle', dict.mindGuidePracticeTitleText);
    setText('mindGuidePracticeDesc', dict.mindGuidePracticeDesc);

    // Final insight
    setText('mindGuideFinalText', dict.mindGuideFinalText);
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

// ===== BODY PAGE LOGIC =====

// Body posture counters
const bodyCounts = {
    'body-walk': 0,
    'body-stand': 0,
    'body-sit': 0,
    'body-lie': 0
};

/**
 * Record a body posture click
 */
function recordBodyPosture(posture, id) {
    bodyCounts[id]++;

    const counterEl = document.getElementById(`count-${id}`);
    counterEl.innerText = bodyCounts[id];

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
 * Reset all body posture counters
 */
function resetBodyPostures() {
    Object.keys(bodyCounts).forEach(key => {
        bodyCounts[key] = 0;
        document.getElementById(`count-${key}`).innerText = '0';
    });
}

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
