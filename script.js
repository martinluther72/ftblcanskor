// API bilgileri (Bunları KENDİ API'nizin bilgilerine göre DOLDURUN!)
// RapidAPI üzerindeki API'nizin sayfasından (Kod Parçacıkları bölümü) doğru bilgileri alın.

// --- Canlı Maç Listesi için API Bilgileri ---
const fixturesUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all'; // Canlı Maç Listesi URL'si

// --- Maç Olayları için API Bilgileri ---
// RapidAPI'deki Olaylar (Events) uç noktasının URL'si
const eventsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/events';

// --- Maç İstatistikleri için API Bilgileri ---
// RapidAPI'deki İstatistikler (Statistics) uç noktasının URL'si
const statisticsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics';


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
const tabPanes = detailsPanel ? detailsPanels.querySelectorAll('.tab-pane') : null; // Hata düzeltildi

const eventsTabContent = detailsPanel ? document.getElementById('events-tab-content') : null;
const statisticsTabContent = detailsPanel ? document.getElementById('statistics-tab-content') : null;
const eventsSectionInPane = eventsTabContent ? eventsTabContent.querySelector('.events-section') : null;
const statisticsSectionInPane = statisticsTabContent ? statisticsTabContent.querySelector('.statistics-section') : null;

// Oranlar bölümü referansları (KALDIRILDI)
// const matchDetailsOddsSection = detailsPanel ? detailsPanel.querySelector('.match-details-odds') : null;
// const oddsListContainer = matchDetailsOddsSection ? matchDetailsOddsSection.querySelector('.odds-list') : null;

const closeDetailsButton = document.querySelector('.close-details-panel');

// Filtre butonları referansları
const filterButtons = document.querySelectorAll('.match-filters button');

// --- Favoriler İçin localStorage Key ---
const FAVORITES_STORAGE_KEY = 'favoriteMatchIds';

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
    return favoriteIds.includes(matchId);
}

// Paneller ve önemli elementler bulunamazsa uyarı verelim
if (!matchesListContainer) console.error("HTML'de #matches-list ID'li container bulunamadı!");
if (!detailsPanel) console.error("HTML'de #match-details-panel ID'li container bulunamadı!");
if (!sidebarRight) console.error("HTML'de .sidebar-right elementi bulunamadı!");

if (!initialMessage) console.warn("HTML'de .initial-message elementi bulunamadı.");
if (!selectedMatchInfo) console.warn("HTML'de .selected-match-info elementi bulunamadı.");
if (!matchDetailTitle) console.warn("HTML'de .match-detail-title elementi bulunamadı.");
if (!matchHeaderTeams) console.warn("HTML'de .match-header-teams elementi bulunamadı.");
if (!headerHomeLogo) console.warn("HTML'de .home-logo elementi bulunamadı.");
if (!headerTeamNames) console.warn("HTML'de .header-team-names elementi bulunamadı.");
if (!headerAwayLogo) console.warn("HTML'de .away-logo elementi bulunamadı.");

if (!tabButtons || tabButtons.length === 0) console.warn("HTML'de sekme düğmeleri (.tab-button) bulunamadı.");
if (!tabPanes || tabPanes.length === 0) console.warn("HTML'de sekme içerik alanları (.tab-pane) bulunamadı.");

if (!eventsTabContent) console.warn("HTML'de #events-tab-content elementi bulunamadı.");
if (!statisticsTabContent) console.warn("HTML'de #statistics-tab-content elementi bulunamadı.");
if (!eventsSectionInPane) console.warn("HTML'de .events-section (olaylar paneli içinde) elementi bulunamadı.");
if (!statisticsSectionInPane) console.warn("HTML'de .statistics-section (istatistikler paneli içinde) elementi bulunamadı.");

// Oran referansları kaldırıldı.
// if (!matchDetailsOddsSection) console.warn("HTML'de .match-details-odds elementi bulunamadı.");
// if (!oddsListContainer) console.warn("HTML'de .odds-list elementi bulunamadı.");

if (!closeDetailsButton) console.warn("HTML'de .close-details-panel elementi bulunamadı.");
if (filterButtons.length === 0) console.warn("HTML'de filtre butonları (.filter-button) bulunamadı.");


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
         // Favoriler filtresi aktifse kapatınca diğerlerine geç
         const favoritesButton = document.querySelector('.filter-button[data-filter="favorites"]');
         if (favoritesButton && favoritesButton.classList.contains('active')) {
             // Canlı maçlar butonunu aktif yap ve listeyi güncelle
             const liveButton = document.querySelector('.filter-button[data-filter="live"]');
             if (liveButton) liveButton.click(); // Canlı butonuna tıklama simüle et
         }
    });
}


