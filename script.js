// API bilgileri (Bunları KENDİ API'nizin bilgilerine göre DOLDURUN!)
// RapidAPI üzerindeki API'nizin sayfasından (Kod Parçacıkları bölümü) doğru bilgileri alın.

// --- Canlı Maç Listesi için API Bilgileri (Artık sadece canlı güncellemeler için kullanılır) ---
const liveFixturesUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all';

// --- Tarihe Göre Maçlar için API Bilgileri ---
const dateFixturesUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?date='; // SonunaYYYY-MM-DD eklenecek

// --- Maç Olayları için API Bilgileri ---
const eventsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/events';

// --- Maç İstatistikleri için API Bilgileri ---
const statisticsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics';

// --- Maç Kadroları için API Bilgileri ---
const lineupsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/lineups';

// --- Lig Puan Durumu için API Bilgileri ---
const standingsUrl = 'https://api-football-v1.p.rapidapi.com/v3/standings'; // Parametreler: league={id}&season={year}

// --- Oyuncu İstatistikleri İçin API Bilgileri (Yeni Endpoint) ---
const playerStatisticsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/players'; // Parametre: fixture={fixtureId}


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
const lineupsTabContent = detailsPanel ? document.getElementById('lineups-tab-content') : null; // Kadrolar sekmesi
const standingsTabContent = detailsPanel ? document.getElementById('standings-tab-content') : null; // Puan Durumu sekmesi
const playerStatsTabContent = detailsPanel ? document.getElementById('player-stats-tab-content') : null; // Yeni Oyuncu İstatistikleri sekmesi

const eventsSectionInPane = eventsTabContent ? eventsTabContent.querySelector('.events-section') : null;
const statisticsSectionInPane = statisticsTabContent ? statisticsTabContent.querySelector('.statistics-section') : null;
const lineupsSectionInPane = lineupsTabContent ? lineupsTabContent.querySelector('.lineups-section') : null; // Kadrolar bölümü
const standingsSectionInPane = standingsTabContent ? standingsTabContent.querySelector('.standings-section') : null; // Puan Durumu bölümü
const playerStatsSectionInPane = playerStatsTabContent ? playerStatsTabContent.querySelector('.player-stats-section') : null; // Yeni Oyuncu İstatistikleri bölümü


// Oranlar bölümü referansları (HTML'de duruyor ama JS'te kullanılmıyor şimdilik)
// const matchDetailsOddsSection = detailsPanel ? detailsPanel.querySelector('.match-details-odds') : null;
// const oddsListContainer = matchDetailsOddsSection ? matchDetailsOddsSection.querySelector('.odds-list') : null;


const closeDetailsButton = document.querySelector('.close-details-panel');

// Filtre butonları referansları
const filterButtons = document.querySelectorAll('.match-filters button');

// Tarih seçici referansı
const dateInput = document.getElementById('match-date');


// --- Favoriler İçin localStorage Key ---
const FAVORITES_STORAGE_KEY = 'favoriteMatchIds';

// --- Maç Verisi İçin Global Değişkenler ---
let allMatchesData = []; // Seçili tarih için çekilen tüm maçları saklamak için
let selectedFixtureId = null; // Detay paneli açık olan maçın ID'si
let selectedMatchData = null; // Detay paneli açık olan maçın tam verisi


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
if (!dateInput) console.error("HTML'de #match-date elementi bulunamadı!");


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
if (!lineupsTabContent) console.warn("HTML'de #lineups-tab-content elementi bulunamadı!");
if (!standingsTabContent) console.warn("HTML'de #standings-tab-content elementi bulunamadı!");
if (!playerStatsTabContent) console.warn("HTML'de #player-stats-tab-content elementi bulunamadı!"); // Yeni kontrol


