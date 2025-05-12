// API bilgileri (Bunları KENDİ API'nizin bilgilerine göre DOLDURUN!)
// RapidAPI üzerindeki API'nizin sayfasından (Kod Parçacıkları bölümü) doğru bilgileri alın.

// --- Canlı Maç Listesi için API Bilgileri (Artık sadece canlı güncellemeler için kullanılır) ---
const liveFixturesUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all';

// --- Tarihe Göre Maçlar için API Bilgileri ---
const dateFixturesUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?date='; // Sonuna YYYY-MM-DD eklenecek

// --- Maç Olayları için API Bilgileri ---
const eventsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/events';

// --- Maç İstatistikleri için API Bilgileri ---
const statisticsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics';

// Oranlar için API Bilgileri (KALDIRILDI)
// const oddsUrl = 'https://api-football-v1.p.rapidapi.com/v3/odds';


const options = {
    method: 'GET',
    headers: {
        // !!! RapidAPI snippet'ındaki KENDİ API ANAHTARINIZI AŞAĞIDAKİ SATIRA YAPIŞTIRIN !!!
        'x-rapidapi-key': '0dc6e9a183msh3aa0c3fdda7fbadp1cc9bbjsn7dcec0f25326', // KENDİ ANAHTARINIZLA DEĞİŞTİRİN <<< İŞTE BURASI
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
        // RapidAPI snippet'ında başka başlıklar varsa buraya ekleyin
    }
};

// --- Element Referansları ---
const matchesListContainer = document.getElementById('matches-list');
const detailsPanel = document.getElementById('match-details-panel');
const sidebarRight = document.querySelector('.sidebar-right');

const initialMessage = detailsPanel ? detailsPanel.querySelector('.initial-message') : null;
const selectedMatchInfo = detailsPanel ? detailsPanel.querySelector('.selected-match-info') : null;
const matchDetailTitle = detailsPanel ? detailsPanel.querySelector('.match-detail-title') : null;
const matchHeaderTeams = detailsPanel ? detailsPanel.querySelector('.match-header-teams') : null;
const headerHomeLogo = matchHeaderTeams ? matchHeaderTeams.querySelector('.home-logo') : null;
const headerTeamNames = matchHeaderTeams ? matchHeaderTeams.querySelector('.header-team-names') : null;
const headerAwayLogo = matchHeaderTeams ? matchHeaderTeams.querySelector('.away-logo') : null;

const tabButtons = detailsPanel ? detailsPanel.querySelectorAll('.tab-button') : null;
const tabPanes = detailsPanel ? detailsPanel.querySelectorAll('.tab-pane') : null;


const eventsTabContent = detailsPanel ? document.getElementById('events-tab-content') : null;
const statisticsTabContent = detailsPanel ? document.getElementById('statistics-tab-content') : null;
const eventsSectionInPane = eventsTabContent ? eventsTabContent.querySelector('.events-section') : null;
const statisticsSectionInPane = statisticsTabContent ? statisticsTabContent.querySelector('.statistics-section') : null;


// Oranlar bölümü referansları (HTML'de duruyor ama JS'te kullanılmıyor şimdilik)
// const matchDetailsOddsSection = detailsPanel ? detailsPanel.querySelector('.match-details-odds') : null;
// const oddsListContainer = matchDetailsOddsSection ? matchDetailsOddsSection.querySelector('.odds-list') : null;


const closeDetailsButton = document.querySelector('.close-details-panel');

// Filtre butonları referansları
const filterButtons = document.querySelectorAll('.match-filters button');

// --- Favoriler İçin localStorage Key ---
const FAVORITES_STORAGE_KEY = 'favoriteMatchIds';

// --- Maç Verisi İçin Global Değişken ---
let allMatchesData = []; // Bugün çekilen tüm maçları saklamak için

// --- Favori Maç ID'lerini Yükleme ve Kaydetme ---
function loadFavorites() {
    const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favoriteIds) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
}

// --- Favori Durumunu Kontrol Etme ---
function isMatchFavorite(matchId, favoriteIds) {
    // MatchId'lerin string olarak saklandığından emin ol
    return favoriteIds.map(String).includes(String(matchId));
}

// Paneller ve önemli elementler bulunamazsa uyarı verelim
if (!matchesListContainer) console.error("HTML'de #matches-list ID'li container bulunamadı!");
if (!detailsPanel) console.error("HTML'de #match-details-panel ID'li container bulunamadı!");
if (!sidebarRight) console.error("HTML'de .sidebar-right elementi bulunamadı!");

if (!initialMessage) console.warn("HTML'de .initial-message elementi bulunamadı.");
if (!selectedMatchInfo) console.warn("HTML'de .selected-match-info elementi bulunamadı.");
if (!matchDetailTitle) console.warn("HTML'de .match-detail-title elementi bulunamadı.");
if (!matchHeaderTeams) console.warn("HTML'de .match-header-teams elementi bulunamadı.");
if (!headerHomeLogo) console.warn("HTML'de .home-logo bulunamadı.");
if (!headerTeamNames) console.warn("HTML'de .header-team-names bulunamadı.");
if (!headerAwayLogo) console.warn("HTML'de .away-logo bulunamadı.");

if (!tabButtons || tabButtons.length === 0) console.warn("HTML'de sekme düğmeleri (.tab-button) bulunamadı.");
if (!tabPanes || tabPanes.length === 0) console.warn("HTML'de sekme içerik alanları (.tab-pane) bulunamadı.");

if (!eventsTabContent) console.warn("HTML'de #events-tab-content elementi bulunamadı!");
if (!statisticsTabContent) console.warn("HTML'de #statistics-tab-content elementi bulunamadı!");
if (!eventsSectionInPane) console.warn("HTML'de .events-section (eventsTabContent içinde) elementi bulunamadı!");
if (!statisticsSectionInPane) console.warn("HTML'de .statistics-section (statisticsTabContent içinde) elementi bulunamadı!");


if (!closeDetailsButton) console.warn("HTML'de .close-details-panel bulunamadı!");
if (filterButtons.length === 0) console.warn("HTML'de filtre butonları (.filter-button) bulunamadı!");


// Ekranın mobil görünümde olup olmadığını kontrol eden fonksiyon
function isMobileView() {
    return window.innerWidth <= 768;
}

// Sekme değiştirme fonksiyonu
function switchTab(selectedTab) {
    if (!tabButtons || !tabPanes) return;

    tabButtons.forEach(button => {
        if (button.dataset.tab === selectedTab) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    tabPanes.forEach(pane => {
        const paneTab = pane.id.replace('-tab-content', '');
        if (paneTab === selectedTab) {
             pane.classList.add('active');
        } else {
             pane.classList.remove('active');
        }
    });
}

// Sekme düğmelerine tıklama olay dinleyicileri ekle
if (tabButtons) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTab = button.dataset.tab;
            switchTab(selectedTab);
        });
    });
}

