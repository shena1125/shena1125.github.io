async function loadSongs() {
  try {
    const res = await fetch('./songs.json');
    const songs = await res.json();

    const list = document.createElement('div');
    list.id = 'song-list';

    // 配信種別の日本語化マップ
    const typeMap = {
      karaoke: "歌枠",
      live: "ライブ",
      relay: "歌枠リレー",
      collaboration: "コラボ",
      event: "イベント",
      others: "その他"
    };

    const filterDefinitions = [
      { id: 'filter-first', datasetKey: 'first' },
      { id: 'filter-original', datasetKey: 'original_song' }
    ];

    songs.forEach(song => {
      const card = document.createElement('div');
      card.className = 'song-card';

      // dataset に読み情報を追加
      card.dataset.song_title_reading = song.song_title_reading || "";
      card.dataset.artist_reading = song.artist_reading || "";

      // Phase2 Step1: 検索対象に配信タイトルと作品名を追加
      card.dataset.live_title = song.live_title || "";
      card.dataset.work_name = song.work_name || "";
      card.dataset.work_name_reading = song.work_name_reading || "";
      card.dataset.first = song.first ? 'true' : 'false';
      card.dataset.original_song = song.original_song ? 'true' : 'false';

      // 配信種別（日本語化）
      const streamTypeLabel = typeMap[song.stream_type] || "その他";

      card.innerHTML = `
  ${song.cover_image ? `<img  class="thumbnail"  
    src="${song.cover_image}"  
    alt="${song.song_title}"  
    loading="lazy">` : ""}
  <div class="song-title">${song.song_title}</div>
  <div class="artist">${song.artist}</div>

  <div class="live-date">📅 ${song.live_date}</div>
  <div class="live-title">📺 ${song.live_title}</div>

  ${song.first ? `<div class="first-flag">⭐ 初披露</div>` : ""}

  <div class="stream-type">🎤 ${streamTypeLabel}</div>
  ${song.work_name ? `<div class="work-name">🎬 ${song.work_name}</div>` : ""}

  <div class="full-flag">🎵 ${song.full ? "フル" : "ワンコーラス"}</div>

  <a class="live-link" href="${song.youtube_link}" target="_blank">配信を見る</a>
`;

      list.appendChild(card);
    });

    // 「読み込み中...」を消す
    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.remove();

    document.body.appendChild(list);

    const searchInput = document.getElementById('search');

    function matchesSearch(card, keyword) {
      if (!keyword) return true;

      const title = card.querySelector('.song-title')?.textContent.toLowerCase() || "";
      const artist = card.querySelector('.artist')?.textContent.toLowerCase() || "";
      const titleReading = card.dataset.song_title_reading?.toLowerCase() || "";
      const artistReading = card.dataset.artist_reading?.toLowerCase() || "";

      // 検索・フィルター用dataset
      const liveTitle = card.dataset.live_title?.toLowerCase() || "";
      const workName = card.dataset.work_name?.toLowerCase() || "";
      const workNameReading = card.dataset.work_name_reading?.toLowerCase() || "";

      const text = `${title} ${artist} ${titleReading} ${artistReading} ${liveTitle} ${workName} ${workNameReading}`;
      return text.includes(keyword);
    }

    function matchesFilters(card, activeFilters) {
      return filterDefinitions.every(filter => {
        if (!activeFilters[filter.datasetKey]) return true;
        return card.dataset[filter.datasetKey] === 'true';
      });
    }

    function applyDisplay() {
      const keyword = searchInput?.value.toLowerCase() || "";
      const activeFilters = filterDefinitions.reduce((acc, filter) => {
        const checkbox = document.getElementById(filter.id);
        acc[filter.datasetKey] = checkbox ? checkbox.checked : false;
        return acc;
      }, {});

      document.querySelectorAll('.song-card').forEach(card => {
        const visible = matchesSearch(card, keyword) && matchesFilters(card, activeFilters);
        card.style.display = visible ? 'block' : 'none';
      });
    }

    // 検索イベントをここで登録
    if (searchInput) {
      searchInput.addEventListener('input', applyDisplay);
    }

    filterDefinitions.forEach(filter => {
      const checkbox = document.getElementById(filter.id);
      if (checkbox) {
        checkbox.addEventListener('change', applyDisplay);
      }
    });

    applyDisplay();

  } catch (e) {
    console.error('読み込み失敗：', e);
  }
}

loadSongs();