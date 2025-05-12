// API bilgileri (Bunları KENDİ API'nizin bilgilerine göre DOLDURUN!)
// RapidAPI üzerindeki API'nizin sayfasından (Kod Parçacıkları bölümü) doğru bilgileri alın.

// --- Canlı Maç Listesi için API Bilgileri ---
const fixturesUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all'; // Canlı Maç Listesi URL'si

// --- Maç Olayları için API Bilgileri ---
// RapidAPI'deki Olaylar (Events) uç noktasının URL'si
const eventsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/events';

// --- Maç İstatistikleri için API Bilgileri ---
// RapidAPI'deki İstatistikler (Statistics) uç noktasının URL'si
const statisticsUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics'; // YENİ: İstatistik URL'si

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
// HTML'deki elementlere daha kolay erişmek için referansları alalım
const matchesListContainer = document.getElementById('matches-list');
const detailsPanel = document.getElementById('match-details-panel'); // Bu artık sadece detayların içindeki div
const sidebarRight = document.querySelector('.sidebar-right'); // Sağ panelin ana elementi

const initialMessage = detailsPanel ? detailsPanel.querySelector('.initial-message') : null;
const selectedMatchInfo = detailsPanel ? detailsPanel.querySelector('.selected-match-info') : null;
const matchDetailTitle = detailsPanel ? detailsPanel.querySelector('.match-detail-title') : null;
const matchHeaderTeams = detailsPanel ? detailsPanel.querySelector('.match-header-teams') : null; // Takım logoları ve isimleri için yeni container
const headerHomeLogo = matchHeaderTeams ? matchHeaderTeams.querySelector('.home-logo') : null;
const headerTeamNames = matchHeaderTeams ? matchHeaderTeams.querySelector('.header-team-names') : null;
const headerAwayLogo = matchHeaderTeams ? matchHeaderTeams.querySelector('.away-logo') : null;

const tabButtons = detailsPanel ? detailsPanel.querySelectorAll('.tab-button') : null;
// DÜZELTME: detailsPanes yerine detailsPanel olmalıydı
const tabPanes = detailsPanel ? detailsPanel.querySelectorAll('.tab-pane') : null;


// Sekme içerik alanları içindeki .events-section ve .statistics-section divlerini de referans alalım
const eventsTabContent = detailsPanel ? document.getElementById('events-tab-content') : null;
const statisticsTabContent = detailsPanel ? document.getElementById('statistics-tab-content') : null;
const eventsSectionInPane = eventsTabContent ? eventsTabContent.querySelector('.events-section') : null;
const statisticsSectionInPane = statisticsTabContent ? statisticsTabContent.querySelector('.statistics-section') : null;

// Mobil kapat düğmesi referansı
const closeDetailsButton = document.querySelector('.close-details-panel');


// Paneller ve önemli elementler bulunamazsa uyarı verelim
if (!matchesListContainer) console.error("HTML'de #matches-list ID'li container bulunamadı!");
if (!detailsPanel) console.error("HTML'de #match-details-panel ID'li container bulunamadı!"); // Artık iç div
if (!sidebarRight) console.error("HTML'de .sidebar-right elementi bulunamadı!"); // Sağ panelin ana elementi

if (!initialMessage) console.warn("HTML'de .initial-message elementi bulunamadı.");
if (!selectedMatchInfo) console.warn("HTML'de .selected-match-info elementi bulunamadı.");
if (!matchDetailTitle) console.warn("HTML'de .match-detail-title elementi bulunamadı.");
if (!matchHeaderTeams) console.warn("HTML'de .match-header-teams elementi bulunamadı."); // Yeni element kontrolü
if (!headerHomeLogo) console.warn("HTML'de .home-logo elementi bulunamadı.");
if (!headerTeamNames) console.warn("HTML'de .header-team-names elementi bulunamadı.");
if (!headerAwayLogo) console.warn("HTML'de .away-logo elementi bulunamadı.");

if (!tabButtons || tabButtons.length === 0) console.warn("HTML'de sekme düğmeleri (.tab-button) bulunamadı.");
// Düzeltmeden sonra tabPanes null olabilir eğer detailsPanel bulunamazsa
if (!tabPanes || tabPanes.length === 0) console.warn("HTML'de sekme içerik alanları (.tab-pane) bulunamadı.");


