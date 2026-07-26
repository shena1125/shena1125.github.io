async function loadSongs() {
  try {
    const res = await fetch('./songs.json');
    const data = await res.json();

    document.getElementById('result').textContent =
      `読み込み成功！件数：${data.length}`;
  } catch (e) {
    document.getElementById('result').textContent =
      '読み込み失敗：' + e;
  }
}

loadSongs();