if (!eventsSectionInPane) console.warn("HTML'de .events-section (eventsTabContent içinde) elementi bulunamadı!");
if (!statisticsSectionInPane) console.warn("HTML'de .statistics-section (statisticsTabContent içinde) elementi bulunamadı!");
if (!lineupsSectionInPane) console.warn("HTML'de .lineups-section (lineupsTabContent içinde) elementi bulunamadı!");
if (!standingsSectionInPane) console.warn("HTML'de .standings-section (standingsTabContent içinde) elementi bulunamadı!");
if (!playerStatsSectionInPane) console.warn("HTML'de .player-stats-section (playerStatsTabContent içinde) elementi bulunamadı!"); // Yeni kontrol


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
             // Sekme değiştiğinde ilgili API çağrısını yap (eğer detay paneli açıksa)
             if(selectedFixtureId && selectedMatchData) {
                 // Sekme içeriği daha önce yüklenmediyse veya her zaman yeniden yüklenecekse buraya ekle
                 // Şimdilik sekmeye ilk tıklandığında yükleyelim
                 if (selectedTab === 'events') {
                      // Olaylar maç tıklandığında zaten çekiliyor
                      console.log("Olaylar sekmesi seçildi. Olaylar zaten çekilmiş olmalı.");
                      // Sekme içeriği boşsa yeniden yüklemeyi tetikle
                       if (eventsSectionInPane && eventsSectionInPane.innerHTML.includes('Maç seçilmedi.')) {
                           fetchMatchEvents(selectedFixtureId).then(eventsData => {
                                if(eventsData && eventsSectionInPane) displayMatchDetails(selectedFixtureId, eventsData);
                           }).catch(err => console.error("Olay çekme hatası:", err));
                       }


                 } else if (selectedTab === 'statistics' && statisticsSectionInPane && statisticsSectionInPane.innerHTML.includes('yükleniyor veya bulunamadı.')) {
                      // İstatistikler sekmesi seçildi ve içeriği henüz yüklenmemişse çek
                      fetchMatchStatistics(selectedFixtureId).then(statsData => {
                          if(statsData) displayMatchStatistics(selectedFixtureId, statsData, selectedMatchData.teams.home.name, selectedMatchData.teams.away.name);
                           else if (statisticsSectionInPane) statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maç için istatistik bilgisi bulunamadı.</p>';
                      }).catch(err => { console.error("İstatistik çekme hatası:", err); if (statisticsSectionInPane) statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: red;">İstatistikler yüklenirken hata oluştu.</p>'; });
                 } else if (selectedTab === 'lineups' && lineupsSectionInPane && lineupsSectionInPane.innerHTML.includes('yükleniyor veya bulunamadı.')) {
                      // Kadrolar sekmesi seçildi ve içeriği henüz yüklenmemişse çek
                      fetchMatchLineups(selectedFixtureId).then(lineupsData => {
                           if(lineupsData) displayMatchLineups(selectedFixtureId, lineupsData, selectedMatchData.teams.home.name, selectedMatchData.teams.away.name);
                           else if (lineupsSectionInPane) lineupsSectionInPane.innerHTML = '<h4>Takım Kadroları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maç için kadro bilgisi bulunamadı.</p>';
                      }).catch(err => { console.error("Kadroları çekme hatası:", err); if (lineupsSectionInPane) lineupsSectionInPane.innerHTML = '<h4>Takım Kadroları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: red;">Kadrolar yüklenirken hata oluştu.</p>'; });
                 } else if (selectedTab === 'standings' && standingsSectionInPane && standingsSectionInPane.innerHTML.includes('yükleniyor veya bulunamadı.')) {
                     // Puan Durumu sekmesi seçildi ve içeriği henüz yüklenmemişse çek
                     // Puan durumu için lig ID'si ve sezon bilgisi lazım
                     const leagueId = selectedMatchData.league?.id;
                     const seasonYear = selectedMatchData.league?.season; // API'dan gelen sezon yılını kullan
                     if (leagueId && seasonYear) {
                         fetchLeagueStandings(leagueId, seasonYear).then(standingsData => {
                              if(standingsData) displayLeagueStandings(leagueId, standingsData);
                             else if (standingsSectionInPane) standingsSectionInPane.innerHTML = '<h4>Lig Puan Durumu</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu lig için puan durumu bilgisi bulunamadı.</p>';
                         }).catch(err => { console.error("Puan durumu çekme hatası:", err); if (standingsSectionInPane) standingsSectionInPane.innerHTML = '<h4>Lig Puan Durumu</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: red;">Puan durumu yüklenirken hata oluştu.</p>'; });
                     } else {
                          if (standingsSectionInPane) standingsSectionInPane.innerHTML = '<h4>Lig Puan Durumu</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Puan durumu için lig bilgisi eksik.</p>';
                     }
                 } else if (selectedTab === 'player-stats' && playerStatsSectionInPane && playerStatsSectionInPane.innerHTML.includes('yükleniyor veya bulunamadı.')) {
                      // Oyuncu İstatistikleri sekmesi seçildi ve içeriği henüz yüklenmemişse çek
                      fetchMatchPlayerStatistics(selectedFixtureId).then(playerStatsData => {
                          if(playerStatsData) displayMatchPlayerStatistics(selectedFixtureId, playerStatsData, selectedMatchData.teams.home.name, selectedMatchData.teams.away.name);
                           else if (playerStatsSectionInPane) playerStatsSectionInPane.innerHTML = '<h4>Oyuncu İstatistikleri</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maç için oyuncu istatistik bilgisi bulunamadı.</p>';
                      }).catch(err => { console.error("Oyuncu istatistikleri çekme hatası:", err); if (playerStatsSectionInPane) playerStatsSectionInPane.innerHTML = '<h4>Oyuncu İstatistikleri</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: red;">Oyuncu istatistikleri yüklenirken hata oluştu.</p>'; });
                 }
             }
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
         selectedFixtureId = null; // Panel kapanınca seçili maçı sıfırla
         selectedMatchData = null; // Panel kapanınca seçili maç verisini sıfırla
          // Detay paneli içeriğini temizle (bir sonraki açılışta yeniden yüklenecek)
          if(initialMessage) initialMessage.style.display = 'block';
          if(selectedMatchInfo) selectedMatchInfo.style.display = 'none';
           // Sekme içerik alanlarını temizle
           if(eventsSectionInPane) eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi.</p>';
           if(statisticsSectionInPane) statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi.</p>';
            if(lineupsSectionInPane) lineupsSectionInPane.innerHTML = '<h4>Takım Kadroları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi.</p>';
            if(standingsSectionInPane) standingsSectionInPane.innerHTML = '<h4>Lig Puan Durumu</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi.</p>';
             if(playerStatsSectionInPane) playerStatsSectionInPane.innerHTML = '<h4>Oyuncu İstatistikleri</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi.</p>'; // Yeni temizleme


    });
}

// ---YYYY-MM-DD formatında bugünün tarihini alan fonksiyon ---
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
        // API'den gelen veriyi işleyip allMatchesData'ya kaydet
        allMatchesData = data && Array.isArray(data.response) ? data.response : [];
        console.log(`${dateString} tarihi için ${allMatchesData.length} maç çekildi.`);
        return data; // displayMatches için tüm veriyi döndür
        // return { response: allMatchesData }; // displayMatches'in beklediği formatte döndür

    } catch (error) {
        console.error(`Maç verisi çekme hatası (${dateString}):`, error);
        if (matchesListContainer) {
             matchesListContainer.innerHTML = '<p style="color:red; text-align:center;">Maç verileri yüklenemedi. Lütfen konsolu kontrol edin ve API bilgilerinizi/limitlerinizi kontrol edin.</p>';
        }
         allMatchesData = []; // Hata durumunda listeyi temizle
        return null;
    }
}