// Mobil kapat düğmesine tıklama olay dinleyicisi
if (closeDetailsButton && sidebarRight) {
    closeDetailsButton.addEventListener('click', () => {
        sidebarRight.classList.remove('is-visible-on-mobile');
         document.body.style.overflow = '';
         // Favoriler filtresi aktifse kapatınca diğerlerine geçme mantığı (isteğe bağlı)
         // const favoritesButton = document.querySelector('.filter-button[data-filter="favorites"]');
         // if (favoritesButton && favoritesButton.classList.contains('active')) {
         //     const liveButton = document.querySelector('.filter-button[data-filter="live']');
         //     if (liveButton) liveButton.click();
         // }
    });
}

// --- YYYY-MM-DD formatında bugünün tarihini alan fonksiyon ---
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Aylar 0-11 arası
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// --- Tarihe Göre Maç Verilerini Çeken Fonksiyon ---
async function fetchMatchesByDate(dateString) {
    const url = `${dateFixturesUrl}${dateString}`;
    console.log(`API'den ${dateString} tarihli maç verileri çekiliyor...`, url);
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`API isteği başarısız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`Maç verisi çekme hatası (${dateString}):`, error);
        if (matchesListContainer) {
             matchesListContainer.innerHTML = '<p style="color:red; text-align:center;">Maç verileri yüklenemedi. Lütfen konsolu kontrol edin ve API bilgilerinizi/limitlerinizi kontrol edin.</p>';
        }
        return null;
    }
}

// --- Canlı Maç Verilerini Çeken Fonksiyon (Güncellemeler İçin) ---
async function fetchLiveMatchesForUpdate() {
     console.log('Canlı maç verileri güncellemeler için çekiliyor...', liveFixturesUrl);
     try {
         const response = await fetch(liveFixturesUrl, options);

         if (!response.ok) {
             // Hata durumunda sessiz kalabiliriz veya konsola uyarı yazabiliriz, listeyi bozmayalım
             console.warn(`Canlı güncelleme API isteği başarısız oldu: ${response.status} - ${response.statusText}`);
             return null;
         }

         const data = await response.json();
         return data;

     } catch (error) {
         console.warn('Canlı güncelleme verisi çekme hatası:', error);
         return null;
     }
}


// Belirli bir maçın olaylarını çeken fonksiyon (Değişiklik Yok)
async function fetchMatchEvents(fixtureId) {
    const urlWithFixture = `${eventsUrl}?fixture=${fixtureId}`;
    console.log(`Maç olayları çekiliyor (ID: ${fixtureId})...`, urlWithFixture);

    try {
        const response = await fetch(urlWithFixture, options);

         if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Olay API isteği başarısıız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();

        console.log('Maç olayları ham veri:', data);

        return data;

    } catch (error) {
        console.error(`Maç olayları çekme hatası (ID: ${fixtureId}):`, error);
        return null;
    }
}

// Bel belirli bir maçın istatistiklerini çeken fonksiyon (Değişiklik Yok)
async function fetchMatchStatistics(fixtureId) {
    const urlWithFixture = `${statisticsUrl}?fixture=${fixtureId}`;
    console.log(`Maç istatistikleri çekiliyor (ID: ${fixtureId})...`, urlWithFixture);

    try {
        const response = await fetch(urlWithFixture, options);

         if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`İstatistik API isteği başarısıız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();

        console.log('Maç istatistikleri ham veri:', data);

        return data;

    } catch (error) {
        console.error(`Maç istatistikleri çekme hatası (ID: ${fixtureId}):`, error);
        return null;
    }
}

// --- İstatistik Türleri İçin İngilizce'den Türkçe'ye Çeviri Haritası ---
const statTypeTranslations = {
    "Shots on Goal": "İsabetli Şut",
    "Shots off Goal": "İsabetsiz Şut",
    "Total Shots": "Toplam Şut",
    "Blocked Shots": "Engellenen Şut",
    "Shots insidebox": "Ceza Sahası İçi Şut",
    "Shots outsidebox": "Ceza Sahası Dışı Şut",
    "Fouls": "Faul",
    "Corner Kicks": "Korner",
    "Offsides": "Ofsayt",
    "Ball Possession": "Topa Sahip Olma",
    "Yellow Cards": "Sarı Kart",
    "Red Cards": "Kırmızı Kart",
    "Goalkeeper Saves": "Kaleci Kurtarışı",
    "Total passes": "Toplam Pas",
    "Passes accurate": "Başarılı Pas",
    "Passes %": "Pas Başarı %",
    "Expected Goals (xG)": "Beklenen Gol (xG)",
    "Expected Goals against (xGA)": "Yenilen Beklenen Gol (xGA)",
    "Expected Points (xP)": "Beklenen Puan (xP)",
    "Big Chance Created": "Önemli Fırsat Yaratan",
    "Big Chance Missed": "Harcanan Önemli Fırsat",
    "Clearances": "Uzaklaştırmalar",
    "Interceptions": "Top Kapma",
    "Tackles": "Müdahale", // Veya "İkili Mücadele Kazanma"
    "Duels Total": "Toplam İkili Mücadele",
    "Duels won": "Kazanılan İkili Mücadele",
    "Dribble Attempts": "Dribbling Girişimi",
    "Dribble Success": "Başarılı Dribbling",
    "Dispossessed": "Top Kaybı",
    "Saves": "Kurtarışlar", // Genel kurtarışlar
    "Passes accurate %": "Pas Başarı %" // Hem "Passes %" hem de "Passes accurate %" aynı anlama gelebilir
};

