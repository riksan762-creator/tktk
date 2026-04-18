/**
 * Riksan Project - TikTok Downloader Engine v3.0
 * Ultra-Responsive & Auto-Clean URL Logic
 */

const btnAction = document.getElementById('btnAction');
const tiktokInput = document.getElementById('tiktokUrl');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('result');
const downloadBtn = document.getElementById('downloadLink');

// Fungsi Pembersih URL (Anti-Error NXDOMAIN)
const getCleanUrl = (path) => {
    if (!path) return "";
    // Jika API memberikan link yang sudah ada https-nya di tengah (akibat double domain)
    if (path.includes('https://')) {
        return path.substring(path.lastIndexOf('https://'));
    }
    // Jika hanya path folder, tambahkan domain TikWM
    if (path.startsWith('/')) {
        return `https://www.tikwm.com${path}`;
    }
    return path;
};

btnAction.addEventListener('click', async () => {
    const rawUrl = tiktokInput.value.trim();
    if (!rawUrl) return alert('Link-nya mana, Bos?');

    // UI Feedback Modern
    btnAction.disabled = true;
    btnAction.innerHTML = `<span class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> MEMPROSES...</span>`;
    
    loader.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(rawUrl)}`);
        const result = await response.json();

        if (result && result.data) {
            const v = result.data;

            // Bersihkan Link Video & Thumbnail
            const finalVideo = getCleanUrl(v.play);
            const finalThumb = getCleanUrl(v.cover);

            // Update UI
            document.getElementById('thumb').src = finalThumb;
            document.getElementById('author').innerText = "@" + (v.author.nickname || "TikTok User");
            document.getElementById('desc').innerText = v.title || "Video Berhasil Diambil";
            
            // Masukkan link bersih ke tombol download
            downloadBtn.href = finalVideo;
            
            resultArea.classList.remove('hidden');
            resultArea.classList.add('fade-up');
        } else {
            alert('Gagal: ' + (result.msg || 'Video tidak ditemukan!'));
        }
    } catch (err) {
        alert('Koneksi ke API TikWM Bermasalah!');
    } finally {
        btnAction.disabled = false;
        btnAction.innerText = 'AMBIL VIDEO';
        loader.classList.add('hidden');
    }
});

/**
 * PRO DOWNLOADER LOGIC (Chrome Optimized)
 */
downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const videoUrl = downloadBtn.href;
    if (!videoUrl || videoUrl.includes('#')) return;

    const originalText = downloadBtn.innerText;
    
    try {
        downloadBtn.innerText = "SEDANG MENGUNDUH...";
        downloadBtn.classList.add('opacity-50', 'pointer-events-none');

        // Menarik data video langsung ke browser
        const res = await fetch(videoUrl);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Memicu browser Chrome untuk download otomatis
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.setAttribute('download', `RiksanProject_${Date.now()}.mp4`);
        document.body.appendChild(tempLink);
        tempLink.click();
        
        // Cleanup memori
        setTimeout(() => {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobUrl);
        }, 100);

    } catch (err) {
        // Fallback jika fetch diblokir browser: Buka di tab baru untuk save manual
        window.open(videoUrl, '_blank');
    } finally {
        setTimeout(() => {
            downloadBtn.innerText = "DOWNLOAD NO WATERMARK";
            downloadBtn.classList.remove('opacity-50', 'pointer-events-none');
        }, 1000);
    }
});
