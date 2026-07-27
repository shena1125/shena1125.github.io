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

      // 配信種別（日本語化）
      const streamTypeLabel = typeMap[song.stream_type] || "その他";

      card.innerHTML = `
        <div class="song-title">${song.song_title}</div>
        <div class="artist">${song.artist}</div>
        <div class="live-date">📅 ${song.live_date}</div>
        ${song.first ? `<div class="first-flag">⭐ 初披露</div>` : ""}
        <div class="stream-type">🎤 配信種別：${stream