// --- Maç detayları/olaylarını sağ panele yerleştirir ---
function displayMatchDetails(matchId, eventsData) {
    console.log('Maç olayları sağ panele yerleştiriliyor. Veri:', eventsData);

    if (!eventsTabContent || !eventsSectionInPane) {
        console.error("HTML'de olaylar sekmesi içeriği alanları bulunamadı!");
        return;
    }

    eventsSectionInPane.innerHTML = '';

     const eventsTitle = document.createElement('h4');
     eventsTitle.textContent = 'Maç Olayları';
     eventsSectionInPane.appendChild(eventsTitle);

    const events = eventsData && Array.isArray(eventsData.response) ? eventsData.response : [];

    if (events.length === 0) {
        eventsSectionInPane.innerHTML += '<p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maçta henüz bir olay yok.</p>';
        console.log('Olay listesi boş.');
        return;
    }

    const eventsList = document.createElement('ul');
    eventsList.classList.add('match-events-list');
    eventsSectionInPane.appendChild(eventsList);

    events.forEach(event => {
        const time = event.time && event.time.elapsed !== null ? event.time.elapsed + "'" : '';
        const teamName = event.team && event.team.name ? event.team.name : 'Bilinmeyen Takım';
        const playerName = event.player && event.player.name ? event.player.name : '';
        const eventType = event.type ? event.type : 'Bilinmeyen Olay';
        const eventDetail = event.detail ? event.detail : '';

        const eventItem = document.createElement('li');
        eventItem.classList.add('event-item');
        eventItem.classList.add(`event-type-${eventType.toLowerCase().replace(/\s+/g, '-')}`);

        let eventContent = '';
        let iconClass = '';
        let iconText = '';

        if (eventType === 'Goal') {
            iconClass = 'icon-goal';
            iconText = '';
            const assistPlayer = (event.assist && event.assist.name) ? ` (Asist: ${event.assist.name})` : '';
            eventContent = `${playerName}${assistPlayer}`;
             if (eventDetail && eventDetail !== 'Normal Goal') eventContent += ` (${eventDetail})`;
        } else if (eventType === 'Card') {
            iconClass = 'icon-card';
            iconText = '';
            eventContent = `${eventDetail}! ${playerName}`;
             eventItem.classList.add(`event-detail-${eventDetail.toLowerCase().replace(/\s+/g, '-')}`);
        } else if (eventType === 'subst') {
             iconClass = 'icon-subst';
             iconText = '';
             let players = '';
             if (event.player && event.player.name) players += `Çıkan: ${event.player.name}`;
             if (event.assist && event.assist.name) players += (players ? ', ' : '') + ` Giren: ${event.assist.name}`;
             eventContent = `Oyuncu Değişikliği (${players})`;
        } else if (eventType === 'Var') {
             iconClass = 'icon-var';
             iconText = '';
             eventContent = `VAR Kontrolü (${eventDetail})`;
        } else if (eventType === 'Penalty') {
             iconClass = 'icon-penalty';
             iconText = '';
             eventContent = `Penaltı: ${eventDetail}! ${playerName}`;
        } else {
             eventContent = `${eventType}: ${eventDetail} ${playerName}`;
             iconClass = 'icon-default';
             iconText = '';
        }

        const iconSpan = document.createElement('span');
        iconSpan.classList.add('event-icon');
        iconSpan.classList.add(iconClass);
        iconSpan.textContent = iconText;

        eventItem.innerHTML = `<span>${time}</span> ${teamName}: `;
        eventItem.appendChild(iconSpan);
        eventItem.innerHTML += ` ${eventContent}`;

        eventsList.appendChild(eventItem);
    });

    console.log('Olaylar sağ panele yerleştirildi.');
}

