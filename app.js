const btnAction = document.getElementById('btnAction');
const tiktokInput = document.getElementById('tiktokUrl');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('result');
const downloadBtn = document.getElementById('downloadLink');

// Base URL TikWM
const apiBase = "https://www.tikwm.com";

btnAction.addEventListener('click', async () => {
    const rawUrl = tiktokInput.value.trim();
    if (!rawUrl) return alert('Link-nya mana, Bos?');

    // Reset UI
    btnAction.disabled = true;
    btnAction.innerText = 'MEMPROSES...';
    loader.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        // Tembak API TikWM langsung dari browser (Client-side)
        const response = await fetch(`${apiBase}/api/?url=${encodeURIComponent(rawUrl)}`);
        const result = await response.json();

        if (result && result.data) {
            const v = result.data;

            // Masukkan data ke UI
            document.getElementById('thumb').src = apiBase + v.cover;
            document.getElementById('author').innerText = "@" + (v.author.nickname || "User");
            document.getElementById('desc').innerText = v.title || "TikTok Video";
            
            // Link download bersih (No Watermark)
            downloadBtn.href = apiBase + v.play;
            
            resultArea.classList.remove('hidden');
        } else {
            alert('Gagal: Video tidak ditemukan atau private!');
        }
    } catch (err) {
        alert('Koneksi Error: Pastikan internet lancar!');
    } finally {
        btnAction.disabled = false;
        btnAction.innerText = 'AMBIL VIDEO';
        loader.classList.add('hidden');
    }
});

// Fitur Download Otomatis ke Galeri
downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = downloadBtn.href;
    if (!url || url === "#") return;

    try {
        downloadBtn.innerText = "MENGUNDUH...";
        downloadBtn.style.opacity = "0.5";

        const res = await fetch(url);
        const blob = await res.blob();
        const bUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = bUrl;
        a.download = `RiksanProject_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(bUrl);
        document.body.removeChild(a);
        alert("Berhasil disimpan ke galeri!");
    } catch (err) {
        window.open(url, '_blank');
        alert("Klik tahan video lalu pilih 'Simpan'.");
    } finally {
        downloadBtn.innerText = "DOWNLOAD NO WATERMARK";
        downloadBtn.style.opacity = "1";
    }
});