if (!eventsTabContent) console.warn("HTML'de #events-tab-content elementi bulunamadı.");
if (!statisticsTabContent) console.warn("HTML'de #statistics-tab-content elementi bulunamadı.");
if (!eventsSectionInPane) console.warn("HTML'de .events-section (olaylar paneli içinde) elementi bulunamadı.");
if (!statisticsSectionInPane) console.warn("HTML'de .statistics-section (istatistikler paneli içinde) elementi bulunamadı.");

if (!closeDetailsButton) console.warn("HTML'de .close-details-panel elementi bulunamadı."); // Yeni kapat düğmesi kontrolü


// Ekranın mobil görünümde olup olmadığını kontrol eden fonksiyon
function isMobileView() {
    // CSS'teki media query kırılma noktasıyla aynı değeri kullanmalısın
    return window.innerWidth <= 768;
}


// Sekme değiştirme fonksiyonu
function switchTab(selectedTab) {
    if (!tabButtons || !tabPanes) return; // Elementler yoksa çalışma

    tabButtons.forEach(button => {
        if (button.dataset.tab === selectedTab) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    tabPanes.forEach(pane => {
        // Data attribute'ını kontrol et
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
        sidebarRight.classList.remove('is-visible-on-mobile'); // Sidebar'ı gizle
         // İsteğe bağlı: Body'nin kaymasını engellediysek, burada eski durumuna döndürebiliriz
         document.body.style.overflow = '';
    });
}


// Canlı maç verilerini çeken fonksiyon
async function fetchLiveMatches() {
    console.log('API\'den canlı maç verileri çekiliyor...', fixturesUrl);
    try {
        const response = await fetch(fixturesUrl, options); // fixturesUrl kullanıyoruz

        if (!response.ok) {
            // HTTP durumu 200-299 aralığında değilse hata fırlat
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

// Belirli bir maçın olaylarını çeken fonksiyon
async function fetchMatchEvents(fixtureId) {
     // Olaylar uç noktasına maç ID'sini ekleyerek URL oluşturuyoruz
    const urlWithFixture = `${eventsUrl}?fixture=${fixtureId}`;
    console.log(`Maç olayları çekiliyor (ID: ${fixtureId})...`, urlWithFixture);

    try {
        const response = await fetch(urlWithFixture, options); // options objesi API anahtarını içeriyor

         if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Olay API isteği başarısıız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();

        console.log('Maç olayları ham veri:', data); // Olaylar JSON yapısını görmek için konsola yazdır

        return data; // İşlemek üzere olay verisini döndür

    } catch (error) {
        console.error(`Maç olayları çekme hatası (ID: ${fixtureId}):`, error);
        // displayMatchDetails hata durumunu panele yazabilir
        return null;
    }
}

// Belirli bir maçın istatistiklerini çeken fonksiyon
async function fetchMatchStatistics(fixtureId) {
    // İstatistikler uç noktasına maç ID'sini ekleyerek URL oluşturuyoruz
    const urlWithFixture = `${statisticsUrl}?fixture=${fixtureId}`;
    console.log(`Maç istatistikleri çekiliyor (ID: ${fixtureId})...`, urlWithFixture);

    try {
        const response = await fetch(urlWithFixture, options); // options objesi API anahtarını içeriyor

         if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`İstatistik API isteği başarısıız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
        }

        const data = await response.json();

        console.log('Maç istatistikleri ham veri:', data); // İstatistikler JSON yapısını görmek için konsola yazdır

        return data; // İşlemek üzere istatistik verisini döndür

    } catch (error) {
        console.error(`Maç istatistikleri çekme hatası (ID: ${fixtureId}):`, error);
         // displayMatchStatistics hata durumunu panele yazabilir
        return null;
    }
}


// --- Maç detayları/olaylarını sağ panele yerleştiren fonksiyon ---
// Bu fonksiyon olay JSON yapısını alır ve olaylar sekmesi içeriğine yerleştirir.
function displayMatchDetails(matchId, eventsData) {
    console.log('Maç olayları sağ panele yerleştiriliyor. Veri:', eventsData);

    if (!eventsTabContent || !eventsSectionInPane) {
        console.error("HTML'de olaylar sekmesi içeriği alanları bulunamadı!");
        return;
    }

    // Olaylar bölümünü temizle (başlık dahil)
    eventsSectionInPane.innerHTML = '';

     const eventsTitle = document.createElement('h4');
     eventsTitle.textContent = 'Maç Olayları';
     eventsSectionInPane.appendChild(eventsTitle);


    // API yanıt yapısına göre olay listesine erişim: eventsData.response
    const events = eventsData && Array.isArray(eventsData.response) ? eventsData.response : [];

    if (events.length === 0) {
        eventsSectionInPane.innerHTML += '<p style="text-align:center; font-style: italic; font-size: 14px;">Bu maçta henüz bir olay yok.</p>';
        console.log('Olay listesi boş.');
        return;
    }

    // Olayları listelemek için bir container oluştur
    const eventsList = document.createElement('ul');
    eventsList.classList.add('match-events-list'); // CSS için class eklenebilir
    eventsSectionInPane.appendChild(eventsList);


    events.forEach(event => {
        const time = event.time && event.time.elapsed !== null ? event.time.elapsed + "'" : '';
        const teamName = event.team && event.team.name ? event.team.name : 'Bilinmeyen Takım';
        const playerName = event.player && event.player.name ? event.player.name : '';
        const eventType = event.type ? event.type : 'Bilinmeyen Olay';
        const eventDetail = event.detail ? event.detail : '';

        const eventItem = document.createElement('li');
        eventItem.classList.add('event-item');
        // Olay türüne göre sınıflar ekleyelim (CSS ile stil vermek için)
        eventItem.classList.add(`event-type-${eventType.toLowerCase().replace(/\s+/g, '-')}`);


        let eventContent = '';
        let iconClass = ''; // İkon sınıfı için değişken
        let iconText = ''; // İkon metni (şimdilik boş)

        // Olay türüne göre ikon sınıfı ve içerik belirle
        if (eventType === 'Goal') {
            iconClass = 'icon-goal';
            iconText = ''; // İkon değeri boşaltıldı
            const assistPlayer = (event.assist && event.assist.name) ? ` (Asist: ${event.assist.name})` : '';
            eventContent = `${playerName}${assistPlayer}`;
             if (eventDetail && eventDetail !== 'Normal Goal') eventContent += ` (${eventDetail})`;
        } else if (eventType === 'Card') {
            iconClass = 'icon-card';
            iconText = ''; // İkon değeri boşaltıldı
            eventContent = `${eventDetail}! ${playerName}`;
             eventItem.classList.add(`event-detail-${eventDetail.toLowerCase().replace(/\s+/g, '-')}`);
        } else if (eventType === 'subst') {
             iconClass = 'icon-subst';
             iconText = ''; // İkon değeri boşaltıldı
             let players = '';
             if (event.player && event.player.name) players += `Çıkan: ${event.player.name}`;
             if (event.assist && event.assist.name) players += (players ? ', ' : '') + ` Giren: ${event.assist.name}`;
             eventContent = `Oyuncu Değişikliği (${players})`;
        } else if (eventType === 'Var') {
             iconClass = 'icon-var';
             iconText = ''; // İkon değeri boşaltıldı
             eventContent = `VAR Kontrolü (${eventDetail})`;
        } else if (eventType === 'Penalty') {
             iconClass = 'icon-penalty';
             iconText = ''; // İkon değeri boşaltıldı
             eventContent = `Penaltı: ${eventDetail}! ${playerName}`;
        } else {
            // Bilinmeyen veya diğer olay türleri için
             eventContent = `${eventType}: ${eventDetail} ${playerName}`;
             iconClass = 'icon-default';
             iconText = ''; // İkon değeri boşaltıldı
        }

        // Olay zamanı, takım adı, ikon ve olay içeriğini birleştir
        // İkon için özel span oluşturuyoruz
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('event-icon');
        iconSpan.classList.add(iconClass);
        iconSpan.textContent = iconText; // Boş metin koyulacak

        eventItem.innerHTML = `<span>${time}</span> ${teamName}: `;
        eventItem.appendChild(iconSpan);
        eventItem.innerHTML += ` ${eventContent}`;

        eventsList.appendChild(eventItem);
    });

    console.log('Olaylar sağ panele yerleştirildi.');
}

// --- Maç istatistiklerini sağ panele yerleştirir (Gelişmiş gösterim ile) !!! ---
// Bu fonksiyon istatistik JSON yapısını alır, işler ve istatistikler sekmesi içeriğine yerleştirir.
// homeTeamName ve awayTeamName, hangi istatistik setinin hangi takıma ait olduğunu belirlemek için kullanılır.
function displayMatchStatistics(matchId, statisticsData, homeTeamName, awayTeamName) {
     console.log('Maç istatistikleri sağ panele yerleştiriliyor. Veri:', statisticsData);

     if (!statisticsTabContent || !statisticsSectionInPane) {
         console.error("HTML'de istatistikler sekmesi içeriği alanları bulunamadı!");
         return;
     }

     // İstatistikler bölümünü temizle (başlık dahil)
     statisticsSectionInPane.innerHTML = '';

      const statsTitle = document.createElement('h4');
      statsTitle.textContent = 'İstatistikler'; // Veya 'Maç İstatistikleri'
      statisticsSectionInPane.appendChild(statsTitle);


     // API yanıtında istatistikler response dizisinde takım takım geliyor
     const teamStatistics = statisticsData && Array.isArray(statisticsData.response) ? statisticsData.response : [];

     if (teamStatistics.length === 0) {
        statisticsSectionInPane.innerHTML += '<p style="text-align:center; font-style: italic; font-size: 14px;">Bu maç için istatistik bilgisi bulunamadı.</p>';
         console.log('İstatistik listesi boş.');
         return;
     }

     // Ev sahibi ve deplasman takımlarının istatistik objelerini ayır
     let homeStats = null;
     let awayStats = null;
     // Logoları da alalım (şimdilik kullanılmasa da dursun)
     let homeTeamLogo = '';
     let awayTeamLogo = '';


     // Gelen yanıtta takım isimlerini veya ID'lerini kullanarak ev sahibi ve deplasman istatistik setlerini bulalım
     if (teamStatistics.length >= 2) { // En az 2 takımın istatistiği gelmeli
         const team1 = teamStatistics[0];
         const team2 = teamStatistics[1];

         // Takım adları ile eşleştirme
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
         } else if (team2.team && team2.team.name === homeTeamName) { // Eğer 0. eleman ev sahibi değilse 1. eleman ev sahibi olabilir
              homeStats = team2.statistics;
              homeTeamLogo = team2.team.logo || 'placeholder-logo.png';
             awayStats = team1.statistics;
             awayTeamLogo = team1.team.logo || 'placeholder-logo.png';
         } else if (team2.team && team2.team.name === awayTeamName) { // Eğer 1. eleman ev sahibi değilse 0. eleman ev sahibi olabilir
              homeStats = team1.statistics;
              homeTeamLogo = team1.team.logo || 'placeholder-logo.png';
             awayStats = team2.statistics;
             awayTeamLogo = team2.team.logo || 'placeholder-logo.png';
         }
          // Eğer isimler eşleşmezse (nadiren), ID'ye göre de kontrol edilebilir.
          // match objesini tıklama olayından alıp burada kullanmak da bir yöntem olabilir.
     } else {
         // Eğer 2'den az sayıda takım istatistiği gelirse (beklenmeyen durum)
         console.warn('Beklenmeyen istatistik yanıt yapısı: response dizisi 2 veya daha fazla eleman içermiyor. Gelen eleman sayısı:', teamStatistics.length);
         statisticsSectionInPane.innerHTML += '<p style="color:orange; text-align:center; font-size: 14px;">İstatistikler beklenenden farklı formatta geldi.</p>';
         // Yine de gelen ilk takımın istatistiklerini göstermeyi deneyebiliriz
         if(teamStatistics.length > 0 && teamStatistics[0].statistics) {
             homeStats = teamStatistics[0].statistics; // İlk takımı ev sahibi gibi göster
             homeTeamLogo = teamStatistics[0].team.logo || 'placeholder-logo.png';
         }
          // awayStats boş kalacak veya ikinci eleman varsa ikinci takımı da işlemeyi deneyebiliriz
          // teamStatistics[1] varsa ve istatistiği varsa
          if(teamStatistics.length > 1 && teamStatistics[1].statistics) {
              awayStats = teamStatistics[1].statistics; // İkincisi deplasman gibi göster
              awayTeamLogo = teamStatistics[1].team.logo || 'placeholder-logo.png';
          }
     }


     // Eğer istatistik setlerinden hiçbiri bulunamazsa veya işlenemezse
     if (!homeStats && !awayStats) {
          statisticsSectionInPane.innerHTML += '<p style="text-align:center; font-style: italic; font-size: 14px;">İstatistik verisi işlenirken bir sorun oluştu veya eksik.</p>';
         return;
     }


    // İstatistik türlerini ve değerlerini listeleyecek konteyner
    const statsList = document.createElement('ul');
    statsList.classList.add('match-statistics-list'); // CSS class
    statisticsSectionInPane.appendChild(statsList);

    // Tüm istatistik türlerini toplamak için (hem ev sahibinde hem deplasmanda olanları)
    const allStatTypes = new Set();
    if(homeStats) homeStats.forEach(stat => allStatTypes.add(stat.type));
    if(awayStats) awayStats.forEach(stat => allStatTypes.add(stat.type));


    // İstatistik türlerini alfabetik sıralama
     const sortedStatTypes = Array.from(allStatTypes).sort();


     // İstatistikler için ikon haritası (Değerler Boşaltıldı)
     const statIcons = {
         "Shots on Goal": "",
         "Shots off Goal": "",
         "Total Shots": "",
         "Blocked Shots": "",
         "Shots insidebox": "",
         "Shots outsidebox": "",
         "Fouls": "",
         "Corner Kicks": "",
         "Offsides": "",
         "Ball Possession": "",
         "Yellow Cards": "",
         "Red Cards": "",
         "Goalkeeper Saves": "",
         "Total passes": "",
         "Passes accurate": "",
         "Passes %": "",
         "Expected Goals (xG)": "",
          "Expected Goals against (xGA)": "",
          "Expected Points (xP)": "",
          "Big Chance Created": "",
          "Big Chance Missed": "",
          "Clearances": "",
          "Interceptions": "",
          "Tackles": "",
          "Duels Total": "",
          "Duels won": "",
          "Dribble Attempts": "",
          "Dribble Success": "",
          "Dispossessed": "",
          "Saves": "",
          "Passes accurate %": ""
     };


     // Hangi istatistiklere çubuk ekleyeceğimize karar verelim
     // (Bu liste hala aynı kalabilir, sadece çubuksuz istatistik türlerini belirler)
     const statsWithoutBars = [
         "Yellow Cards",
         "Red Cards",
         "Offsides",
         "Corner Kicks",
         "Goalkeeper Saves",
         "Saves",
         "Penalties",
         "Big Chance Created",
         "Big Chance Missed",
         "Clearances",
         "Interceptions",
         "Tackles",
         "Duels Total",
         "Duels won",
         "Dribble Attempts",
         "Dribble Success",
         "Dispossessed",
         "Expected Goals (xG)",
         "Expected Goals against (xGA)",
         "Expected Points (xP)"
     ];


     // İstatistikleri tek tek listeleme
      sortedStatTypes.forEach(statType => {
          const statItem = document.createElement('li');
          statItem.classList.add('stat-item');
          statItem.classList.add(`stat-type-${statType.toLowerCase().replace(/\s+/g, '-')}`);


           const homeValueObj = homeStats ? homeStats.find(s => s.type === statType) : null;
           const awayValueObj = awayStats ? awayStats.find(s => s.type === statType) : null;

           let homeValue = (homeValueObj && homeValueObj.value !== null) ? homeValueObj.value : '-';
           let awayValue = (awayValueObj && awayValueObj.value !== null) ? awayValueObj.value : '-';

           // İstatistik türü ikon metnini al (şimdi boş string gelecek)
           const iconText = statIcons[statType] || ''; // Tanımlı değilse boş string kullan
           const iconSpan = document.createElement('span');
           iconSpan.classList.add('stat-icon');
           iconSpan.classList.add(`icon-${statType.toLowerCase().replace(/\s+/g, '-')}`);
           iconSpan.textContent = iconText; // Boş string koyulacak

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


     console.log('İstatistikler sağ panele yerleştirildi (İkon değerleri boşaltıldı).');
}


// API'den gelen veriyi alıp HTML'i dolduran fonksiyon (Güncellendi)
function displayMatches(data) {
    console.log('Veri işleniyor ve HTML güncelleniyor.');

    if (!matchesListContainer) {
        console.error("HTML'de #matches-list ID'li container bulunamadı!");
        return;
    }

    matchesListContainer.innerHTML = '';

    const matches = data && Array.isArray(data.response) ? data.response : [];

    if (matches.length === 0) {
        matchesListContainer.innerHTML = '<p style="text-align:center;">Şu anda canlı maç bulunmuyor.</p>';
        console.log('API\'den gelen yanıtta hiç maç bulunamadı.');
        return;
    }

    const groupedMatches = {};

    matches.forEach(match => {
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
                <span class="favorite-icon">☆</span>
            `;
            leagueSection.appendChild(leagueTitle);

            if (leagueData.matches) {
                leagueData.matches.forEach(match => {
                    const matchItem = document.createElement('div');
                    matchItem.classList.add('match-item');
                     matchItem.dataset.matchId = match.fixture && match.fixture.id ? match.fixture.id : 'match-id-unknown';

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

                    let odds1 = '-', oddsX = '-', odds2 = '-';


                    matchItem.innerHTML = `
                        <div class="match-summary">
                            <div class="team-info">
                                <img src="${homeTeamLogo}" alt="${homeTeamName} Logo" class="team-logo">
                                <span class="team-name">${homeTeamName}</span>
                            </div>
                            <div class="score-status">
                                ${statusShort === '1H' || statusShort === '2H' || statusShort === 'ET' || statusShort === 'BT' || statusShort === 'LIVE' ?
                                    `<span class="score">${homeScore} - ${awayScore}</span><span class="match-status">${elapsedTime || statusLong}</span>` :
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
                             <div class="odds">
                                <div class="odd">${odds1}</div>
                                <div class="odd">${oddsX}</div>
                                <div class="odd">${odds2}</div>
                            </div>
                            <span class="match-favorite-icon">☆</span>
                        </div>
                    `;

                    matchItem.addEventListener('click', () => {
                        const selectedFixtureId = matchItem.dataset.matchId;
                        console.log(`Maç öğesine tıklandı. ID: ${selectedFixtureId}`);

                         if(sidebarRight && isMobileView()){
                             sidebarRight.classList.add('is-visible-on-mobile');
                         }

                         if (detailsPanel && initialMessage && selectedMatchInfo && matchDetailTitle && matchHeaderTeams && headerHomeLogo && headerTeamNames && headerAwayLogo) {
                             initialMessage.style.display = 'none';
                             selectedMatchInfo.style.display = 'block';

                            const clickedMatch = matches.find(m => (m.fixture && m.fixture.id) == selectedFixtureId);
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

                             switchTab('events');

                         } else {
                             console.error("Sağ panelin gerekli elementleri bulunamadı!");
                              if (detailsPanel) detailsPanel.innerHTML = '<h3>Detaylar Yükleniyor...</h3><p>Gerekli panel elementleri bulunamadı.</p>';
                         }

                        fetchMatchEvents(selectedFixtureId).then(eventsData => {
                             if(eventsData){
                                 displayMatchDetails(selectedFixtureId, eventsData);
                             } else {
                                   if (eventsSectionInPane) {
                                        eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px;">Bu maçta henüz bir olay yok veya yüklenemedi.</p>';
                                    }
                             }
                        });

                         fetchMatchStatistics(selectedFixtureId).then(statsData => {
                             if(statsData){
                                 displayMatchStatistics(selectedFixtureId, statsData, homeTeamName, awayTeamName);
                             } else {
                                   if (statisticsSectionInPane) {
                                        statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px;">Bu maç için istatistik bilgisi bulunamadı veya yüklenemedi.</p>';
                                    }
                             }
                         });

                         const allMatchItems = document.querySelectorAll('.match-item');
                         allMatchItems.forEach(item => item.classList.remove('selected-match'));
                         matchItem.classList.add('selected-match');
                    });

                    leagueSection.appendChild(matchItem);
                });
            }

            matchesListContainer.appendChild(leagueSection);
        }
    }
     console.log('Maç öğeleri görüntülendi ve tıklama olayları eklendi.');
}


// Belirli aralıklarla veri çekme fonksiyonunu çağırıp listeyi güncelleyen fonksiyon
function startLiveUpdates() {
    const updateInterval = setInterval(() => {
        console.log('Maç verileri güncelleniyor...');
        fetchLiveMatches().then(data => {
            if (data) {
                 displayMatches(data);
                 console.log('Ekran verisi güncellendi.');
            } else {
                 console.error('Veri güncelleme sırasında API\'den veri alınamadı.');
            }
        });
    }, 15000);

    // window.addEventListener('beforeunload', () => {
    //     clearInterval(updateInterval);
    // });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sayfa yüklendi, ilk veri çekiliyor...');

    if (initialMessage) initialMessage.style.display = 'block';
    if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';

    fetchLiveMatches().then(data => {
        if (data) {
             displayMatches(data);
             startLiveUpdates();
         } else {
             console.error("İlk veri çekme başarısıız oldu.");
              if (initialMessage) initialMessage.textContent = 'Maç verileri yüklenemedi.';
              if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
         }
    });
});

// Not: Favorileme işlevselliği henüz tamamlanmadı.
