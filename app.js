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
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(keyword) ? 'block' : 'none';
  });
});