// --- Maç istatistiklerini sağ panele yerleştirir (TÜRKÇE ÇEVİRİ EKLENDİ) ---
function displayMatchStatistics(matchId, statisticsData, homeTeamName, awayTeamName) {
     console.log('Maç istatistikleri sağ panele yerleştiriliyor. Veri:', statisticsData);

     if (!statisticsTabContent || !statisticsSectionInPane) {
         console.error("HTML'de istatistikler sekmesi içeriği alanları bulunamadı!");
         return;
     }

     statisticsSectionInPane.innerHTML = '';

      const statsTitle = document.createElement('h4');
      statsTitle.textContent = 'İstatistikler';
      statisticsSectionInPane.appendChild(statsTitle);


     const teamStatistics = statisticsData && Array.isArray(statisticsData.response) ? statisticsData.response : [];

     if (teamStatistics.length === 0) {
        statisticsSectionInPane.innerHTML += '<p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maç için istatistik bilgisi bulunamadı.</p>';
         console.log('İstatistik listesi boş.');
         return;
     }

     let homeStats = null;
     let awayStats = null;
     let homeTeamLogo = '';
     let awayTeamLogo = '';


     if (teamStatistics.length >= 2) {
         const team1 = teamStatistics[0];
         const team2 = teamStatistics[1];

         if (team1.team && team1.team.name === homeTeamName) {
             homeStats = team1.statistics;
             homeTeamLogo = team1.team.logo || 'placeholder-logo.png';
             awayStats = team2.statistics;
             awayTeamLogo = team2.team.logo || 'placeholder-logo.png';
         } else if (team1.team && team1.team.name === awayTeamName) {
             homeStats = team2.statistics;
             homeTeamLogo = team2.team.logo || 'placeholder-logo.png';
             awayStats = team1.statistics;
             awayTeamLogo = team1.team.logo || 'placeholder-logo.png';
         } else if (team2.team && team2.team.name === homeTeamName) {
              homeStats = team2.statistics;
              homeTeamLogo = team2.team.logo || 'placeholder-logo.png';
             awayStats = team1.statistics;
             awayTeamLogo = team1.team.logo || 'placeholder-logo.png';
         } else if (team2.team && team2.team.name === awayTeamName) {
              homeStats = team1.statistics;
              homeTeamLogo = team1.team.logo || 'placeholder-logo.png';
             awayStats = team2.statistics;
             awayTeamLogo = team2.team.logo || 'placeholder-logo.png';
         }
     } else {
         console.warn('Beklenmeyen istatistik yanıt yapısı: response dizisi 2 veya daha fazla eleman içermiyor. Gelen eleman sayısı:', teamStatistics.length);
         statisticsSectionInPane.innerHTML += '<p style="color:orange; text-align:center; font-size: 14px;">İstatistikler beklenenden farklı formatte geldi.</p>';
         if(teamStatistics.length > 0 && teamStatistics[0].statistics) {
             homeStats = teamStatistics[0].statistics;
             homeTeamLogo = teamStatistics[0].team.logo || 'placeholder-logo.png';
         }
          if(teamStatistics.length > 1 && teamStatistics[1].statistics) {
              awayStats = teamStatistics[1].statistics;
              awayTeamLogo = statistics[1].team.logo || 'placeholder-logo.png';
          }
     }

     if (!homeStats && !awayStats) {
          statisticsSectionInPane.innerHTML += '<p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">İstatistik verisi işlenirken bir sorun oluştu veya eksik.</p>';
         return;
     }

    const statsList = document.createElement('ul');
    statsList.classList.add('match-statistics-list');
    statisticsSectionInPane.appendChild(statsList);

    const allStatTypes = new Set();
    if(homeStats) homeStats.forEach(stat => allStatTypes.add(stat.type));
    if(awayStats) awayStats.forEach(stat => allStatTypes.add(stat.type));

     const sortedStatTypes = Array.from(allStatTypes).sort();

     // İstatistikler için ikon haritası (Değerler Boşaltıldı) - Kullanılmıyor ama referans olarak duruyor
     const statIcons = {
         "Shots on Goal": "", "Shots off Goal": "", "Total Shots": "", "Blocked Shots": "",
         "Shots insidebox": "", "Shots outsidebox": "", "Fouls": "", "Corner Kicks": "",
         "Offsides": "", "Ball Possession": "", "Yellow Cards": "", "Red Cards": "",
         "Goalkeeper Saves": "", "Total passes": "", "Passes accurate": "", "Passes %": "",
         "Expected Goals (xG)": "", "Expected Goals against (xGA)": "", "Expected Points (xP)": "",
         "Big Chance Created": "", "Big Chance Missed": "", "Clearances": "", "Interceptions": "",
         "Tackles": "", "Duels Total": "", "Duels won": "", "Dribble Attempts": "",
         "Dribble Success": "", "Dispossessed": "", "Saves": "", "Passes accurate %": ""
     };

     const statsWithoutBars = [
         "Yellow Cards", "Red Cards", "Offsides", "Corner Kicks", "Goalkeeper Saves", "Saves",
         "Penalties", "Big Chance Created", "Big Chance Missed", "Clearances", "Interceptions",
         "Tackles", "Duels Total", "Duels won", "Dribble Attempts", "Dribble Success",
         "Dispossessed", "Expected Goals (xG)", "Expected Goals against (xGA)", "Expected Points (xP)"
     ];

      sortedStatTypes.forEach(statTypeEnglish => {
          const statItem = document.createElement('li');
          statItem.classList.add('stat-item');
          // İngilizce türü CSS sınıfında kullanmak isteyebiliriz
          statItem.classList.add(`stat-type-${statTypeEnglish.toLowerCase().replace(/\s+/g, '-')}`);

           const homeValueObj = homeStats ? homeStats.find(s => s.type === statTypeEnglish) : null;
           const awayValueObj = awayStats ? awayStats.find(s => s.type === statTypeEnglish) : null;

           let homeValue = (homeValueObj && homeValueObj.value !== null) ? homeValueObj.value : '-';
           let awayValue = (awayValueObj && awayValueObj.value !== null) ? awayValueObj.value : '-';

           // Türkçe çeviriyi al
           const statTypeTurkish = statTypeTranslations[statTypeEnglish] || statTypeEnglish; // Çeviri yoksa İngilizce'yi kullan


           const iconText = statIcons[statTypeEnglish] || ''; // İkon değeri boş
           const iconSpan = document.createElement('span');
           iconSpan.classList.add('stat-icon');
           iconSpan.classList.add(`icon-${statTypeEnglish.toLowerCase().replace(/\s+/g, '-')}`);
           iconSpan.textContent = iconText;

           const statValuesDiv = document.createElement('div');
           statValuesDiv.classList.add('stat-values');

           const isPercentage = typeof homeValue === 'string' && homeValue.endsWith('%') &&
                                typeof awayValue === 'string' && awayValue.endsWith('%');

           const isNumeric = !isPercentage &&
                             !isNaN(parseFloat(homeValue)) && isFinite(parseFloat(homeValue)) &&
                             !isNaN(parseFloat(awayValue)) && isFinite(parseFloat(awayValue));

           const numericHomeValue = isNumeric ? parseFloat(homeValue) : 0;
           const numericAwayValue = isNumeric ? parseFloat(awayValue) : 0;
           const totalNumericValue = numericHomeValue + numericAwayValue;


           if (statTypeEnglish === "Ball Possession" && isPercentage) {
               const homePercent = parseFloat(homeValue);
               const awayPercent = parseFloat(awayValue);

               const validHomePercent = isNaN(homePercent) ? 0 : homePercent;
               const validAwayPercent = isNaN(awayPercent) ? 0 : awayPercent;

                const totalForBar = validHomePercent + validAwayPercent;
                const homeBarWidth = totalForBar > 0 ? (validHomePercent / totalForBar) * 100 : 0;
                const awayBarWidth = totalForBar > 0 ? (validAwayPercent / totalForBar) * 100 : 0;

               statItem.classList.add('stat-item-bar');
               statItem.classList.add('stat-item-percentage');

               statValuesDiv.innerHTML = `
                   <span class="stat-home-value">${homeValue}</span>
                   <span class="stat-type"></span>
                   <span class="stat-away-value">${awayValue}</span>
               `;
               statItem.appendChild(statValuesDiv);

               const statTypeSpan = statValuesDiv.querySelector('.stat-type');
               statTypeSpan.appendChild(iconSpan);
               statTypeSpan.innerHTML += ` ${statTypeTurkish}`; // Türkçe çeviriyi kullan

               const progressBarDiv = document.createElement('div');
               progressBarDiv.classList.add('stat-progress-bar');
               progressBarDiv.innerHTML = `
                   <div class="progress-bar-track">
                       <div class="progress-bar-home" style="width: ${homeBarWidth}%;"></div>
                       <div class="progress-bar-away" style="width: ${awayBarWidth}%;"></div>
                   </div>
               `;
               statItem.appendChild(progressBarDiv);

           } else if (isNumeric && totalNumericValue > 0 && !statsWithoutBars.includes(statTypeEnglish)) {
                 const homeBarWidth = totalNumericValue > 0 ? (numericHomeValue / totalNumericValue) * 100 : 0;
                 const awayBarWidth = totalNumericValue > 0 ? (numericAwayValue / totalNumericValue) * 100 : 0;

                statItem.classList.add('stat-item-bar');
                statItem.classList.add('stat-item-numeric');

                statValuesDiv.innerHTML = `
                   <span class="stat-home-value">${homeValue}</span>
                   <span class="stat-type"></span>
                   <span class="stat-away-value">${awayValue}</span>
               `;
               statItem.appendChild(statValuesDiv);

               const statTypeSpan = statValuesDiv.querySelector('.stat-type');
               statTypeSpan.appendChild(iconSpan);
               statTypeSpan.innerHTML += ` ${statTypeTurkish}`; // Türkçe çeviriyi kullan

               const progressBarDiv = document.createElement('div');
               progressBarDiv.classList.add('stat-progress-bar');
               progressBarDiv.innerHTML = `
                   <div class="progress-bar-track">
                       <div class="progress-bar-home" style="width: ${homeBarWidth}%;"></div>
                       <div class="progress-bar-away" style="width: ${awayBarWidth}%;"></div>
                   </div>
               `;
               statItem.appendChild(progressBarDiv);

           }
            else {
                statItem.classList.add('stat-item-simple');

                statValuesDiv.innerHTML = `
                   <span class="stat-home-value">${homeValue}</span>
                   <span class="stat-type"></span>
                   <span class="stat-away-value">${awayValue}</span>
               `;
               statItem.appendChild(statValuesDiv);

               const statTypeSpan = statValuesDiv.querySelector('.stat-type');
               statTypeSpan.appendChild(iconSpan);
               statTypeSpan.innerHTML += ` ${statTypeTurkish}`; // Türkçe çeviriyi kullan

           }

           statsList.appendChild(statItem);
      });

     console.log('İstatistikler sağ panele yerleştirildi.');
}


