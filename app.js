async function loadSongs() {
  try {
    const res = await fetch('./songs.json');
    const songs = await res.json();

    const list = document.createElement('div');
    list.id = 'song-list';

    songs.forEach(song => {
      const card = document.createElement('div');
      card.className = 'song-card';

      // dataset に読み情報を追加
      card.dataset.song_title_reading = song.song_title_reading || "";
      card.dataset.artist_reading = song.artist_reading || "";

      card.innerHTML = `
        <div class="song-title">${song.song_title}</div>
        <div class="artist">${song.artist}</div>
        <div>初披露：${song.first ? "✔" : "－"}</div>
        <a class="live-link" href="${song.live_url}&t=${song.start_seconds}s" target="_blank">配信を見る</a>
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

          const text = `${title} ${artist} ${titleReading} ${artistReading}`;
          card.style.display = text.includes(keyword) ? 'block' : 'none';
        });
      });
    }

  } catch (e) {
    console.error('読み込み失敗：', e);
  }
}

loadSongs();
