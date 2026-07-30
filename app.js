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
      { id: 'filter-original', datasetKey: 'original_song' },
      { id: 'filter-full', datasetKey: 'full' }
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
      card.dataset.full = song.full ? 'true' : 'false';
      card.dataset.stream_type = song.stream_type || "";
      card.dataset.live_date = song.live_date || "";

      card.innerHTML = `
    ${song.cover_image ? `<img class="thumbnail" src="${song.cover_image}" alt="${song.song_title}" loading="lazy">` : ""}
    <div class="song-title" title="${song.song_title}">
      ${song.song_title}
    </div>
    <div class="artist">${song.artist}</div>
    <div class="live-date">📅 ${song.live_date}</div>
  
    <div class="badge-row">
      ${song.first ? `<span class="badge-pill badge-first">初披露</span>` : ""}
      <span class="badge-pill badge-full">${song.full ? "フル" : "ワンコーラス"}</span>
      ${song.original_song ? `<span class="badge-pill badge-original">オリジナル</span>` : ""}
    </div>
  
    <div class="card-actions">
     <button
       type="button"
       class="card-button detail-button"
       data-song-id="${song.song_id}">
       詳細を見る
     </button>
    
     <a class="live-link"
        href="${song.youtube_link}"
        target="_blank"
        rel="noopener noreferrer">
        ▶ 配信を見る
     </a>
    </div>
    `; 

      list.appendChild(card);
    });

    // 「読み込み中...」を消す
    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.remove();

    document.body.appendChild(list);

    const searchInput = document.getElementById('search');
    const streamFilterSelect = document.getElementById('filter-stream-type');
    const sortSelect = document.getElementById('sort-order');

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

    function matchesCheckboxFilters(card, activeFilters) {
      return filterDefinitions.every(filter => {
        if (!activeFilters[filter.datasetKey]) return true;
        return card.dataset[filter.datasetKey] === 'true';
      });
    }

    function matchesStreamType(card, selectedStreamType) {
      if (!selectedStreamType || selectedStreamType === 'all') return true;
      return card.dataset.stream_type === selectedStreamType;
    }

    function applyDisplay() {
      const keyword = searchInput?.value.toLowerCase() || "";
      const activeFilters = filterDefinitions.reduce((acc, filter) => {
        const checkbox = document.getElementById(filter.id);
        acc[filter.datasetKey] = checkbox ? checkbox.checked : false;
        return acc;
      }, {});
      const selectedStreamType = streamFilterSelect?.value || 'all';
      const sortOrder = sortSelect?.value || 'newest';
    
      const visibleCards = [];
    
      document.querySelectorAll('.song-card').forEach(card => {
        const visible =
          matchesSearch(card, keyword) &&
          matchesCheckboxFilters(card, activeFilters) &&
          matchesStreamType(card, selectedStreamType);
    
        card.style.display = visible ? 'block' : 'none';
        if (visible) visibleCards.push(card);
      });
    
      visibleCards.sort((a, b) => {
        if (sortOrder === 'newest' || sortOrder === 'oldest') {
          const aDate = new Date(a.dataset.live_date);
          const bDate = new Date(b.dataset.live_date);
          return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
        }
        if (sortOrder === 'title') {
          return a.querySelector('.song-title').textContent.localeCompare(
            b.querySelector('.song-title').textContent,
            'ja'
          );
        }
        if (sortOrder === 'artist') {
          return a.querySelector('.artist').textContent.localeCompare(
            b.querySelector('.artist').textContent,
            'ja'
          );
        }
        return 0;
      });
    
      visibleCards.forEach(card => list.appendChild(card));
    
      const resultCount = document.getElementById('result-count');
      if (resultCount) {
        resultCount.textContent = `検索結果：${visibleCards.length}件`;
      }
    }

    // 検索・フィルター・並び替えイベントを登録
    if (searchInput) {
      searchInput.addEventListener('input', applyDisplay);
    }

    filterDefinitions.forEach(filter => {
      const checkbox = document.getElementById(filter.id);
      if (checkbox) {
        checkbox.addEventListener('change', applyDisplay);
      }
    });

    if (streamFilterSelect) {
      streamFilterSelect.addEventListener('change', applyDisplay);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', applyDisplay);
    }

    applyDisplay();

  } catch (e) {
    console.error('読み込み失敗：', e);
  }
}

loadSongs();