// --- Canlı Maç Verilerini Çeken Fonksiyon (Güncellemeler İçin) ---
async function fetchLiveMatchesForUpdate() {
     // Canlı güncellemeyi sadece bugün için yapalım
     const todayString = getTodayDateString();
     const selectedDate = dateInput.value; // Tarih inputundan seçili tarihi al

     // Eğer tarih inputu bulunamadysa (null veya undefined) veya seçili tarih bugün değilse
     if (!dateInput || selectedDate !== todayString) {
          // console.log("Canlı güncelleme atlandı: Tarih inputu bulunamadı veya seçili tarih bugün değil."); // Çok fazla log olabilir, devre dışı bırakıldı
          return null;
     }

     // Eğer allMatchesData boşsa (ilk yükleme hatası gibi durumlarda) canlı güncelleme yapmanın anlamı yok
      if (allMatchesData.length === 0) {
           // console.log("Canlı güncelleme atlandı: allMatchesData boş."); // Çok fazla log olabilir, devre dışı bırakıldı
          return null;
      }


     // console.log('Canlı güncellemeler için veri çekiliyor...', liveFixturesUrl); // Çok fazla log olabilir, devre dışı bırakıldı
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

// --- Belirli Bir Maçın Olaylarını Çeken Fonksiyon ---
async function fetchMatchEvents(fixtureId) {
    const url = `${eventsUrl}?fixture=${fixtureId}`;
    console.log(`Maç olayları çekiliyor (ID: ${fixtureId})...`, url);
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
             const errorDetail = await response.text();
            throw new Error(`Olay API isteği başarısız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }
        const data = await response.json();
        console.log('Maç olayları ham veri:', data);
        return data;
    } catch (error) {
        console.error(`Maç olayları çekme hatası (ID: ${fixtureId}):`, error);
         if (eventsSectionInPane) eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: red;">Olaylar yüklenirken hata oluştu.</p>';
        return null;
    }
}


// --- Belirli Bir Maçın İstatistiklerini Çeken Fonksiyon ---
async function fetchMatchStatistics(fixtureId) {
    const url = `${statisticsUrl}?fixture=${fixtureId}`;
    console.log(`Maç istatistikleri çekiliyor (ID: ${fixtureId})...`, url);
     // İstatistikler için cacheleme yapılabilir
    try {
        const response = await fetch(url, options);

         if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`İstatistik API isteği başarısız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();
        console.log('Maç istatistikleri ham veri:', data);
         // API yanıtı { response: [ { team: {...}, statistics: [...] }, { team: {...}, statistics: [...] } ] } formatında olmalı
        return data;

    } catch (error) {
        console.error(`Maç istatistikleri çekme hatası (ID: ${fixtureId}):`, error);
        return null;
    }
}

// --- Belirli Bir Maçın Kadrolarını Çeken Fonksiyon ---
async function fetchMatchLineups(fixtureId) {
    const url = `${lineupsUrl}?fixture=${fixtureId}`;
    console.log(`Maç kadroları çekiliyor (ID: ${fixtureId})...`, url);
     // Kadrolar için cacheleme yapılabilir
    try {
        const response = await fetch(url, options);

         if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Kadro API isteği başarısız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();
        console.log('Maç kadroları ham veri:', data);
         // API yanıtı { response: [ { team: {...}, formation: "...", startXI: [...], substitutes: [...] } ] } formatında olmalı
        return data;

    } catch (error) {
        console.error(`Maç kadroları çekme hatası (ID: ${fixtureId}):`, error);
        return null;
    }
}

// --- Belirli Bir Ligin Puan Durumunu Çeken Fonksiyon ---
async function fetchLeagueStandings(leagueId, seasonYear) {
    const url = `${standingsUrl}?league=${leagueId}&season=${seasonYear}`;
    console.log(`Lig puan durumu çekiliyor (Lig: ${leagueId}, Sezon: ${seasonYear})...`, url);
     // Puan durumu için cacheleme yapılabilir
    try {
        const response = await fetch(url, options);

         if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Puan Durumu API isteği başarısız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();
        console.log('Lig puan durumu ham veri:', data);
         // API yanıtı { response: [ { league: {...}, country: {...}, season: {...}, standings: [ [...teams], [...teams] ] } ] } formatında olabilir
        return data;

    } catch (error) {
        console.error(`Lig puan durumu çekme hatası (Lig: ${leagueId}, Sezon: ${seasonYear}):`, error);
        return null;
    }
}

// --- Belirli Bir Maçın Oyuncu İstatistiklerini Çeken Fonksiyon (Yeni) ---
function displayMatchPlayerStatistics(fixtureId, playerStatsData, homeTeamName, awayTeamName) {
    console.log('Maç oyuncu istatistikleri sağ panele yerleştiriliyor. Veri:', playerStatsData);

    if (!playerStatsTabContent || !playerStatsSectionInPane) {
        console.error("HTML'de oyuncu istatistikleri sekmesi içeriği alanları bulunamadı!");
        return;
    }

    playerStatsSectionInPane.innerHTML = ''; // İçeriği temizle

     const playerStatsTitle = document.createElement('h4');
     playerStatsTitle.textContent = 'Oyuncu İstatistikleri';
     playerStatsSectionInPane.appendChild(playerStatsTitle);


    const teamsPlayerStats = playerStatsData && Array.isArray(playerStatsData.response) ? playerStatsData.response : [];

     if (teamsPlayerStats.length === 0) {
        playerStatsSectionInPane.innerHTML += '<p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maç için oyuncu istatistik bilgisi bulunamadı.</p>';
         console.log('Oyuncu istatistik listesi boş.');
         return;
     }

     teamsPlayerStats.forEach(teamData => {
         if (!teamData.team || !Array.isArray(teamData.players)) return;

         const teamName = teamData.team.name || 'Bilinmeyen Takım';
         const teamPlayerListContainer = document.createElement('div');
         teamPlayerListContainer.classList.add('team-player-stats');
         playerStatsSectionInPane.appendChild(teamPlayerListContainer);

         const teamTitle = document.createElement('h5');
         teamTitle.textContent = `${teamName} Oyuncu İstatistikleri`;
         teamPlayerListContainer.appendChild(teamTitle);

         const playerStatsList = document.createElement('ul');
         playerStatsList.classList.add('player-stats-list');
         teamPlayerListContainer.appendChild(playerStatsList);


         teamData.players.forEach(playerInfo => {
             if (!playerInfo.player || !Array.isArray(playerInfo.statistics)) return;

             const playerName = playerInfo.player.name || 'Bilinmeyen Oyuncu';
             const playerItem = document.createElement('li');

             const playerNameSpan = document.createElement('span');
             playerNameSpan.classList.add('player-name');
             playerNameSpan.textContent = playerName;
             playerItem.appendChild(playerNameSpan);


             const statsDetailsSpan = document.createElement('span');
             statsDetailsSpan.classList.add('player-stats-details');

             let statsText = '';
             playerInfo.statistics.forEach(stat => {
                 // API'den gelen oyuncu istatistik türleri farklı olabilir, yaygın olanları işleyelim
                 let statType = stat.type; // Örn: "goals", "shots", "passes"
                 let statValue = stat.value !== null ? stat.value : '-';

                 // Özellikle ilgilendiğimiz istatistikleri gösterelim
                 if (statType === 'goals') {
                      // Gol türleri (total, conceded, assists) nested olabilir
                      if (typeof statValue === 'object' && statValue !== null) {
                           if(statValue.total !== null && statValue.total > 0) statsText += `Gol: ${statValue.total}, `;
                           if(statValue.assists !== null && statValue.assists > 0) statsText += `Asist: ${statValue.assists}, `;
                      } else if (statValue !== '-' && statValue > 0) { // Düz gol sayısı gelirse
                           statsText += `Gol: ${statValue}, `;
                      }
                 } else if (statType === 'shots') {
                      // Şut türleri (total, on_target) nested olabilir
                       if (typeof statValue === 'object' && statValue !== null) {
                           if(statValue.total !== null && statValue.total > 0) statsText += `Şut: ${statValue.total}, `;
                           if(statValue.on_target !== null && statValue.on_target > 0) statsText += `İsabetli Şut: ${statValue.on_target}, `;
                       } else if (statValue !== '-' && statValue > 0) { // Düz şut sayısı gelirse
                           statsText += `Şut: ${statValue}, `;
                       }
                 } else if (statType === 'passes') {
                      // Pas türleri (total, key, accuracy) nested olabilir
                       if (typeof statValue === 'object' && statValue !== null) {
                           if(statValue.total !== null && statValue.total > 0) statsText += `Pas: ${statValue.total}, `;
                            if(statValue.accuracy !== null) statsText += `Pas Başarı: ${statValue.accuracy}%, `; // Yüzde olduğu için >0 kontrolü yapma
                       } else if (statValue !== '-' && statValue > 0) { // Düz pas sayısı gelirse
                            statsText += `Pas: ${statValue}, `;
                       }
                 } else if (statType === 'tackles' && typeof statValue === 'object' && statValue !== null && statValue.total !== null && statValue.total > 0) {
                      statsText += `Müdahale: ${statValue.total}, `;
                 } else if (statType === 'interceptions' && statValue !== null && statValue > 0) { // Top kapma nested değil genelde
                      statsText += `Top Kapma: ${statValue}, `;
                 } else if (statType === 'duels' && typeof statValue === 'object' && statValue !== null && statValue.won !== null && statValue.won > 0) {
                      statsText += `Kazanılan İM: ${statValue.won}, `; // Kazanılan İkili Mücadele
                 } else if (statType === 'dribbles' && typeof statValue === 'object' && statValue !== null && statValue.success !== null && statValue.success > 0) {
                      statsText += `Başarılı Drib: ${statValue.success}, `;
                 } else if (statType === 'fouls' && typeof statValue === 'object' && statValue !== null && statValue.committed !== null && statValue.committed > 0) {
                     statsText += `Yapılan Faul: ${statValue.committed}, `;
                 } else if (statType === 'cards') {
                     // Kartlar (yellow, red) nested olabilir
                     if (typeof statValue === 'object' && statValue !== null) {
                         if(statValue.yellow !== null && statValue.yellow > 0) statsText += `Sarı Kart: ${statValue.yellow}, `;
                         if(statValue.red !== null && statValue.red > 0) statsText += `Kırmızı Kart: ${statValue.red}, `;
                     } // Düz kart sayısı gelirse burada ekleyebiliriz ama genelde nested geliyor
                 }
                 // Diğer istatistik türleri burada eklenebilir
                 // Örn: if (statType === 'saves' && statValue !== null && statValue > 0) statsText += `Kurtarış: ${statValue}, `; // Kaleci için
             }); // End of playerInfo.statistics.forEach

             // Remove trailing comma and space if any
             if (statsText.endsWith(', ')) {
                 statsText = statsText.slice(0, -2);
             }

             statsDetailsSpan.textContent = statsText || 'İstatistik Yok'; // Add a default message if no stats are displayed
             playerItem.appendChild(statsDetailsSpan);

             playerStatsList.appendChild(playerItem);

         }); // End of teamData.players.forEach

         teamPlayerListContainer.appendChild(playerStatsList);

     }); // End of teamsPlayerStats.forEach


    console.log('Oyuncu istatistikleri sağ panele yerleştirildi.');

}


// API'den gelen veriyi alıp HTML'i dolduran fonksiyon (Favori Ekleme Mantığı ve Yeni Filtreler Eklendi)
function displayMatches() { // Artık data parametresi almıyor, global allMatchesData kullanıyor
    console.log('Veri işleniyor ve HTML güncelleniyor.');

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
         // "Bugünün Maçları" filtresi, allMatchesData'nın tamamını gösterir (seçili tarih için çekilmiş olan)
         matchesToDisplay = allMatchesData;
    } else {
        // Varsayılan veya bilinmeyen filtre
        matchesToDisplay = allMatchesData;
    }
    // --- Filtreleme Mantığı Sonu ---


    matchesListContainer.innerHTML = '';

    if (matchesToDisplay.length === 0) {
        let message = 'Seçili filtreye uygun maç bulunmuyor.';
         if(activeFilter === 'today' && dateInput) message = `Seçili tarih (${dateInput.value}) için maç bulunmuyor veya yüklenemedi.`;
        else if(activeFilter === 'favorites') message = 'Henüz favori maçınız yok.';
        else if(activeFilter === 'live' && dateInput) message = `Seçili tarih (${dateInput.value}) için şu anda canlı maç bulunmuyor.`;
        else if(activeFilter === 'finished' && dateInput) message = `Seçili tarih (${dateInput.value}) için biten maç bulunmuyor.`;
        else if(activeFilter === 'upcoming' && dateInput) message = `Seçili tarih (${dateInput.value}) için başlayacak maç bulunmuyor.`;
         else if (dateInput) message = `Seçili tarih (${dateInput.value}) için uygun maç bulunmuyor.`;


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


                const matchItem = document.createElement('div');
                matchItem.classList.add('match-item');
                matchItem.dataset.matchId = matchId;
                matchItem.dataset.leagueId = match.league?.id; // Lig ID'sini sakla
                matchItem.dataset.seasonYear = match.league?.season; // Sezon yılını sakla


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
                    const clickedLeagueId = matchItem.dataset.leagueId; // Lig ID'sini al
                    const clickedSeasonYear = matchItem.dataset.seasonYear; // Sezon yılını al

                    console.log(`Maç öğesine tıklandı. ID: ${clickedMatchId}, Lig ID: ${clickedLeagueId}, Sezon: ${clickedSeasonYear}`);

                     // Mobil görünümde sağ paneli görünür yap ve scroll'u engelle
                     if(sidebarRight && isMobileView()){
                         sidebarRight.classList.add('is-visible-on-mobile');
                         document.body.style.overflow = 'hidden';
                     }
                     // Masaüstünde sağ paneli görünür yap (CSS grid yönetir)
                     if (sidebarRight && !isMobileView()) {
                         sidebarRight.style.display = 'block'; // CSS grid ile çakışmazsa bu satır fazlalık olabilir
                     }

                     // Seçilen maçın verisini bul ve global değişkenlere ata
                     selectedFixtureId = clickedMatchId;
                     selectedMatchData = allMatchesData.find(m => (m.fixture && String(m.fixture.id)) === selectedFixtureId);


                     // Sağ panelin gerekli elementlerinin varlığını kontrol et
                     if (detailsPanel && initialMessage && selectedMatchInfo && matchDetailTitle && matchHeaderTeams && headerHomeLogo && headerTeamNames && headerAwayLogo && eventsTabContent && statisticsTabContent && lineupsTabContent && standingsTabContent && playerStatsTabContent && eventsSectionInPane && statisticsSectionInPane && lineupsSectionInPane && standingsSectionInPane && playerStatsSectionInPane && tabButtons && tabPanes) { // Tüm elementleri kontrol et
                         initialMessage.style.display = 'none';
                         selectedMatchInfo.style.display = 'block';

                         // Detay paneli başlığını ve takım bilgilerini güncelle
                         let homeTeamName = 'Ev Sahibi';
                         let awayTeamName = 'Deplasman';
                         let homeTeamLogoUrl = 'placeholder-logo.png';
                         let awayTeamLogoUrl = 'placeholder-logo.png';
                         let leagueName = 'Detaylar';

                         if(selectedMatchData) {
                              homeTeamName = selectedMatchData.teams && selectedMatchData.teams.home ? selectedMatchData.teams.home.name : 'Ev Sahibi';
                             awayTeamName = selectedMatchData.teams && selectedMatchData.teams.away ? selectedMatchData.teams.away.name : 'Deplasman';
                              homeTeamLogoUrl = (selectedMatchData.teams && selectedMatchData.teams.home ? selectedMatchData.teams.home.logo : null) || 'placeholder-logo.png';
                             awayTeamLogoUrl = (selectedMatchData.teams && selectedMatchData.teams.away ? selectedMatchData.teams.away.logo : null) || 'placeholder-logo.png';
                              leagueName = selectedMatchData.league && selectedMatchData.league.name ? selectedMatchData.league.name : 'Maç Detayları';

                             matchDetailTitle.textContent = `${leagueName}`;
                             headerTeamNames.innerHTML = `<strong>${homeTeamName} vs ${awayTeamName}</strong>`;
                              headerHomeLogo.src = homeTeamLogoUrl;
                             headerHomeLogo.alt = `${homeTeamName} Logo`;
                              headerAwayLogo.src = awayTeamLogoUrl;
                             headerAwayLogo.alt = `${awayTeamName} Logo`;

                              // Sekme içeriklerini temizle ve varsayılan sekmeyi aç
                               // Başlangıç mesajlarını ekle
                              eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Olaylar yükleniyor...</p>';
                              statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">İstatistikler yükleniyor veya bulunamadı.</p>';
                               lineupsSectionInPane.innerHTML = '<h4>Takım Kadroları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Kadrolar yükleniyor veya bulunamadı.</p>';
                               standingsSectionInPane.innerHTML = '<h4>Lig Puan Durumu</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Puan durumu yükleniyor veya bulunamadı.</p>';
                               playerStatsSectionInPane.innerHTML = '<h4>Oyuncu İstatistikleri</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Oyuncu istatistikleri yükleniyor veya bulunamadı.</p>'; // Yeni başlangıç mesajı


                             switchTab('events'); // Varsayılan olarak Olaylar sekmesini aç

                             // Olayları çek ve göster
                             fetchMatchEvents(selectedFixtureId).then(eventsData => {
                                  if(eventsData && eventsSectionInPane){
                                      displayMatchDetails(selectedFixtureId, eventsData);
                                  } else if (eventsSectionInPane) {
                                         eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Bu maçta henüz bir olay yok veya yüklenemedi.</p>';
                                  }
                             }).catch(err => { console.error("Olay çekme hatası:", err); if (eventsSectionInPane) eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: red;">Olaylar yüklenirken hata oluştu.</p>'; });

                             // NOT: İstatistikler, Kadrolar, Puan Durumu, Oyuncu İstatistikleri sekmeye ilk tıklandığında çekilecek şekilde ayarlandı (switchTab fonksiyonu içinde)

                         } else {
                              matchDetailTitle.textContent = 'Maç Detayları';
                             headerTeamNames.innerHTML = `<p>Seçilen maç detayları yükleniyor veya veri bulunamadı.</p>`;
                              headerHomeLogo.src = 'placeholder-logo.png';
                             headerHomeLogo.alt = 'Ev Sahibi Logo';
                              headerAwayLogo.src = 'placeholder-logo.png';
                             headerAwayLogo.alt = 'Deplasman Logo';

                              // Sekme içeriklerini temizle
                              if(eventsSectionInPane) eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi veya detaylar yüklenemedi.</p>';
                              if(statisticsSectionInPane) statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi veya detaylar yüklenemedi.</p>';
                               if(lineupsSectionInPane) lineupsSectionInPane.innerHTML = '<h4>Takım Kadroları</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi veya detaylar yüklenemedi.</p>';
                               if(standingsSectionInPane) standingsSectionInPane.innerHTML = '<h4>Lig Puan Durumu</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi veya detaylar yüklenemedi.</p>';
                                if(playerStatsSectionInPane) playerStatsSectionInPane.innerHTML = '<h4>Oyuncu İstatistikleri</h4><p style="text-align:center; font-style: italic; font-size: 14px; color: var(--secondary-text-color);">Maç seçilmedi veya detaylar yüklenemedi.</p>'; // Yeni temizleme


                                switchTab('events'); // Varsayılan sekmeyi aktif yap ama içeriği boş/hata mesajlı kalsın
                         }

                         // Maç öğesi seçili stilini ayarla
                         const allMatchItems = document.querySelectorAll('.match-item');
                         allMatchItems.forEach(item => item.classList.remove('selected-match'));
                         matchItem.classList.add('selected-match');

                     } else {
                         // Detaylı hata logları ekleyelim
                         console.error("Sağ panelin gerekli elementleri bulunamadı! Detay paneli açılamıyor.");
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
                          if (!lineupsTabContent) console.error(" - lineupsTabContent (#lineups-tab-content)");
                         if (!standingsTabContent) console.error(" - standingsTabContent (#standings-tab-content)");
                          if (!playerStatsTabContent) console.error(" - playerStatsTabContent (#player-stats-tab-content)"); // Yeni kontrol
                          if (!eventsSectionInPane) console.error(" - eventsSectionInPane (.events-section)");
                         if (!statisticsSectionInPane) console.error(" - statisticsSectionInPane (.statistics-section)");
                          if (!lineupsSectionInPane) console.error(" - lineupsSectionInPane (.lineups-section)");
                         if (!standingsSectionInPane) console.error(" - standingsSectionInPane (.standings-section)");
                          if (!playerStatsSectionInPane) console.error(" - playerStatsSectionInPane (.player-stats-section)"); // Yeni kontrol

                          if (!tabButtons) console.error(" - tabButtons (.tab-button)");
                          if (!tabPanes) console.error(" - tabPanes (.tab-pane)");


                          if (detailsPanel) { // detailsPanel bulunduysa içini temizle
                               detailsPanel.innerHTML = '<h3>Detaylar Yükleniyor...</h3><p style="color:red;">Gerekli panel elementleri JavaScript tarafından bulunamadı. Konsolu kontrol edin.</p>';
                          } else { // detailsPanel bile bulunamadıysa genel hata mesajı ver
                               console.error("Detay paneli (#match-details-panel) bulunamadı!");
                          }
                     }
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
                            displayMatches(); // allMatchesData güncel olmalı
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
        // Canlı güncellemeyi sadece bugün için yapalım
        const todayString = getTodayDateString();
        const selectedDate = dateInput.value; // Tarih inputundan seçili tarihi al

        if (!dateInput || selectedDate !== todayString) {
             // console.log("Canlı güncelleme atlandı: Tarih inputu bulunamadı veya seçili tarih bugün değil."); // Çok fazla log olabilir, devre dışı bırakıldı
             return; // Seçili tarih bugün değilse canlı güncellemeyi durdur
        }

     // Eğer allMatchesData boşsa (ilk yükleme hatası gibi durumlarda) canlı güncelleme yapmanın anlamı yok
      if (allMatchesData.length === 0) {
           // console.log("Canlı güncelleme atlandı: allMatchesData boş."); // Çok fazla log olabilir, devre dışı bırakıldı
          return; // allMatchesData boşsa canlı güncellemeyi durdur
      }


        // console.log('Canlı güncellemeler için veri çekiliyor...', liveFixturesUrl); // Çok fazla log olabilir, devre dışı bırakıldı
        const liveData = await fetchLiveMatchesForUpdate();

        if (liveData && Array.isArray(liveData.response)) {
            console.log('Canlı güncelleme verisi alındı, mevcut maç verisi güncelleniyor.');
            const liveMatches = liveData.response;

            // allMatchesData içindeki canlı maçları güncelle (sadece var olanları)
            let dataChanged = false;
            allMatchesData = allMatchesData.map(existingMatch => {
                const liveMatch = liveMatches.find(lm => lm.fixture?.id === existingMatch.fixture?.id);
                if (liveMatch) {
                    // Canlı maç verisi varsa, skorları, durumu ve geçen süreyi güncelle
                    // Sadece değişen bilgileri güncelle
                    const existingStatus = existingMatch.fixture?.status?.short;
                    const liveStatus = liveMatch.fixture?.status?.short;
                    const existingElapsed = existingMatch.fixture?.status?.elapsed;
                    const liveElapsed = liveMatch.fixture?.status?.elapsed;
                    const existingHomeGoals = existingMatch.goals?.home;
                    const liveHomeGoals = liveMatch.goals?.home;
                     const existingAwayGoals = existingMatch.goals?.away;
                    const liveAwayGoals = liveMatch.goals?.away;


                    if (existingStatus !== liveStatus || existingElapsed !== liveElapsed || existingHomeGoals !== liveHomeGoals || existingAwayGoals !== liveAwayGoals) {
                         dataChanged = true; // Veri değiştiyse işaretle
                         console.log(`Maç güncellendi (ID: ${existingMatch.fixture.id}): ${existingMatch.teams.home.name} ${existingHomeGoals}-${existingAwayGoals} ${existingStatus} -> ${liveHomeGoals}-${liveAwayGoals} ${liveStatus} (${liveElapsed}')`);
                         return {
                             ...existingMatch, // Mevcut maçın diğer bilgilerini koru
                             goals: liveMatch.goals,
                             fixture: {
                                 ...existingMatch.fixture,
                                 status: liveMatch.fixture.status,
                                 // timestamp: liveMatch.fixture.timestamp // Zaman damgasını güncellemeye şimdilik gerek yok, sıralama sadece başlangıçta yapılıyor
                             }
                         };
                    }
                }
                return existingMatch; // Canlı güncelleme verisinde yoksa veya değişmediyse mevcut haliyle bırak
            });

            // NOT: Bu güncelleme mantığı sadece allMatchesData içinde *zaten var olan* ve *canlı feed'de gelen* maçları günceller.
            // Eğer API'nin live feed'ine yeni başlayan bir maç düşerse ve bu maç
            // ilk fetchMatchesByDate çağrısında allMatchesData'ya eklenmemişse (örneğin fetch sırasında NS durumundaysa),
            // bu maç bu mantıkla eklenmez. Bugünün tüm maçlarını periyodik olarak çekmek
            // bu durumu çözebilir ancak API limitlerini daha hızlı tüketir.
            // Şimdilik bu temel canlı güncelleme yeterli kabul edilebilir.

            if (dataChanged) {
                 console.log('Mevcut maç verisi canlı bilgilerle güncellendi. Ekran yeniden çiziliyor.');
                 displayMatches(); // Güncel allMatchesData'yı kullanarak listeyi yeniden çiz
                 // Eğer detay paneli açıksa ve güncellenen maçı gösteriyorsa, detayları da yeniden yükle
                 if (selectedFixtureId) {
                      const updatedSelectedMatch = allMatchesData.find(m => (m.fixture && String(m.fixture.id)) === selectedFixtureId);
                      if (updatedSelectedMatch) {
                           // Seçili maçın durum veya skoru değiştiyse detay panelindeki görünümü de güncellemek gerekebilir
                           // Şimdilik detay paneli açıksa manuel olarak paneli yeniden açmak gibi bir yöntem kullanılabilir.
                           // İleride detay panelinin de otomatik güncellenmesi eklenebilir.
                           selectedMatchData = updatedSelectedMatch; // selectedMatchData'yı da güncel tut
                           console.log(`Seçili maçın durumu veya skoru değişti (ID: ${selectedFixtureId}). Detay panelinin içeriği manuel olarak güncellenmelidir.`);
                           // Aktif sekmeyi bul ve içeriğini yeniden yükle (basit yaklaşım)
                           const activeTabButton = detailsPanel ? detailsPanel.querySelector('.tab-button.active') : null;
                            if (activeTabButton) {
                                 const activeTab = activeTabButton.dataset.tab;
                                 // İlgili API çağrısını tekrar yap ve içeriği yeniden çiz
                                if (activeTab === 'events') {
                                    fetchMatchEvents(selectedFixtureId).then(eventsData => {
                                        if(eventsData && eventsSectionInPane) displayMatchDetails(selectedFixtureId, eventsData);
                                    }).catch(err => console.error("Canlı güncelleme olay çekme hatası:", err));
                                } else if (activeTab === 'statistics') {
                                     fetchMatchStatistics(selectedFixtureId).then(statsData => {
                                          if(statsData && statisticsSectionInPane) displayMatchStatistics(selectedFixtureId, statsData, selectedMatchData.teams.home.name, selectedMatchData.teams.away.name);
                                     }).catch(err => console.error("Canlı güncelleme istatistik çekme hatası:", err));
                                }
                                // Kadrolar ve Puan Durumu genellikle maç sırasında çok sık değişmez, bu yüzden canlı güncellemede yeniden çekilmeleri şart değil.
                                // Eğer istenseydi buraya eklenebilirlerdi.
                            }


                      } else {
                          // Seçili maç listeden kalktıysa (bitti ve filtre değişti gibi) paneli kapat
                           if (sidebarRight) {
                                sidebarRight.classList.remove('is-visible-on-mobile');
                                if(!isMobileView()) sidebarRight.style.display = 'none';
                                if (initialMessage) initialMessage.style.display = 'block';
                                if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
                           }
                            selectedFixtureId = null;
                            selectedMatchData = null;
                            console.log(`Seçili maç listeden kalktığı için detay paneli kapatıldı.`);
                      }
                 }

            } else {
                 // console.log('Canlı güncelleme verisi alındı ancak ekranda gösterilen maçlarda değişiklik yok.'); // Çok fazla log olabilir, devre dışı bırakıldı
            }


        } else {
            // console.log('Canlı güncelleme verisi alınamadı veya format hatalı.'); // Çok fazla log olabilir, devre dışı bırakıldı
        }

    }, 10000); // Her 10 saniyede bir canlı veri çek (Daha hızlı güncelleme)

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
             displayMatches(); // displayMatches artık allMatchesData'yı kullanıyor


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
             selectedFixtureId = null;
             selectedMatchData = null;

        });
    });
}

