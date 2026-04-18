/**
 * Riksan Project - TikTok Downloader Engine v2.5
 * Optimized for GitHub Pages & Direct Download
 */

const btnAction = document.getElementById('btnAction');
const tiktokInput = document.getElementById('tiktokUrl');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('result');
const downloadBtn = document.getElementById('downloadLink');

// Fungsi Pintar: Mencegah Link Double/Tabrakan
const fixUrl = (path) => {
    if (!path) return "";
    // Jika path sudah ada 'http', artinya sudah lengkap dari API
    if (path.startsWith('http')) return path;
    // Jika belum, baru tambahkan domain TikWM
    return `https://www.tikwm.com${path}`;
};

btnAction.addEventListener('click', async () => {
    const rawUrl = tiktokInput.value.trim();
    if (!rawUrl) return alert('Paste link TikTok dulu, Bos!');

    // UI Feedback
    btnAction.disabled = true;
    btnAction.innerHTML = `<span>MEMPROSES...</span>`;
    loader.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        // Tembak API TikWM
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(rawUrl)}`);
        const result = await response.json();

        if (result && result.data) {
            const v = result.data;

            // Pastikan URL bersih sebelum dimasukkan ke UI
            const finalThumb = fixUrl(v.cover);
            const finalVideo = fixUrl(v.play); // 'play' adalah No Watermark

            // Update Tampilan
            document.getElementById('thumb').src = finalThumb;
            document.getElementById('author').innerText = "@" + (v.author.nickname || "User");
            document.getElementById('desc').innerText = v.title || "TikTok Video Berhasil Diambil";
            
            // Masukkan link video ke tombol
            downloadBtn.href = finalVideo;
            
            resultArea.classList.remove('hidden');
            resultArea.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Gagal: ' + (result.msg || 'Video tidak ditemukan!'));
        }
    } catch (err) {
        alert('Koneksi Error: Gagal terhubung ke API TikWM.');
        console.error(err);
    } finally {
        btnAction.disabled = false;
        btnAction.innerText = 'AMBIL VIDEO';
        loader.classList.add('hidden');
    }
});

/**
 * LOGIKA DOWNLOAD LANGSUNG KE GALERI
 * Menggunakan Blob untuk memicu sistem "Save As"
 */
downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = downloadBtn.href;
    if (!url || url.includes('#')) return;

    const originalText = downloadBtn.innerText;

    try {
        // UI Loading saat download
        downloadBtn.innerText = "MENGUNDUH KE GALERI...";
        downloadBtn.classList.add('opacity-50', 'pointer-events-none');

        // 1. Ambil data video secara silent
        const response = await fetch(url);
        if (!response.ok) throw new Error('Download gagal');
        const blob = await response.blob();
        
        // 2. Buat URL bayangan di memori
        const blobUrl = window.URL.createObjectURL(blob);
        
        // 3. Picu Trigger Download
        const a = document.createElement('a');
        a.href = blobUrl;
        // Nama file custom biar keren pas di galeri
        a.download = `RiksanProject_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        
        // 4. Bersihkan memori browser
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        
        alert("Berhasil! Video sudah tersimpan di Galeri/Download.");
    } catch (err) {
        // Fallback: Jika kena blokir CORS/Kebijakan browser
        console.warn("Direct download failed, opening in new tab...");
        window.open(url, '_blank');
        alert("Video dibuka di tab baru. Silakan klik tahan videonya lalu pilih 'Simpan Video'.");
    } finally {
        downloadBtn.innerText = originalText;
        downloadBtn.classList.remove('opacity-50', 'pointer-events-none');
    }
});