// Canlı maç verilerini çeken fonksiyon (Değişiklik Yok)
async function fetchLiveMatches() {
    console.log('API\'den canlı maç verileri çekiliyor...', fixturesUrl);
    try {
        const response = await fetch(fixturesUrl, options);

        if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`API isteği başarısıız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Canlı maç verisi çekme hatası:', error);
        if (matchesListContainer) {
             matchesListContainer.innerHTML = '<p style="color:red; text-align:center;">Maç verileri yüklenemedi. Lütfen konsolu kontrol edin ve API bilgilerinizi/limitlerinizi kontrol edin.</p>';
        }
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


// --- Maç detayları/olaylarını sağ panele yerleştiren fonksiyon (Değişiklik Yok) ---
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
        let iconText = ''; // İkon değeri boşaltıldı

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

// --- Maç istatistiklerini sağ panele yerleştirir ---
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
         statisticsSectionInPane.innerHTML += '<p style="color:orange; text-align:center; font-size: 14px;">İstatistikler beklenenden farklı formatta geldi.</p>';
         if(teamStatistics.length > 0 && teamStatistics[0].statistics) {
             homeStats = teamStatistics[0].statistics;
             homeTeamLogo = teamStatistics[0].team.logo || 'placeholder-logo.png';
         }
          if(teamStatistics.length > 1 && teamStatistics[1].statistics) {
              awayStats = teamStatistics[1].statistics;
              awayTeamLogo = teamStatistics[1].team.logo || 'placeholder-logo.png';
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

     // İstatistikler için ikon haritası (Değerler Boşaltıldı)
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

      sortedStatTypes.forEach(statType => {
          const statItem = document.createElement('li');
          statItem.classList.add('stat-item');
          statItem.classList.add(`stat-type-${statType.toLowerCase().replace(/\s+/g, '-')}`);

           const homeValueObj = homeStats ? homeStats.find(s => s.type === statType) : null;
           const awayValueObj = awayStats ? awayStats.find(s => s.type === statType) : null;

           let homeValue = (homeValueObj && homeValueObj.value !== null) ? homeValueObj.value : '-';
           let awayValue = (awayValueObj && awayValueObj.value !== null) ? awayValueObj.value : '-';

           const iconText = statIcons[statType] || '';
           const iconSpan = document.createElement('span');
           iconSpan.classList.add('stat-icon');
           iconSpan.classList.add(`icon-${statType.toLowerCase().replace(/\s+/g, '-')}`);
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


           if (statType === "Ball Possession" && isPercentage) {
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
               statTypeSpan.innerHTML += ` ${statType}`;

               const progressBarDiv = document.createElement('div');
               progressBarDiv.classList.add('stat-progress-bar');
               progressBarDiv.innerHTML = `
                   <div class="progress-bar-track">
                       <div class="progress-bar-home" style="width: ${homeBarWidth}%;"></div>
                       <div class="progress-bar-away" style="width: ${awayBarWidth}%;"></div>
                   </div>
               `;
               statItem.appendChild(progressBarDiv);

           } else if (isNumeric && totalNumericValue > 0 && !statsWithoutBars.includes(statType)) {
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
               statTypeSpan.innerHTML += ` ${statType}`;

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
               statTypeSpan.innerHTML += ` ${statType}`;

           }

           statsList.appendChild(statItem);
      });

     console.log('İstatistikler sağ panele yerleştirildi.');
}


// API'den gelen veriyi alıp HTML'i dolduran fonksiyon (Favori Ekleme Mantığı Eklendi)
let allMatchesData = []; // Tüm maçları saklamak için global değişken

function displayMatches(data) {
    console.log('Veri işleniyor ve HTML güncelleniyor.');

    allMatchesData = data && Array.isArray(data.response) ? data.response : []; // Tüm veriyi sakla

    if (!matchesListContainer) {
        console.error("HTML'de #matches-list ID'li container bulunamadı!");
        return;
    }

    // Aktif filtreyi bul
    const activeFilterButton = document.querySelector('.filter-button.active');
    const activeFilter = activeFilterButton ? activeFilterButton.dataset.filter : 'live'; // Varsayılan canlı


    let matchesToDisplay = [];
    const favoriteMatchIds = loadFavorites(); // Favori ID'lerini yükle

    if (activeFilter === 'favorites') {
        // Favori maçları filtrele
        matchesToDisplay = allMatchesData.filter(match =>
            match.fixture && isMatchFavorite(String(match.fixture.id), favoriteMatchIds)
        );
    } else {
        // Diğer filtreler (şimdilik sadece 'live' API'den geliyor)
         // Gelecekte 'finished' ve 'upcoming' için API çağrıları buraya eklenecek
         if(activeFilter === 'live') {
             matchesToDisplay = allMatchesData.filter(match =>
                 match.fixture && match.fixture.status &&
                 (match.fixture.status.short === '1H' || match.fixture.status.short === '2H' ||
                  match.fixture.status.short === 'ET' || match.fixture.status.short === 'BT' ||
                  match.fixture.status.short === 'LIVE' || match.fixture.status.short === 'HT') // HT de canlı sayılabilir
             );
         } else {
             // Bilinmeyen veya henüz uygulanmamış filtreler için boş liste
             matchesToDisplay = [];
         }

    }


    matchesListContainer.innerHTML = '';

    if (matchesToDisplay.length === 0) {
        let message = 'Şu anda canlı maç bulunmuyor.';
        if(activeFilter === 'favorites') {
             message = 'Henüz favori maçınız yok.';
        } else if (activeFilter === 'finished') {
             message = 'Biten maçlar yüklenemedi veya mevcut değil.'; // API'den çekme eklenmedi
        } else if (activeFilter === 'upcoming') {
             message = 'Yaklaşan maçlar yüklenemedi veya mevcut değil.'; // API'den çekme eklenmedi
        }
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

    for (const leagueId in groupedMatches) {
        if (Object.hasOwnProperty.call(groupedMatches, leagueId)) {
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
                    const elapsedTime = (match.fixture && match.fixture.status && match.fixture.status.elapsed !== null && (statusShort === '1H' || statusShort === '2H' || statusShort === 'ET' || statusShort === 'BT' || statusShort === 'LIVE')) ? match.fixture.status.elapsed + "'" : '';

                     const matchDateObj = match.fixture && match.fixture.date ? new Date(match.fixture.date) : null;
                     const matchTime = matchDateObj ? matchDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saat Belirtilmemiş';
                     const matchDate = matchDateObj ? matchDateObj.toLocaleDateString() : '';

                    // Ana listedeki oran yer tutucuları (KALDIRILDI)
                    // let odds1 = '-'; let oddsX = '-'; let odds2 = '-';


                    matchItem.innerHTML = `
                        <div class="match-summary">
                            <div class="team-info">
                                <img src="${homeTeamLogo}" alt="${homeTeamName} Logo" class="team-logo">
                                <span class="team-name">${homeTeamName}</span>
                            </div>
                            <div class="score-status">
                                ${statusShort === '1H' || statusShort === '2H' || statusShort === 'ET' || statusShort === 'BT' || statusShort === 'LIVE' ?
                                    `<span class="score">${homeScore} - ${awayScore}</span><span class="match-status live">${elapsedTime || statusLong}</span>` :
                                     statusShort === 'HT' || statusShort === 'FT' || statusShort === 'AET' || statusShort === 'PEN' ?
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

                         if(sidebarRight && isMobileView()){
                             sidebarRight.classList.add('is-visible-on-mobile');
                             document.body.style.overflow = 'hidden';
                         } else if (sidebarRight && !isMobileView()) {
                             sidebarRight.style.display = 'block'; // Masaüstünde görünür yap (CSS grid ile çakışabilir, kontrol et)
                         }


                         if (detailsPanel && initialMessage && selectedMatchInfo && matchDetailTitle && matchHeaderTeams && headerHomeLogo && headerTeamNames && headerAwayLogo) { // Oran container kontrolü kaldırıldı
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

                             if(eventsSectionInPane) eventsSectionInPane.innerHTML = '';
                             if(statisticsSectionInPane) statisticsSectionInPane.innerHTML = '';
                              // Oran listesini temizle ve sabit mesajı koy (Oranlar kaldırıldığı için)
                             if(matchDetailsOddsSection && matchDetailsOddsSection.querySelector('.odds-list')) {
                                  matchDetailsOddsSection.querySelector('.odds-list').innerHTML = '<p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Oran bilgisi mevcut değil.</p>';
                             }


                             switchTab('events');

                         } else {
                             console.error("Sağ panelin gerekli elementleri bulunamadı!");
                              if (detailsPanel) detailsPanel.innerHTML = '<h3>Detaylar Yükleniyor...</h3><p>Gerekli panel elementleri bulunamadı.</p>';
                         }

                        fetchMatchEvents(clickedMatchId).then(eventsData => {
                             if(eventsData){
                                 displayMatchDetails(clickedMatchId, eventsData);
                             } else {
                                   if (eventsSectionInPane) {
                                        eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maçta henüz bir olay yok veya yüklenemedi.</p>';
                                    }
                             }
                        });

                         fetchMatchStatistics(clickedMatchId).then(statsData => {
                             if(statsData){
                                 displayMatchStatistics(clickedMatchId, statsData, homeTeamName, awayTeamName);
                             } else {
                                   if (statisticsSectionInPane) {
                                        statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maç için istatistik bilgisi bulunamadı veya yüklenemedi.</p>';
                                    }
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
                                // Eğer kaldırılan favori, favori listesindeyse, listenin güncellenmesi gerekir.
                                // En basit yol, listeyi tamamen yeniden çizmek.
                                displayMatches({ response: allMatchesData }); // Tüm veriyi kullanarak listeyi filtreleyip yeniden çiz
                            }

                        });
                    }


                    leagueSection.appendChild(matchItem);
                });
            }

            matchesListContainer.appendChild(leagueSection);
        }
    }
     console.log('Maç öğeleri görüntülendi ve tıklama olayları eklendi (Favori mantığı dahil).');
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

            // Filtreye göre maçları yeniden görüntüle
            // Şu an sadece 'live' filtrelemesi API'den gelen veriyle çalışır.
            // 'favorites' filtresi localStorage ve allMatchesData kullanır.
            // 'finished' ve 'upcoming' için API çağrıları ve displayMatches içinde filtreleme eklenmeli.
            if (filterType === 'live' || filterType === 'favorites') {
                 displayMatches({ response: allMatchesData }); // allMatchesData üzerinden filtreleme yap
            } else {
                // Henüz uygulanmamış filtreler için boş liste veya bilgilendirme
                matchesListContainer.innerHTML = `<p style="text-align:center; color: var(--secondary-text-color);">"${filterType}" filtresi henüz aktif değil veya veri mevcut değil.</p>`;
                console.warn(`"${filterType}" filtresi henüz uygulanmadı.`);
            }

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


