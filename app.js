async function loadSongs() {
  try {
    const res = await fetch('./songs.json');
    const songs = await res.json();

    const list = document.createElement('div');
    list.id = 'song-list';

    songs.forEach(song => {
      const card = document.createElement('div');
      card.className = 'song-card';

      card.innerHTML = `
        <div class="song-title">${song.song_title}</div>
        <div class="artist">${song.artist}</div>
        <div>初披露：${song.first ? "✔" : "－"}</div>
        <a class="live-link" href="${song.live_url}" target="_blank">配信を見る</a>
      `;

      list.appendChild(card);
    });

    document.body.appendChild(list);

  } catch (e) {
    document.getElementById('result').textContent =
      '読み込み失敗：' + e;
  }
}

loadSongs();

document.getElementById('search').addEventListener('input', e => {
  const keyword = e.target.value.toLowerCase();

  document.querySelectorAll('.song-card').forEach(card => {
    const title = card.querySelector('.song-title')?.textContent.toLowerCase() || "";
    const artist = card.querySelector('.artist')?.textContent.toLowerCase() || "";

    // JSONデータから読みも含めて検索できるようにする
    const songData = card.dataset; // dataset に読み情報を持たせる
    const titleReading = songData.song_title_reading?.toLowerCase() || "";
    const artistReading = songData.artist_reading?.toLowerCase() || "";

    const text = `${title} ${artist} ${titleReading} ${artistReading}`;
    card.style.display = text.includes(keyword) ? 'block' : 'none';
  });
});