// --- Tarih Seçiciye Olay Dinleyicisi Ekle ---
if (dateInput) {
    dateInput.addEventListener('change', async (event) => {
        const selectedDate = event.target.value; //YYYY-MM-DD formatında tarih

        if (selectedDate) {
            console.log(`Tarih seçildi: ${selectedDate}`);
             // Seçili tarihe göre maçları yeniden çek
            // Yükleniyor mesajını göster
            if (matchesListContainer) {
                  matchesListContainer.innerHTML = `
                       <div class="league-section">
                           <h3 class="league-title">
                               <span class="league-name">Yükleniyor...</span>
                               <span class="favorite-icon">☆</span>
                           </h3>
                           <p style="text-align:center;">Maçlar yükleniyor...</p>
                       </div>
                   `;
             }

            const data = await fetchMatchesByDate(selectedDate); // allMatchesData bu fonksiyon içinde güncellenir
            if (data) {
                displayMatches(); // allMatchesData kullanılarak listeyi çiz (Varsayılan 'today' filtresi aktif olacak)
                 // Tarih değişince aktif filtreyi 'today' (yani seçili tarih) olarak ayarla
                filterButtons.forEach(btn => btn.classList.remove('active'));
                 const todayFilterButton = document.querySelector('.filter-button[data-filter="today"]');
                 if(todayFilterButton) todayFilterButton.classList.add('active');

                 // Canlı güncelleme intervalini yeniden başlat (sadece bugün için çalışacak şekilde ayarlandı)
                  // Mevcut intervali temizleyip yeniden başlatmak daha güvenli olabilir
                  // Ancak startLiveUpdates kendi içinde tarih kontrolü yaptığı için gerek kalmıyor.
            }

            // Tarih değişince detay panelini kapat ve seçili maçı sıfırla
             if (sidebarRight) {
                 sidebarRight.classList.remove('is-visible-on-mobile');
                 if(!isMobileView()) {
                     sidebarRight.style.display = 'none';
                      if (initialMessage) initialMessage.style.display = 'block';
                      if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
                 }
             }
             selectedFixtureId = null;
             selectedMatchData = null;


        } else {
            console.log("Tarih seçici temizlendi.");
            // Tarih seçici temizlenirse ne yapılmalı? Belki bugüne dönülebilir.
             // Şimdilik boş kalabilir veya bugüne dönme mantığı eklenebilir.
             // Örn: dateInput.value = getTodayDateString(); ve sonra fetchMatchesByDate(todayString) çağrılabilir.
             // dateInput.value = getTodayDateString();
             // fetchMatchesByDate(getTodayDateString()).then(() => {
             //     displayMatches();
             //     filterButtons.forEach(btn => btn.classList.remove('active'));
             //     const todayFilterButton = document.querySelector('.filter-button[data-filter="today"]');
             //     if(todayFilterButton) todayFilterButton.classList.add('active');
             // });
        }
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
     if (!dateInput) console.error("DOM Yükleme Hatası: #match-date bulunamadı!");
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
     if (!lineupsTabContent) console.error("DOM Yükleme Hatası: #lineups-tab-content bulunamadı!");
     if (!standingsTabContent) console.error("DOM Yükleme Hatası: #standings-tab-content bulunamadı!");
     if (!playerStatsTabContent) console.error("DOM Yükleme Hatası: #player-stats-tab-content bulunamadı!"); // Yeni kontrol

     if (!eventsSectionInPane) console.error("DOM Yükleme Hatası: .events-section (eventsTabContent içinde) bulunamadı!");
     if (!statisticsSectionInPane) console.error("DOM Yükleme Hatası: .statistics-section (statisticsTabContent içinde) bulunamadı!");
     if (!lineupsSectionInPane) console.error("DOM Yükleme Hatası: .lineups-section (lineupsTabContent içinde) bulunamadı!");
     if (!standingsSectionInPane) console.error("DOM Yükleme Hatası: .standings-section (standingsTabContent içinde) bulunamadı!");
     if (!playerStatsSectionInPane) console.error("DOM Yükleme Hatası: .player-stats-section (playerStatsTabContent içinde) bulunamadı!"); // Yeni kontrol


     if (!closeDetailsButton) console.error("DOM Yükleme Hatası: .close-details-panel bulunamadı!");
     if (filterButtons.length === 0) console.error("DOM Yükleme Hatası: .filter-button bulunamadı veya boş!");


    if (initialMessage) initialMessage.style.display = 'block';
    if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';

     // Masaüstünde sağ paneli başlangıçta gizle
     if (sidebarRight && !isMobileView()) {
         sidebarRight.style.display = 'none';
     }

    // Tarih seçiciye bugünün tarihini varsayılan olarak ata ve maçları çek
    const todayString = getTodayDateString();
    if (dateInput) {
        dateInput.value = todayString; // Tarih inputunu bugüne ayarla
    }

    const initialData = await fetchMatchesByDate(todayString); // Bugünün maçlarını çek (allMatchesData bu fonksiyon içinde güncellenir)

    if (initialData) {
         // allMatchesData global değişkene fetchMatchesByDate içinde zaten kaydedildi
         displayMatches(); // allMatchesData kullanılarak listeyi çiz (Varsayılan 'today' filtresi aktif olacak)
         startLiveUpdates(); // Canlı güncellemeyi başlat (Sadece bugün için çalışacak)
     } else {
         console.error("İlk veri çekme başarısız oldu.");
          if (matchesListContainer) {
               matchesListContainer.innerHTML = '<p style="color:red; text-align:center;">Maç verileri yüklenemedi. Lütfen konsolu kontrol edin ve API bilgilerinizi/limitlerinizi kontrol edin.</p>';
          }
          if (initialMessage) initialMessage.textContent = 'Maç verileri yüklenemedi.';
          if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
     }
});