// Belirli aralıklarla veri çekme fonksiyonunu çağırıp listeyi güncelleyen fonksiyon
function startLiveUpdates() {
    // İlk yüklemeden sonra sadece canlı filtre aktifse güncelleme yap
    const updateInterval = setInterval(() => {
         const activeFilterButton = document.querySelector('.filter-button.active');
         const activeFilter = activeFilterButton ? activeFilterButton.dataset.filter : 'live';

         // Eğer aktif filtre 'live' veya 'favorites' ise güncelleme yap (favoriler de canlı veriye dayanır)
         if (activeFilter === 'live' || activeFilter === 'favorites') {
             console.log('Canlı maç verileri güncelleniyor...');
             fetchLiveMatches().then(data => {
                 if (data) {
                      // Güncel veriyi allMatchesData'ya kaydet ve aktif filtreye göre listeyi yeniden çiz
                     allMatchesData = data.response || [];
                      displayMatches({ response: allMatchesData }); // Güncellenmiş veriyle listeyi yeniden çiz
                      console.log('Ekran verisi güncellendi.');
                 } else {
                      console.error('Veri güncelleme sırasında API\'den veri alınamadı.');
                 }
             });
         } else {
             console.log('Canlı güncelleme duraklatıldı (Aktif filtre canlı değil).');
         }


    }, 15000); // Her 15 saniyede bir

    // window.addEventListener('beforeunload', () => {
    //     clearInterval(updateInterval);
    // });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sayfa yüklendi, ilk veri çekiliyor...');

    if (initialMessage) initialMessage.style.display = 'block';
    if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
     // Oran listesini başlangıçta temizle ve sabit mesajı göster (Kaldırıldı)
     // if(oddsListContainer) oddsListContainer.innerHTML = '<p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Oran bilgisi mevcut değil.</p>';

     // Masaüstünde sağ paneli başlangıçta gizle
     if (sidebarRight && !isMobileView()) {
         sidebarRight.style.display = 'none';
     }


    fetchLiveMatches().then(data => {
        if (data) {
             displayMatches(data); // İlk yüklemede tüm veriyi gösterir (varsayılan filtre canlı)
             startLiveUpdates(); // Canlı güncellemeyi başlat
         } else {
             console.error("İlk veri çekme başarısıız oldu.");
              if (initialMessage) initialMessage.textContent = 'Maç verileri yüklenemedi.';
              if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
         }
    });
});