// API'den gelen veriyi alıp HTML'i dolduran fonksiyon (Favori Ekleme Mantığı ve Yeni Filtreler Eklendi)
function displayMatches(data) {
    console.log('Veri işleniyor ve HTML güncelleniyor.');

    // allMatchesData global değişkeninde tutuluyor
    if (!matchesListContainer) {
        console.error("HTML'de #matches-list ID'li container bulunamadı!");
        return;
    }

    // Aktif filtreyi bul
    const activeFilterButton = document.querySelector('.filter-button.active');
    const activeFilter = activeFilterButton ? activeFilterButton.dataset.filter : 'today'; // Varsayılan 'today'


    let matchesToDisplay = [];
    const favoriteMatchIds = loadFavorites(); // Favori ID'lerini yükle

    // --- Filtreleme Mantığı ---
    if (activeFilter === 'favorites') {
        matchesToDisplay = allMatchesData.filter(match =>
            match.fixture && isMatchFavorite(String(match.fixture.id), favoriteMatchIds)
        );
    } else if (activeFilter === 'live') {
        matchesToDisplay = allMatchesData.filter(match =>
            match.fixture && match.fixture.status &&
            (match.fixture.status.short === '1H' || match.fixture.status.short === '2H' ||
             match.fixture.status.short === 'ET' || match.fixture.status.short === 'BT' ||
             match.fixture.status.short === 'LIVE' || match.fixture.status.short === 'HT' || match.fixture.status.long === 'LIVE')
        );
    } else if (activeFilter === 'finished') {
         matchesToDisplay = allMatchesData.filter(match =>
            match.fixture && match.fixture.status &&
            (match.fixture.status.short === 'FT' || match.fixture.status.short === 'AET' || match.fixture.status.short === 'PEN')
         );
    } else if (activeFilter === 'upcoming') {
         matchesToDisplay = allMatchesData.filter(match =>
            match.fixture && match.fixture.status &&
            (match.fixture.status.short === 'NS' || match.fixture.status.short === 'TBD')
         );
    } else if (activeFilter === 'today') {
         // "Bugünün Maçları" filtresi, canlı güncellemelerle güncellenmiş allMatchesData'nın tamamını gösterir
         matchesToDisplay = allMatchesData;
    } else {
        // Varsayılan veya bilinmeyen filtre
        matchesToDisplay = allMatchesData;
    }
    // --- Filtreleme Mantığı Sonu ---


    matchesListContainer.innerHTML = '';

    if (matchesToDisplay.length === 0) {
        let message = 'Seçili filtreye uygun maç bulunmuyor.';
         if(activeFilter === 'today') message = 'Bugün için maç bulunmuyor veya yüklenemedi.';
        else if(activeFilter === 'favorites') message = 'Henüz favori maçınız yok.';
        else if(activeFilter === 'live') message = 'Şu anda canlı maç bulunmuyor.';
        else if(activeFilter === 'finished') message = 'Bugün biten maç bulunmuyor.';
        else if(activeFilter === 'upcoming') message = 'Bugün başlayacak maç bulunmuyor.';


        matchesListContainer.innerHTML = `<p style="text-align:center; color: var(--secondary-text-color);">${message}</p>`;
        console.log('Görüntülenecek maç listesi boş. Aktif filtre:', activeFilter);
        return;
    }

    const groupedMatches = {};

    matchesToDisplay.forEach(match => {
        const leagueId = match.league && match.league.id ? match.league.id : 'unknown-league-' + (match.fixture ? match.fixture.id : Math.random());
        const leagueName = match.league && match.league.name ? match.league.name : 'Bilinmeyen Lig';
        const countryName = match.league && match.league.country ? match.league.country : '';

        if (!groupedMatches[leagueId]) {
            groupedMatches[leagueId] = {
                name: leagueName,
                country: countryName,
                matches: []
            };
        }

        groupedMatches[leagueId].matches.push(match);
    });

    // Ligleri isme göre sırala (ülke varsa ülke + isim)
    const sortedLeagueIds = Object.keys(groupedMatches).sort((a, b) => {
        const nameA = groupedMatches[a].country ? `${groupedMatches[a].country} - ${groupedMatches[a].name}` : groupedMatches[a].name;
        const nameB = groupedMatches[b].country ? `${groupedMatches[b].country} - ${groupedMatches[b].name}` : groupedMatches[b].name;
        return nameA.localeCompare(nameB);
    });


    sortedLeagueIds.forEach(leagueId => {
        const leagueData = groupedMatches[leagueId];

        const leagueSection = document.createElement('div');
        leagueSection.classList.add('league-section');

        const leagueTitle = document.createElement('h3');
        leagueTitle.classList.add('league-title');
         // Lig adını kullan (API'den gelen)
        leagueTitle.innerHTML = `
            <span class="league-name">${leagueData.country ? leagueData.country + ' - ' : ''}${leagueData.name}</span>
            <span class="favorite-icon league-favorite" data-league-id="${leagueId}">☆</span>
        `; // Lig favori butonu eklendi (işlevi yok şimdilik)
        leagueSection.appendChild(leagueTitle);

        if (leagueData.matches) {
             // Maçları duruma ve başlama saatine göre sırala
             leagueData.matches.sort((a, b) => {
                 const statusOrder = { 'NS': 1, 'TBD': 2, 'LIVE': 3, '1H': 3, 'HT': 3, '2H': 3, 'ET': 3, 'BT': 3, 'FT': 4, 'AET': 4, 'PEN': 4 };
                 const statusA = statusOrder[a.fixture?.status?.short] || 5;
                 const statusB = statusOrder[b.fixture?.status?.short] || 5;

                 if (statusA !== statusB) {
                     return statusA - statusB; // Duruma göre sırala (başlamayan -> canlı -> biten)
                 }

                 // Aynı durumdaysa zamana göre sırala
                 const timeA = a.fixture?.timestamp || 0;
                 const timeB = b.fixture?.timestamp || 0;

                 if (statusA <= 2) { // Başlamayanlar (NS, TBD)
                    return timeA - timeB; // Erken başlayan önce
                 } else { // Canlı veya Biten
                     return timeB - timeA; // Geç başlayan/biten önce (Canlılar ve bitenler için daha anlamlı sıralama)
                 }
             });


            leagueData.matches.forEach(match => {
                const matchId = String(match.fixture && match.fixture.id); // matchId string olarak saklanmalı
                const isFavorite = isMatchFavorite(matchId, favoriteMatchIds);

                const matchItem = document.createElement('div');
                matchItem.classList.add('match-item');
                matchItem.dataset.matchId = matchId;

                const homeTeamName = match.teams && match.teams.home ? match.teams.home.name : 'Ev Sahibi';
                const awayTeamName = match.teams && match.teams.away ? match.teams.away.name : 'Deplasman';
                const homeTeamLogo = (match.teams && match.teams.home ? match.teams.home.logo : null) || 'placeholder-logo.png';
                const awayTeamLogo = (match.teams && match.teams.away ? match.teams.away.logo : null) || 'placeholder-logo.png';

                const homeScore = match.goals && match.goals.home !== null ? match.goals.home : '-';
                const awayScore = match.goals && match.goals.away !== null ? match.goals.away : '-';

                const statusShort = match.fixture && match.fixture.status ? match.fixture.status.short : '';
                const statusLong = match.fixture && match.fixture.status ? match.fixture.status.long : 'Başlamadı';
                const elapsedTime = (match.fixture && match.fixture.status && match.fixture.status.elapsed !== null && (statusShort === '1H' || statusShort === '2H' || statusShort === 'ET' || statusShort === 'BT' || statusShort === 'LIVE' || statusShort === 'HT')) ? match.fixture.status.elapsed + "'" : ''; // HT için de süre gösterebiliriz

                 const matchDateObj = match.fixture && match.fixture.date ? new Date(match.fixture.date) : null;
                 // Türkiye saatine çevirme (Opsiyonel, daha gelişmiş zaman dilimi yönetimi gerekebilir)
                 // const turkishTime = matchDateObj ? matchDateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' }) : 'Saat Belirtilmemiş';
                 // const matchTime = turkishTime;
                 const matchTime = matchDateObj ? matchDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saat Belirtilmemiş';
                 const matchDate = matchDateObj ? matchDateObj.toLocaleDateString() : '';


                matchItem.innerHTML = `
                    <div class="match-summary">
                        <div class="team-info">
                            <img src="${homeTeamLogo}" alt="${homeTeamName} Logo" class="team-logo">
                            <span class="team-name">${homeTeamName}</span>
                        </div>
                        <div class="score-status">
                            ${statusShort === '1H' || statusShort === '2H' || statusShort === 'ET' || statusShort === 'BT' || statusShort === 'LIVE' || statusShort === 'HT' ? // HT de canlı sayılabilir
                                `<span class="score">${homeScore} - ${awayScore}</span><span class="match-status live">${elapsedTime || statusLong}</span>` : // Canlı ise 'live' class'ı eklendi
                                 statusShort === 'FT' || statusShort === 'AET' || statusShort === 'PEN' ?
                                `<span class="score">${homeScore} - ${awayScore}</span><span class="match-status">${statusLong}</span>` :
                                 statusShort === 'NS' || statusShort === 'TBD' ?
                                `<span class="match-time">${matchTime}</span><span class="match-date">${matchDate}</span>` :
                                `<span class="match-status">${statusLong}</span>`
                            }
                        </div>
                        <div class="team-info">
                             <img src="${awayTeamLogo}" alt="${awayTeamName} Logo" class="team-logo">
                            <span class="team-name">${awayTeamName}</span>
                        </div>
                    </div>
                    <div class="match-actions">
                        <span class="match-favorite-icon ${isFavorite ? 'is-favorite' : ''}" data-match-id="${matchId}">☆</span> </div>
                `;

                // Maç öğesi tıklama olayı (detayları göstermek için)
                matchItem.addEventListener('click', () => {
                    const clickedMatchId = matchItem.dataset.matchId;
                    console.log(`Maç öğesine tıklandı. ID: ${clickedMatchId}`);

                     // Mobil görünümde sağ paneli görünür yap ve scroll'u engelle
                     if(sidebarRight && isMobileView()){
                         sidebarRight.classList.add('is-visible-on-mobile');
                         document.body.style.overflow = 'hidden';
                     }
                     // Masaüstünde sağ paneli görünür yap (CSS grid yönetir)
                     if (sidebarRight && !isMobileView()) {
                         sidebarRight.style.display = 'block'; // CSS grid ile çakışmazsa bu satır fazlalık olabilir
                     }


                     // Sağ panelin gerekli elementlerinin varlığını kontrol et
                     if (detailsPanel && initialMessage && selectedMatchInfo && matchDetailTitle && matchHeaderTeams && headerHomeLogo && headerTeamNames && headerAwayLogo && eventsTabContent && statisticsTabContent && eventsSectionInPane && statisticsSectionInPane && tabButtons && tabPanes) { // Tüm elementleri kontrol et
                         initialMessage.style.display = 'none';
                         selectedMatchInfo.style.display = 'block';

                        const clickedMatch = allMatchesData.find(m => (m.fixture && String(m.fixture.id)) === clickedMatchId); // allMatchesData'dan bul
                         let homeTeamName = 'Ev Sahibi';
                         let awayTeamName = 'Deplasman';
                         let homeTeamLogoUrl = 'placeholder-logo.png';
                         let awayTeamLogoUrl = 'placeholder-logo.png';
                         let leagueName = 'Detaylar';

                         if(clickedMatch) {
                              homeTeamName = clickedMatch.teams && clickedMatch.teams.home ? clickedMatch.teams.home.name : 'Ev Sahibi';
                             awayTeamName = clickedMatch.teams && clickedMatch.teams.away ? clickedMatch.teams.away.name : 'Deplasman';
                              homeTeamLogoUrl = (clickedMatch.teams && clickedMatch.teams.home ? clickedMatch.teams.home.logo : null) || 'placeholder-logo.png';
                             awayTeamLogoUrl = (clickedMatch.teams && clickedMatch.teams.away ? clickedMatch.teams.away.logo : null) || 'placeholder-logo.png';
                              leagueName = clickedMatch.league && clickedMatch.league.name ? clickedMatch.league.name : 'Maç Detayları';

                             matchDetailTitle.textContent = `${leagueName}`;
                             headerTeamNames.innerHTML = `<strong>${homeTeamName} vs ${awayTeamName}</strong>`;
                              headerHomeLogo.src = homeTeamLogoUrl;
                             headerHomeLogo.alt = `${homeTeamName} Logo`;
                              headerAwayLogo.src = awayTeamLogoUrl;
                             headerAwayLogo.alt = `${awayTeamName} Logo`;

                         } else {
                              matchDetailTitle.textContent = 'Maç Detayları';
                             headerTeamNames.innerHTML = `<p>Seçilen maç detayları yükleniyor...</p>`;
                              headerHomeLogo.src = 'placeholder-logo.png';
                             headerHomeLogo.alt = 'Ev Sahibi Logo';
                              headerAwayLogo.src = 'placeholder-logo.png';
                             headerAwayLogo.alt = 'Deplasman Logo';
                         }

                         // Detay paneli sekmelerinin içeriklerini temizle
                         eventsSectionInPane.innerHTML = '';
                         statisticsSectionInPane.innerHTML = '';


                         switchTab('events'); // Varsayılan olarak Olaylar sekmesini aç

                     } else {
                         // Detaylı hata logları ekleyelim
                         console.error("Sağ panelin gerekli elementleri bulunamadı! Eksik elementler:");
                         if (!detailsPanel) console.error(" - detailsPanel (#match-details-panel)");
                         if (!initialMessage) console.error(" - initialMessage (.initial-message)");
                         if (!selectedMatchInfo) console.error(" - selectedMatchInfo (.selected-match-info)");
                         if (!matchDetailTitle) console.error(" - matchDetailTitle (.match-detail-title)");
                         if (!matchHeaderTeams) console.error(" - matchHeaderTeams (.match-header-teams)");
                         if (!headerHomeLogo) console.error(" - headerHomeLogo (.home-logo)");
                         if (!headerTeamNames) console.error(" - headerTeamNames (.header-team-names)");
                         if (!headerAwayLogo) console.error(" - headerAwayLogo (.away-logo)");
                          if (!eventsTabContent) console.error(" - eventsTabContent (#events-tab-content)");
                         if (!statisticsTabContent) console.error(" - statisticsTabContent (#statistics-tab-content)");
                          if (!eventsSectionInPane) console.error(" - eventsSectionInPane (.events-section)");
                         if (!statisticsSectionInPane) console.error(" - statisticsSectionInPane (.statistics-section)");
                          if (!tabButtons) console.error(" - tabButtons (.tab-button)");
                          if (!tabPanes) console.error(" - tabPanes (.tab-pane)");


                          if (detailsPanel) { // detailsPanel bulunduysa içini temizle
                               detailsPanel.innerHTML = '<h3>Detaylar Yükleniyor...</h3><p style="color:red;">Gerekli panel elementleri JavaScript tarafından bulunamadı. Konsolu kontrol edin.</p>';
                          } else { // detailsPanel bile bulunamadıysa genel hata mesajı ver
                               console.error("Detay paneli (#match-details-panel) bulunamadı!");
                          }
                     }

                    fetchMatchEvents(clickedMatchId).then(eventsData => {
                         if(eventsData && eventsSectionInPane){ // eventsSectionInPane kontrolü eklendi
                             displayMatchDetails(clickedMatchId, eventsData);
                         } else if (eventsSectionInPane) {
                                eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maçta henüz bir olay yok veya yüklenemedi.</p>';
                         }
                    });

                     fetchMatchStatistics(clickedMatchId).then(statsData => {
                         if(statsData && statisticsSectionInPane){ // statisticsSectionInPane kontrolü eklendi
                             displayMatchStatistics(clickedMatchId, statsData, homeTeamName, awayTeamName);
                         } else if (statisticsSectionInPane) {
                                statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maç için istatistik bilgisi bulunamadı veya yüklenemedi.</p>';
                         }
                     });

                     const allMatchItems = document.querySelectorAll('.match-item');
                     allMatchItems.forEach(item => item.classList.remove('selected-match'));
                     matchItem.classList.add('selected-match');
                });

                // !!! Favori ikonuna tıklama olayı !!!
                const favoriteIcon = matchItem.querySelector('.match-favorite-icon');
                if (favoriteIcon) {
                    favoriteIcon.addEventListener('click', (event) => {
                        event.stopPropagation(); // Maç öğesinin tıklama olayını engelle

                        const currentMatchId = favoriteIcon.dataset.matchId;
                        let favoriteIds = loadFavorites(); // Mevcut favorileri yükle

                        const index = favoriteIds.indexOf(currentMatchId);

                        if (index > -1) {
                            // Zaten favoriyse kaldır
                            favoriteIds.splice(index, 1);
                            favoriteIcon.classList.remove('is-favorite');
                            console.log(`Favorilerden Kaldırıldı: ${currentMatchId}`);
                        } else {
                            // Favori değilse ekle
                            favoriteIds.push(currentMatchId);
                            favoriteIcon.classList.add('is-favorite');
                            console.log(`Favorilere Eklendi: ${currentMatchId}`);
                        }

                        saveFavorites(favoriteIds); // Favorileri kaydet

                        // Eğer Favorilerim filtresi aktifse, listeyi yeniden çiz
                        const activeFilterButton = document.querySelector('.filter-button.active');
                        if (activeFilterButton && activeFilterButton.dataset.filter === 'favorites') {
                            // Eğer kaldırılan veya eklenen favori, favori listesini etkiliyorsa, listeyi yeniden çiz
                            // allMatchesData güncel olduğu için tekrar API çağırmaya gerek yok
                            displayMatches({ response: allMatchesData }); // allMatchesData güncel olmalı
                        } else {
                             // Eğer başka bir filtredeysek, sadece favori ikonunun görünümünü güncellemek yeterli
                             // displayMatches'i çağırmaya gerek yok, zaten allMatchesData'da duruyor maç.
                        }

                    });
                }


                leagueSection.appendChild(matchItem);
            });
        }

        matchesListContainer.appendChild(leagueSection);
    });

    // Favori ikonlarının durumunu ilk yüklemede ve her güncellemede ayarla
    const favoriteMatchIdsOnLoad = loadFavorites();
    document.querySelectorAll('.match-item .match-favorite-icon').forEach(icon => {
        const matchId = icon.dataset.matchId;
        if (isMatchFavorite(matchId, favoriteMatchIdsOnLoad)) {
            icon.classList.add('is-favorite');
        } else {
            icon.classList.remove('is-favorite');
        }
    });


     console.log('Maç öğeleri görüntülendi ve tıklama olayları eklendi (Favori mantığı dahil).');
}

