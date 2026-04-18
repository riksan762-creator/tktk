const btnAction = document.getElementById('btnAction');
const btnPaste = document.getElementById('btnPaste');
const tiktokInput = document.getElementById('tiktokUrl');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('result');
const downloadBtn = document.getElementById('downloadLink');

// Fix URL Logic: Membersihkan link agar tidak double (Solusi NXDOMAIN)
const cleanUrl = (path) => {
    if (!path) return "";
    // Jika path berantakan (mengandung https dobel), ambil link terakhir
    if (path.includes('https://')) {
        return path.substring(path.lastIndexOf('https://'));
    }
    // Jika path hanya folder, sambungkan ke domain tikwm
    return `https://www.tikwm.com${path}`;
};

// Fitur Paste Otomatis
btnPaste.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        tiktokInput.value = text;
    } catch (err) {
        alert("Gagal mengakses clipboard. Silakan tempel manual.");
    }
});

btnAction.addEventListener('click', async () => {
    const rawUrl = tiktokInput.value.trim();
    if (!rawUrl) return alert('Silakan tempel tautan video dulu!');

    btnAction.disabled = true;
    loader.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(rawUrl)}`);
        const result = await response.json();

        if (result && result.data) {
            const v = result.data;

            // Bersihkan data URL
            const finalVideo = cleanUrl(v.play);
            const finalThumb = cleanUrl(v.cover);

            document.getElementById('thumb').src = finalThumb;
            document.getElementById('author').innerText = "@" + (v.author.nickname || "TikTok User");
            document.getElementById('desc').innerText = v.title || "Berhasil memproses video";
            
            downloadBtn.href = finalVideo;
            
            resultArea.classList.remove('hidden');
            resultArea.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Video tidak ditemukan atau link salah!');
        }
    } catch (err) {
        alert('Terjadi kesalahan jaringan!');
    } finally {
        btnAction.disabled = false;
        loader.classList.add('hidden');
    }
});

// Download Logic (Chrome Optimized)
downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = downloadBtn.href;
    if (!url || url.includes('#')) return;

    const originalText = downloadBtn.innerText;
    
    try {
        downloadBtn.innerText = "SEDANG MENGUNDUH...";
        downloadBtn.style.pointerEvents = "none";

        const res = await fetch(url);
        const blob = await res.blob();
        const bUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = bUrl;
        a.download = `RiksanProject_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(bUrl);
        }, 100);

        alert("Video berhasil disimpan!");
    } catch (err) {
        window.open(url, '_blank');
        alert("Video dibuka di tab baru. Silakan simpan manual jika unduhan tidak dimulai.");
    } finally {
        downloadBtn.innerText = originalText;
        downloadBtn.style.pointerEvents = "auto";
    }
});
