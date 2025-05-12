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
const detailsPanel = document.getElementById('match-details-panel');
const initialMessage = detailsPanel ? detailsPanel.querySelector('.initial-message') : null;
const selectedMatchInfo = detailsPanel ? detailsPanel.querySelector('.selected-match-info') : null;
const matchDetailTitle = detailsPanel ? detailsPanel.querySelector('.match-detail-title') : null;
const matchHeaderTeams = detailsPanel ? detailsPanel.querySelector('.match-header-teams') : null; // Takım logoları ve isimleri için yeni container
const headerHomeLogo = matchHeaderTeams ? matchHeaderTeams.querySelector('.home-logo') : null;
const headerTeamNames = matchHeaderTeams ? matchHeaderTeams.querySelector('.header-team-names') : null;
const headerAwayLogo = matchHeaderTeams ? matchHeaderTeams.querySelector('.away-logo') : null;


const tabButtons = detailsPanel ? detailsPanel.querySelectorAll('.tab-button') : null;
const tabPanes = detailsPanel ? detailsPanel.querySelectorAll('.tab-pane') : null;
const eventsTabContent = detailsPanel ? document.getElementById('events-tab-content') : null;
const statisticsTabContent = detailsPanel ? document.getElementById('statistics-tab-content') : null;
const eventsSectionInPane = eventsTabContent ? eventsTabContent.querySelector('.events-section') : null;
const statisticsSectionInPane = statisticsTabContent ? statisticsTabContent.querySelector('.statistics-section') : null;


// Paneller bulunamazsa uyarı verelim
if (!matchesListContainer) console.error("HTML'de #matches-list ID'li container bulunamadı!");
if (!detailsPanel) console.error("HTML'de #match-details-panel ID'li container bulunamadı.");
if (!initialMessage) console.warn("HTML'de .initial-message elementi bulunamadı.");
if (!selectedMatchInfo) console.warn("HTML'de .selected-match-info elementi bulunamadı.");
if (!matchDetailTitle) console.warn("HTML'de .match-detail-title elementi bulunamadı.");
if (!matchHeaderTeams) console.warn("HTML'de .match-header-teams elementi bulunamadı."); // Yeni element kontrolü
if (!headerHomeLogo) console.warn("HTML'de .home-logo elementi bulunamadı.");
if (!headerTeamNames) console.warn("HTML'de .header-team-names elementi bulunamadı.");
if (!headerAwayLogo) console.warn("HTML'de .away-logo elementi bulunamadı.");


if (!tabButtons || tabButtons.length === 0) console.warn("HTML'de sekme düğmeleri (.tab-button) bulunamadı.");
if (!tabPanes || tabPanes.length === 0) console.warn("HTML'de sekme içerik alanları (.tab-pane) bulunamadı.");
if (!eventsTabContent) console.warn("HTML'de #events-tab-content elementi bulunamadı.");
if (!statisticsTabContent) console.warn("HTML'de #statistics-tab-content elementi bulunamadı.");
if (!eventsSectionInPane) console.warn("HTML'de .events-section (olaylar paneli içinde) elementi bulunamadı.");
if (!statisticsSectionInPane) console.warn("HTML'de .statistics-section (istatistikler paneli içinde) elementi bulunamadı.");


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