// --- Canlı Veri Güncelleme Mantığı ---
function startLiveUpdates() {
    const updateInterval = setInterval(async () => {
        console.log('Canlı güncellemeler için veri çekiliyor...');
        const liveData = await fetchLiveMatchesForUpdate();

        if (liveData && Array.isArray(liveData.response)) {
            console.log('Canlı güncelleme verisi alındı, mevcut maç verisi güncelleniyor.');
            const liveMatches = liveData.response;

            // allMatchesData içindeki canlı maçları güncelle
            allMatchesData = allMatchesData.map(existingMatch => {
                const liveMatch = liveMatches.find(lm => lm.fixture?.id === existingMatch.fixture?.id);
                if (liveMatch) {
                    // Canlı maç verisi varsa, skorları, durumu ve geçen süreyi güncelle
                    // Diğer detaylar (takım isimleri, lig vb.) değişmeyeceği için onlara dokunmaya gerek yok
                    return {
                        ...existingMatch, // Mevcut maçın diğer bilgilerini koru
                        goals: liveMatch.goals,
                        fixture: {
                            ...existingMatch.fixture,
                            status: liveMatch.fixture.status,
                            timestamp: liveMatch.fixture.timestamp // Zaman damgasını da güncellemek faydalı olabilir sıralama için
                        }
                    };
                }
                return existingMatch; // Canlı güncelleme verisinde yoksa mevcut haliyle bırak
            });

             // Not: Yeni başlayan maçlar veya bugün başlayacak ama canlı feed'e düşmemiş maçlar
             // bu güncelleme ile allMatchesData'ya eklenmez. Bunun için periyodik olarak
             // fetchMatchesByDate(todayString) çalıştırmak gerekebilir veya başlangıçta çekilen
             // liste yeterli kabul edilir. Şu anki mantık sadece canlıların skor ve durumunu güncelliyor.
             // Daha kapsamlı güncelleme için periyodik olarak fetchMatchesByDate çağrılabilir.
             // Ancak bu, API limitlerini daha hızlı tüketebilir.

            console.log('Mevcut maç verisi canlı bilgilerle güncellendi.');

            // Aktif filtreye göre listeyi yeniden çiz
            displayMatches({ response: allMatchesData }); // Yeniden çizmek için güncel allMatchesData'yı kullan
            console.log('Ekran canlı veriye göre yeniden çizildi.');


        } else {
            console.log('Canlı güncelleme verisi alınamadı veya format hatalı.');
        }

    }, 15000); // Her 15 saniyede bir canlı veri çek

    // Sayfa kapatıldığında intervali durdur
    window.addEventListener('beforeunload', () => {
        clearInterval(updateInterval);
    });
}


