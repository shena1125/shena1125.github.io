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

    songs.forEach(song => {
      const card = document.createElement('div');
      card.className = 'song-card';

            // dataset に読み情報を追加
      card.dataset.song_title_reading = song.song_title_reading || "";
      card.dataset.artist_reading = song.artist_reading || "";

      // Phase2 Step1: 検索対象に配信タイトルとアニメ・ゲーム名を追加
      card.dataset.live_title = song.live_title || "";
      card.dataset.anime_game = song.anime_game || "";

      // 配信種別（日本語化）
      const streamTypeLabel = typeMap[song.stream_type] || "その他";

      card.innerHTML = `
  <div class="song-title">${song.song_title}</div>
  <div class="artist">${song.artist}</div>

  <div class="live-date">📅 ${song.live_date}</div>
  <div class="live-title">📺 ${song.live_title}</div>

  ${song.first ? `<div class="first-flag">⭐ 初披露</div>` : ""}

  <div class="stream-type">🎤 ${streamTypeLabel}</div>
  ${song.anime_game ? `<div class="anime-game">🎬 ${song.anime_game}</div>` : ""}

  <div class="full-flag">🎵 ${song.full ? "フル" : "ワンコーラス"}</div>

  <a class="live-link" href="${song.youtube_link}" target="_blank">配信を見る</a>
`;

      list.appendChild(card);
    });

    // 「読み込み中...」を消す
    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.remove();

    document.body.appendChild(list);

    // 検索イベントをここで登録（確実に要素が存在するタイミング）
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        const keyword = e.target.value.toLowerCase();

               document.querySelectorAll('.song-card').forEach(card => {
          const title = card.querySelector('.song-title')?.textContent.toLowerCase() || "";
          const artist = card.querySelector('.artist')?.textContent.toLowerCase() || "";
          const titleReading = card.dataset.song_title_reading?.toLowerCase() || "";
          const artistReading = card.dataset.artist_reading?.toLowerCase() || "";

          // Phase2 Step1: 配信タイトル・アニメ・ゲーム名も検索対象に追加
          const liveTitle = card.dataset.live_title?.toLowerCase() || "";
          const animeGame = card.dataset.anime_game?.toLowerCase() || "";

          const text = `${title} ${artist} ${titleReading} ${artistReading} ${liveTitle} ${animeGame}`;
          card.style.display = text.includes(keyword) ? 'block' : 'none';
        });
      });
    }

  } catch (e) {
    console.error('読み込み失敗：', e);
  }
}

loadSongs();
