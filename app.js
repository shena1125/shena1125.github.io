const songsById = new Map();
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseButton = document.querySelector('.modal-close');
const filterToggle = document.getElementById('filter-toggle');
const filterContent = document.getElementById('filter-content');
const filterToggleIcon = document.getElementById('filter-toggle-icon');

function formatStartTime(seconds) {
  const secs = Number(seconds);

  if (Number.isNaN(secs)) return "-";

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  return `${m}:${String(s).padStart(2,'0')}`;
}

function createInfoRow(label, value) {
  const row = document.createElement('div');
  row.className = 'modal-info-row';
  row.innerHTML = `
    <div class="modal-info-label">${label}</div>
    <div class="modal-info-value">${value || '-'}</div>
  `;
  return row;
}

function createStatusBadge(label, active) {
  if (!active) return null;

  const badge = document.createElement('span');
  badge.className = 'modal-badge modal-badge--active';
  badge.textContent = label;
  return badge;
}

function openModal(songId) {
  const song = songsById[songId];
  if (!song) return;
  renderModal(song);
  modalOverlay.classList.remove('hidden');
  modalOverlay.setAttribute('aria-hidden', 'false');
  modalOverlay.scrollTop = 0;
  document.body.classList.add('modal-open');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderModal(song) {
  const thumbnail = document.getElementById('modal-thumbnail');
  const thumbnailLink = document.getElementById('modal-thumbnail-link');
  thumbnailLink.href =
   song.youtube_link || song.live_url || "#";
if (song.cover_image) {
  thumbnail.src = song.cover_image;
  thumbnail.alt = song.song_title || "サムネイル";
  thumbnail.style.display = "block";
} else {
  thumbnail.removeAttribute("src");
  thumbnail.alt = "";
  thumbnail.style.display = "none";
}
  document.getElementById('modal-song-title').textContent = song.song_title;
  document.getElementById('modal-artist').textContent = song.artist;

  const streamInfo = document.getElementById('modal-stream-info');
  streamInfo.innerHTML = '';
  streamInfo.appendChild(createInfoRow('📺 配信タイトル', song.live_title));
  streamInfo.appendChild(createInfoRow('📅 配信日', song.live_date));
  streamInfo.appendChild(createInfoRow('⏰ 歌唱開始時間', formatStartTime(song.start_seconds)));

  const singingInfo = document.getElementById('modal-singing-info');
  singingInfo.innerHTML = '';
[
  createStatusBadge('初披露', song.first),
  createStatusBadge('フル歌唱', song.full),
  createStatusBadge('デュエット', song.duet)
].forEach(badge => {
  if (badge) singingInfo.appendChild(badge);
});

  const duetSection = document.getElementById('modal-duet-partner-section');
  if (song.duet && Array.isArray(song.duet_partner) && song.duet_partner.length > 0) {
    duetSection.classList.remove('hidden');
    document.getElementById('modal-duet-partner').textContent = song.duet_partner.join(' / ');
  } else {
    duetSection.classList.add('hidden');
  }

  const watchButton = document.getElementById('modal-watch-button');
  watchButton.href = song.youtube_link || song.live_url || '#';
}

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

    songsById[song.song_id] = song;

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
    ${song.cover_image ? `
    <a
      href="${song.youtube_link}"
      target="_blank"
      rel="noopener noreferrer"
      class="thumbnail-link">
     <img
     class="thumbnail"
     src="${song.cover_image}"
     alt="${song.song_title}"
     loading="lazy">
    </a>
     ` : ""}
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
       ⓘ詳細
     </button>
    
     <a class="live-link"
        href="${song.youtube_link}"
        target="_blank"
        rel="noopener noreferrer">
        ▶ 配信
     </a>
    </div>
    `; 
    card.querySelector('.detail-button').addEventListener('click', () => {
    openModal(song.song_id);
   });

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
          return (
           a.dataset.song_title_reading ||
           a.querySelector('.song-title').textContent
          ).localeCompare(
           b.dataset.song_title_reading ||
           b.querySelector('.song-title').textContent,
          'ja'
          );
        }

        if (sortOrder === 'artist') {
          return (
            a.dataset.artist_reading ||
            a.querySelector('.artist').textContent
          ).localeCompare(
            b.dataset.artist_reading ||
            b.querySelector('.artist').textContent,
            'ja'
          );
        }
        return 0;
      });
    
      visibleCards.forEach(card => list.appendChild(card));
    
      const resultCount = document.getElementById('result-count');
      if (resultCount) {
        resultCount.textContent = `🎵 検索結果：${visibleCards.length}件`;
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
    if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
     modalOverlay.addEventListener('click', event => {
      if (event.target === modalOverlay) {
       closeModal();
     }
   });
    }
    document.addEventListener('keydown', event => {
      if (
        event.key === 'Escape' &&
        !modalOverlay.classList.contains('hidden')
      ) {
        closeModal();
     }
   });

  } catch (e) {
    console.error('読み込み失敗：', e);
  }
}

loadSongs();

if (filterToggle) {

  filterToggle.addEventListener('click', () => {

    filterContent.classList.toggle('open');

    filterToggleIcon.style.transform =
     filterContent.classList.contains('open')
      ? 'rotate(180deg)'
      : 'rotate(0deg)';

  });
}

// ===============================
// 上に戻るボタン 表示制御
// ===============================

const backToTopButton = document.getElementById('back-to-top');

function toggleBackToTopButton() {

  if (!backToTopButton) return;

  if (window.scrollY > 300) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');
  }

}

window.addEventListener('scroll', toggleBackToTopButton);

// 初期表示
toggleBackToTopButton();

// ===============================
// 上に戻る
// ===============================

if (backToTopButton) {

  backToTopButton.addEventListener('click', () => {

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  });

}