// --- Filtre Butonlarına Olay Dinleyicisi Ekle ---
if(filterButtons) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.dataset.filter;

            // Aktif sınıfını güncelle
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            console.log(`Filtre tıklandı: ${filterType}`);

            // allMatchesData global değişkeninde tutulan tüm veriyi kullanarak listeyi filtrele ve yeniden görüntüle
             displayMatches({ response: allMatchesData });


             // Sağ paneli gizle (isteğe bağlı, filtre değişince detaylar kapanabilir)
             if (sidebarRight) {
                 sidebarRight.classList.remove('is-visible-on-mobile');
                 if(!isMobileView()) { // Masaüstünde paneli tamamen gizle
                      sidebarRight.style.display = 'none';
                      // Başlangıç mesajını geri göster
                     if (initialMessage) initialMessage.style.display = 'block';
                      if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
                 }
             }

        });
    });
}


// --- Sayfa Yüklendiğinde İlk Veri Çekme ve Güncelleme Başlatma ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Sayfa yüklendi, ilk veri çekiliyor... ');
     console.log('Element kontrolleri yapılıyor...');

     // Başlangıçta tüm elementlerin varlığını kontrol et ve logla
     if (!matchesListContainer) console.error("DOM Yükleme Hatası: #matches-list bulunamadı!");
     if (!detailsPanel) console.error("DOM Yükleme Hatası: #match-details-panel bulunamadı!");
     if (!sidebarRight) console.error("DOM Yükleme Hatası: .sidebar-right bulunamadı!");
     if (!initialMessage) console.error("DOM Yükleme Hatası: .initial-message bulunamadı!");
     if (!selectedMatchInfo) console.error("DOM Yükleme Hatası: .selected-match-info bulunamadı!");
     if (!matchDetailTitle) console.error("DOM Yükleme Hatası: .match-detail-title bulunamadı!");
     if (!matchHeaderTeams) console.error("DOM Yükleme Hatası: .match-header-teams bulunamadı!");
     if (!headerHomeLogo) console.error("DOM Yükleme Hatası: .home-logo bulunamadı!");
     if (!headerTeamNames) console.error("DOM Yükleme Hatası: .header-team-names bulunamadı!");
     if (!headerAwayLogo) console.error("DOM Yükleme Hatası: .away-logo bulunamadı!");
     if (!tabButtons || tabButtons.length === 0) console.error("DOM Yükleme Hatası: .tab-button bulunamadı veya boş!");
     if (!tabPanes || tabPanes.length === 0) console.error("DOM Yükleme Hatası: .tab-pane bulunamadı veya boş!");
     if (!eventsTabContent) console.error("DOM Yükleme Hatası: #events-tab-content bulunamadı!");
     if (!statisticsTabContent) console.error("DOM Yükleme Hatası: #statistics-tab-content bulunamadı!");
     if (!eventsSectionInPane) console.error("DOM Yükleme Hatası: .events-section (eventsTabContent içinde) bulunamadı!");
     if (!statisticsSectionInPane) console.error("DOM Yükleme Hatası: .statistics-section (statisticsTabContent içinde) bulunamadı!");
     if (!closeDetailsButton) console.error("DOM Yükleme Hatası: .close-details-panel bulunamadı!");
     if (filterButtons.length === 0) console.error("DOM Yükleme Hatası: .filter-button bulunamadı veya boş!");


    if (initialMessage) initialMessage.style.display = 'block';
    if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';

     // Masaüstünde sağ paneli başlangıçta gizle
     if (sidebarRight && !isMobileView()) {
         sidebarRight.style.display = 'none';
     }

    // Bugünün tarihini al ve maçları çek
    const todayString = getTodayDateString();
    const initialData = await fetchMatchesByDate(todayString);

    if (initialData) {
         allMatchesData = initialData.response || []; // İlk çekilen veriyi global değişkene kaydet
         displayMatches({ response: allMatchesData }); // İlk yüklemede bugünün tüm maçlarını göster (varsayılan filtre 'today')
         startLiveUpdates(); // Canlı güncellemeyi başlat
     } else {
         console.error("İlk veri çekme başarısız oldu.");
          if (initialMessage) initialMessage.textContent = 'Maç verileri yüklenemedi.';
          if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
     }
});