// Canlı maç verilerini çeken fonksiyon
async function fetchLiveMatches() {
    console.log('API\'den canlı maç verileri çekiliyor...', fixturesUrl);
    try {
        const response = await fetch(fixturesUrl, options); // fixturesUrl kullanıyoruz

        if (!response.ok) {
            // HTTP durumu 200-299 aralığında değilse hata fırlat
            const errorDetail = await response.text();
            throw new Error(`API isteği başarısız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
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
            throw new Error(`Olay API isteği başarısız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
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
            throw new Error(`İstatistik API isteği başarısız oldu: ${response.status} - ${response.statusText}. Detay: ${errorDetail}`);
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

        let eventContent = '';
        let eventIcon = ''; // İkon için değişken

        if (eventType === 'Goal') {
            eventIcon = '⚽';
            const assistPlayer = (event.assist && event.assist.name) ? ` (Asist: ${event.assist.name})` : '';
            eventContent = `${playerName}${assistPlayer}`;
            eventItem.classList.add('event-goal');
             if (eventDetail && eventDetail !== 'Normal Goal') eventContent += ` (${eventDetail})`;

        } else if (eventType === 'Card') {
            eventIcon = eventDetail === 'Yellow Card' ? '📒' : eventDetail === 'Red Card' ? '🟥' : '';
            eventContent = `${eventDetail}! ${playerName}`;
            eventItem.classList.add('event-card');
            if(eventDetail === 'Yellow Card') eventItem.classList.add('event-yellow-card');
            if(eventDetail === 'Red Card') eventItem.classList.add('event-red-card');
        } else if (eventType === 'subst') {
             eventIcon = '🔁';
             let players = '';
             if (event.player && event.player.name) players += `Çıkan: ${event.player.name}`; // Player genellikle çıkan oyuncu
             if (event.assist && event.assist.name) players += (players ? ', ' : '') + ` Giren: ${event.assist.name}`; // Assist genellikle giren oyuncu
             eventContent = `Oyuncu Değişikliği (${players})`;
             eventItem.classList.add('event-subst');
        } else if (eventType === 'Var') {
             eventIcon = '🖥️';
             eventContent = `VAR Kontrolü (${eventDetail})`;
             eventItem.classList.add('event-var');
        } else if (eventType === 'Penalty') {
             eventIcon = eventDetail === 'Missed Penalty' ? '❌' : eventDetail === 'Penalty Scored' ? '✅' : '득점';
             eventContent = `Penaltı: ${eventDetail}! ${playerName}`;
             eventItem.classList.add('event-penalty');
        } else {
            // Bilinmeyen veya diğer olay türleri için
             eventContent = `${eventType}: ${eventDetail} ${playerName}`;
             eventIcon = ' '; // Varsayılan ikon veya boşluk
        }

        // Olay zamanı, takım adı, ikon ve olay içeriğini birleştir
        eventItem.innerHTML = `<span>${time}</span> ${teamName}: <span class="event-icon">${eventIcon}</span> ${eventContent}`;

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

     // Gelen yanıttaki takım isimlerini veya ID'lerini kullanarak ev sahibi ve deplasman istatistik setlerini bulalım
     if (teamStatistics.length >= 2) { // En az 2 takımın istatistiği gelmeli
         const team1 = teamStatistics[0];
         const team2 = teamStatistics[1];

         // Takım adları ile eşleştirme
         if (team1.team && team1.team.name === homeTeamName) {
             homeStats = team1.statistics;
             awayStats = team2.statistics;
         } else if (team1.team && team1.team.name === awayTeamName) {
             homeStats = team2.statistics;
             awayStats = team1.statistics;
         } else if (team2.team && team2.team.name === homeTeamName) { // Eğer 0. eleman ev sahibi değilse 1. eleman ev sahibi olabilir
              homeStats = team2.statistics;
             awayStats = team1.statistics;
         } else if (team2.team && team2.team.name === awayTeamName) { // Eğer 1. eleman ev sahibi değilse 0. eleman ev sahibi olabilir
              homeStats = team1.statistics;
             awayStats = team2.statistics;
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
         }
          // awayStats boş kalacak veya ikinci eleman varsa ikinci takımı da işlemeyi deneyebiliriz
          // teamStatistics[1] varsa ve istatistiği varsa
          if(teamStatistics.length > 1 && teamStatistics[1].statistics) {
              awayStats = teamStatistics[1].statistics; // İkinci takımı deplasman gibi göster
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


     // İstatistikler için ikon haritası (isteğe bağlı olarak daha fazla ikon eklenebilir)
     const statIcons = {
         "Shots on Goal": "🎯", // Kaleye Şut
         "Shots off Goal": "🚫", // Kaleyi Bulan Şut Değil
         "Total Shots": "⚽", // Toplam Şut
         "Blocked Shots": "🛡️", // Engellenen Şut
         "Shots insidebox": "📦", // Ceza Sahası İçi Şut
         "Shots outsidebox": "🛣️", // Ceza Sahası Dışı Şut
         "Fouls": "🚨", // Faul
         "Corner Kicks": "🚩", // Korner
         "Offsides": "📏", // Ofsayt
         "Ball Possession": " possession icon? ", // Topla Oynama (şimdilik boşluk)
         "Yellow Cards": "📒", // Sarı Kart
         "Red Cards": "🟥", // Kırmızı Kart
         "Goalkeeper Saves": "🧤", // Kaleci Kurtarışı
         "Total passes": "➡️", // Toplam Pas
         "Passes accurate": "✅➡️", // Başarılı Pas
         "Passes %": "📊", // Pas Başarı Yüzdesi
         "Expected Goals (xG)": "📈", // Beklenen Gol
          "Expected Goals against (xGA)": "📉", // Yenilen Beklenen Gol
          "Expected Points (xP)": "📍", // Beklenen Puan
          "Big Chance Created": "✨", // Büyük Fırsat Yarattı
          "Big Chance Missed": "💔", // Büyük Fırsat Kaçırdı
          "Clearances": "🧹", // Uzaklaştırma
          "Interceptions": "✋", // Top Kapma (İntersepsiyon)
          "Tackles": "💪", // Top Kapma (Müdahele)
          "Duels Total": "⚔️", // Toplam İkili Mücadele
          "Duels won": "🏆", // Kazanılan İkili Mücadele
          "Dribble Attempts": "💨", // Çalım Girişimi
          "Dribble Success": "✅💨", // Başarılı Çalım
          "Dispossessed": "🚫⚽", // Top Kaybı
          "Saves": "🧤", // Kurtarış (Kaleci Kurtarışı ile aynı olabilir)
          "Passes accurate %": "✅%" // Başarılı Pas Yüzdesi
     };


     // İstatistikleri tek tek listeleme
      sortedStatTypes.forEach(statType => { // Tüm türler arasında döngü
          const statItem = document.createElement('li');
          statItem.classList.add('stat-item'); // CSS class (Genel)

           // İlgili istatistik türünün değer objelerini bul
           const homeValueObj = homeStats ? homeStats.find(s => s.type === statType) : null;
           const awayValueObj = awayStats ? awayStats.find(s => s.type === statType) : null;

           // Değerleri al, null ise '-' yap
           let homeValue = (homeValueObj && homeValueObj.value !== null) ? homeValueObj.value : '-';
           let awayValue = (awayValueObj && awayValueObj.value !== null) ? awayValueObj.value : '-';

           // İstatistik türü ikonunu al (varsa)
           const icon = statIcons[statType] || ' '; // Tanımlı değilse boşluk kullan

           // HTML yapısını oluşturacak div
           const statValuesDiv = document.createElement('div');
           statValuesDiv.classList.add('stat-values'); // Değerleri ve türü içeren sat


           // --- İstatistik türüne göre gösterim şeklini belirle ---
           // Topla Oynama yüzdelik çubuk. Diğer sayısal istatistikler için de çubuk yapalım.
           // Kartlar gibi sadece sayı olan ve çubuk istemediğimiz istatistikler için ise basit yan yana gösterim.

           const isPercentage = typeof homeValue === 'string' && homeValue.endsWith('%') &&
                                typeof awayValue === 'string' && awayValue.endsWith('%');

           // Sayısal değer olup olmadığını kontrol edelim (yüzde olmayan sayısal değerler)
           // '-' veya null olanları sayısal kabul etmeyeceğiz bu hesaplama için
           const isNumeric = !isPercentage &&
                             !isNaN(parseFloat(homeValue)) && isFinite(parseFloat(homeValue)) &&
                             !isNaN(parseFloat(awayValue)) && isFinite(parseFloat(awayValue));

           // Sayısal değerleri parseFloat'a çevirerek toplam hesaplayalım
           const numericHomeValue = isNumeric ? parseFloat(homeValue) : 0;
           const numericAwayValue = isNumeric ? parseFloat(awayValue) : 0;
           const totalNumericValue = numericHomeValue + numericAwayValue;


           // Hangi istatistiklere çubuk ekleyeceğimize karar verelim
           // Yüzdelik olanlara (Ball Possession, Passes %) çubuk.
           // Sayısal olanların çoğuna çubuk (Şutlar, Fauller, Paslar vb.)
           // Kartlar, Ofsayt gibi bazıları çubuksuz olabilir (ekran görüntüsünde bazılarında çubuk var bazılarında yok)
           // Şimdilik sadece Topla Oynama için özel yüzdelik çubuk, diğer sayısal olanlara sayısal çubuk yapalım.
           // Kartlar, Ofsayt, Korner gibi sayılar bazen çubuklu bazen çubuksuz olabilir. API'den gelen veriye ve istediğin tasarıma göre bu mantık ayarlanabilir.
           // Şimdilik "Cards", "Offsides", "Corner Kicks", "Goalkeeper Saves" gibi istatistikleri çubuksuz bırakalım, diğer sayısal olanlara çubuk ekleyelim.

           const statsWithoutBars = ["Yellow Cards", "Red Cards", "Offsides", "Corner Kicks", "Goalkeeper Saves", "Saves", "Penalties"]; // Çubuksuz kalacak istatistik türleri (API'den gelen isimlere göre ayarla)


           if (statType === "Ball Possession" && isPercentage) { // --- Yüzdelik Çubuk (Topla Oynama) ---
               // Yüzde değerlerini sayı olarak al
               const homePercent = parseFloat(homeValue);
               const awayPercent = parseFloat(awayValue);

               // Geçerli sayılar olduklarından emin ol
               const validHomePercent = isNaN(homePercent) ? 0 : homePercent;
               const validAwayPercent = isNaN(awayPercent) ? 0 : awayPercent;

               // Çubuk genişliği için yüzdeleri kullan (Toplamları 100 varsayarak)
               // Eğer toplam 100 değilse, toplam üzerinden yüzde hesaplanabilir (home / (home+away)) * 100
                const totalForBar = validHomePercent + validAwayPercent;
                const homeBarWidth = totalForBar > 0 ? (validHomePercent / totalForBar) * 100 : 0;
                const awayBarWidth = totalForBar > 0 ? (validAwayPercent / totalForBar) * 100 : 0;


               // Yüzdelik çubuk için HTML yapısı
               statItem.classList.add('stat-item-bar'); // Çubuklu istatistik stili için sınıf (genel)
               statItem.classList.add('stat-item-percentage'); // Yüzdelik stili için sınıf


               statValuesDiv.innerHTML = `
                   <span class="stat-home-value">${homeValue}</span>
                   <span class="stat-type"><span class="stat-icon">${icon}</span> ${statType}</span>
                   <span class="stat-away-value">${awayValue}</span>
               `;
               statItem.appendChild(statValuesDiv); // Değerleri ve türü ekle

               // Progress bar divini oluştur
               const progressBarDiv = document.createElement('div');
               progressBarDiv.classList.add('stat-progress-bar');
               progressBarDiv.innerHTML = `
                   <div class="progress-bar-track">
                       <div class="progress-bar-home" style="width: ${homeBarWidth}%;"></div>
                       <div class="progress-bar-away" style="width: ${awayBarWidth}%;"></div>
                   </div>
               `;
               statItem.appendChild(progressBarDiv); // Barı değerlerin altına ekle


           } else if (isNumeric && totalNumericValue > 0 && !statsWithoutBars.includes(statType)) { // --- Sayısal Çubuk (Toplamı 0 olmayan ve çubuksuz listesinde olmayan sayısal istatistikler) ---
                 // Sayısal değerlere göre çubuk genişliği hesapla (toplam değere oranla)
                 const homeBarWidth = (numericHomeValue / totalNumericValue) * 100;
                 const awayBarWidth = (numericAwayValue / totalNumericValue) * 100;


                statItem.classList.add('stat-item-bar'); // Çubuklu istatistik stili için sınıf (genel)
                statItem.classList.add('stat-item-numeric'); // Sayısal stili için sınıf

                statValuesDiv.innerHTML = `
                   <span class="stat-home-value">${homeValue}</span>
                   <span class="stat-type"><span class="stat-icon">${icon}</span> ${statType}</span>
                   <span class="stat-away-value">${awayValue}</span>
               `;
               statItem.appendChild(statValuesDiv); // Değerleri ve türü ekle

               // Progress bar divini oluştur
               const progressBarDiv = document.createElement('div');
               progressBarDiv.classList.add('stat-progress-bar');
               progressBarDiv.innerHTML = `
                   <div class="progress-bar-track">
                       <div class="progress-bar-home" style="width: ${homeBarWidth}%;"></div>
                       <div class="progress-bar-away" style="width: ${awayBarWidth}%;"></div>
                   </div>
               `;
               statItem.appendChild(progressBarDiv); // Barı değerlerin altına ekle


           }
            else {
               // --- Basit İstatistikler (Çubuksuz) ---
               // Sayısal olup toplamı 0 olanlar veya çubuksuz listesinde olanlar veya sayısal/yüzdelik olmayanlar
                statItem.classList.add('stat-item-simple'); // Basit stili için sınıf (yan yana metin)

                statValuesDiv.innerHTML = `
                   <span class="stat-home-value">${homeValue}</span>
                   <span class="stat-type"><span class="stat-icon">${icon}</span> ${statType}</span>
                   <span class="stat-away-value">${awayValue}</span>
               `;
               statItem.appendChild(statValuesDiv); // Değerleri ve türü ekle

           }

           statsList.appendChild(statItem); // Listeye istatistik öğesini ekle
      });


     console.log('İstatistikler sağ panele yerleştirildi (Gelişmiş gösterim ile).');
}


// API'den gelen veriyi alıp HTML'i dolduran fonksiyon (Güncellendi - Sekme yönetimi ve Başlık Logoları)
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
                <span class="favorite-icon">☆</span> `;
            leagueSection.appendChild(leagueTitle);

            // Bu lige ait maçları ekle
            if (leagueData.matches) {
                leagueData.matches.forEach(match => {
                    const matchItem = document.createElement('div');
                    matchItem.classList.add('match-item');
                     // Maç ID'sini data-match-id özniteliğine kaydediyoruz
                     matchItem.dataset.matchId = match.fixture && match.fixture.id ? match.fixture.id : 'match-id-unknown';

                    // JSON yapısına göre Alan Adları Uyarlanıyor:
                    const homeTeamName = match.teams && match.teams.home ? match.teams.home.name : 'Ev Sahibi';
                    const awayTeamName = match.teams && match.teams.away ? match.teams.away.name : 'Deplasman';
                    const homeTeamLogo = (match.teams && match.teams.home ? match.teams.home.logo : null) || 'placeholder-logo.png'; // Placeholder resim yolunu kontrol et!
                    const awayTeamLogo = (match.teams && match.teams.away ? match.teams.away.logo : null) || 'placeholder-logo.png'; // Placeholder resim yolunu kontrol et!

                    const homeScore = match.goals && match.goals.home !== null ? match.goals.home : '-';
                    const awayScore = match.goals && match.goals.away !== null ? match.goals.away : '-';

                    const statusShort = match.fixture && match.fixture.status ? match.fixture.status.short : '';
                    const statusLong = match.fixture && match.fixture.status ? match.fixture.status.long : 'Başlamadı';
                    const elapsedTime = (match.fixture && match.fixture.status && match.fixture.status.elapsed !== null && (statusShort === '1H' || statusShort === '2H' || statusShort === 'ET' || statusShort === 'BT' || statusShort === 'LIVE')) ? match.fixture.status.elapsed + "'" : '';

                     const matchDateObj = match.fixture && match.fixture.date ? new Date(match.fixture.date) : null;
                     const matchTime = matchDateObj ? matchDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saat Belirtilmemiş';
                     const matchDate = matchDateObj ? matchDateObj.toLocaleDateString() : '';

                    let odds1 = '-', oddsX = '-', odds2 = '-'; // Oranlar hala JSON'da yok


                    matchItem.innerHTML = `
                        <div class="match-summary">
                            <div class="team-info">
                                <img src="${homeTeamLogo}" alt="${homeTeamName} Logo" class="team-logo">
                                <span class="team-name">${homeTeamName}</span>
                            </div>
                            <div class="score-status">
                                ${statusShort === '1H' || statusShort === '2H' || statusShort === 'ET' || statusShort === 'BT' || statusShort === 'LIVE' ? // Oyun devam ediyorsa (İlk Yarı, İkinci Yarı, Uzatma vb.)
                                    `<span class="score">${homeScore} - ${awayScore}</span><span class="match-status">${elapsedTime || statusLong}</span>` : // Skoru ve geçen süreyi/durumu göster
                                     statusShort === 'HT' || statusShort === 'FT' || statusShort === 'AET' || statusShort === 'PEN' ? // Devre arası, bitti, uzatma bitti, penaltılar gibi durumlar
                                    `<span class="score">${homeScore} - ${awayScore}</span><span class="match-status">${statusLong}</span>` : // Skoru ve uzun durumu göster
                                     statusShort === 'NS' || statusShort === 'TBD' ? // Henüz başlamadıysa (Not Started, To Be Determined)
                                    `<span class="match-time">${matchTime}</span><span class="match-date">${matchDate}</span>` : // Saat ve tarih
                                    `<span class="match-status">${statusLong}</span>` // Diğer durumlar için sadece uzun durumu göster
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
                            <span class="match-favorite-icon">☆</span> </div>
                    `;

                    // --- Maç öğesine tıklama olayı dinleyicisi ---
                    matchItem.addEventListener('click', () => {
                        const selectedFixtureId = matchItem.dataset.matchId; // Tıklanan öğeden maç ID'sini al
                        console.log(`Maç öğesine tıklandı. ID: ${selectedFixtureId}`);

                         // --- Sağ Panel Hazırlığı (Sekme yapısı ve Başlık Logoları dahil) ---
                         if (detailsPanel && initialMessage && selectedMatchInfo && matchDetailTitle && matchHeaderTeams && headerHomeLogo && headerTeamNames && headerAwayLogo) {
                             // Başlangıç mesajını gizle
                             initialMessage.style.display = 'none';
                             // Seçilen maç info alanını görünür yap
                             selectedMatchInfo.style.display = 'block';

                             // Başlık, takım isimleri ve logoları güncelle
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

                                 matchDetailTitle.textContent = `${leagueName}`; // Başlığa lig adını koy
                                 headerTeamNames.innerHTML = `<strong>${homeTeamName} vs ${awayTeamName}</strong>`; // Takım isimlerini bold yap
                                  headerHomeLogo.src = homeTeamLogoUrl; // Ev sahibi logosunu ayarla
                                 headerHomeLogo.alt = `${homeTeamName} Logo`;
                                  headerAwayLogo.src = awayTeamLogoUrl; // Deplasman logosunu ayarla
                                 headerAwayLogo.alt = `${awayTeamName} Logo`;

                             } else {
                                  matchDetailTitle.textContent = 'Maç Detayları';
                                 headerTeamNames.innerHTML = `<p>Seçilen maç detayları yükleniyor...</p>`;
                                  headerHomeLogo.src = 'placeholder-logo.png';
                                 headerHomeLogo.alt = 'Ev Sahibi Logo';
                                  headerAwayLogo.src = 'placeholder-logo.png';
                                 headerAwayLogo.alt = 'Deplasman Logo';
                             }

                             // Olaylar ve istatistikler içeriğini temizle
                             if(eventsSectionInPane) eventsSectionInPane.innerHTML = '';
                             if(statisticsSectionInPane) statisticsSectionInPane.innerHTML = '';

                             // Varsayılan olarak olaylar sekmesini aktif yap
                             switchTab('events');

                         } else {
                             console.error("Sağ panelin gerekli elementleri bulunamadı!");
                              // Temel temizlik yapabiliriz
                             if (detailsPanel) detailsPanel.innerHTML = '<h3>Detaylar Yükleniyor...</h3><p>Gerekli panel elementleri bulunamadı.</p>';
                         }


                         // Olayları çekme fonksiyonunu çağır
                        fetchMatchEvents(selectedFixtureId).then(eventsData => {
                             if(eventsData){
                                 // Olay verisi çekildikten sonra olaylar sekmesi içeriğine yerleştirme fonksiyonunu çağır
                                 displayMatchDetails(selectedFixtureId, eventsData); // Bu fonksiyon olaylar paneli içini dolduruyor
                             } else {
                                  // Eğer olay verisi boş gelirse veya hata olursa, olaylar paneli içindeki boş mesajı ekle
                                   if (eventsSectionInPane) {
                                        eventsSectionInPane.innerHTML = '<h4>Maç Olayları</h4><p style="text-align:center; font-style: italic; font-size: 14px;">Bu maçta henüz bir olay yok veya yüklenemedi.</p>';
                                    }
                             }
                        });

                         // !!! İSTATİSTİKLERİ ÇEKME FONKSİYONU ÇAĞRISI BURADA YAPILIYOR VE VERİ displayMatchStatistics'e GÖNDERİLİYOR !!!
                         // İstatistik verisi çekildikten sonra istatistikler sekmesi içeriğine yerleştirilecek
                         fetchMatchStatistics(selectedFixtureId).then(statsData => {
                             if(statsData){
                                 // displayMatchStatistics fonksiyonu istatistikler paneli içini dolduracak
                                 displayMatchStatistics(selectedFixtureId, statsData, homeTeamName, awayTeamName); // Takım isimlerini de gönder
                             } else {
                                  // Eğer istatistik verisi boş gelirse veya hata olursa, istatistikler paneli içindeki boş mesajı ekle
                                   if (statisticsSectionInPane) {
                                        statisticsSectionInPane.innerHTML = '<h4>İstatistikler</h4><p style="text-align:center; font-style: italic; font-size: 14px;">Bu maç için istatistik bilgisi bulunamadı veya yüklenemedi.</p>';
                                    }
                             }
                         });


                        // Seçilen maç öğesine bir class ekleyerek görsel geri bildirim sağlayabiliriz
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
    // !!! Bu interval süresini API limitlerinize göre AYARLAMALISINIZ !!!
    // Çok sık istek yapmak API limitlerinizi hızla tüketebilir. 15 saniye (15000 ms) örnek bir değerdir.
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
    }, 15000); // Her 15 saniyede bir güncelle (Milisaniye cinsinden)

    // Sayfa kapatıldığında veya ayrılırken interval'i temizlemek iyi pratiktir
    // window.addEventListener('beforeunload', () => {
    //     clearInterval(updateInterval);
    // });
}

// Sayfa yüklendiğinde ilk kez veriyi çek ve göster
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sayfa yüklendi, ilk veri çekiliyor...');

    // Başlangıçta sadece ilk mesajı göster, seçilen maç info alanını gizle
    if (initialMessage) initialMessage.style.display = 'block';
    if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';


    fetchLiveMatches().then(data => {
        if (data) {
             displayMatches(data);
             startLiveUpdates();
         } else {
             console.error("İlk veri çekme başarısıız oldu.");
              // Hata durumunda başlangıç mesajını veya hata mesajını göster
              if (initialMessage) initialMessage.textContent = 'Maç verileri yüklenemedi.';
              if (selectedMatchInfo) selectedMatchInfo.style.display = 'none';
         }
    });
});


// Not: Favorileme işlevselliği henüz tamamlanmadı.