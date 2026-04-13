/**
 * Kinetic Lens - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const dropZone = document.getElementById('drop-zone');
    const resultSection = document.getElementById('result-section');
    const sourceImg = document.getElementById('source-img');
    const scanner = document.getElementById('scanner');
    const predictionCard = document.getElementById('prediction-card');
    const predictionName = document.getElementById('prediction-name');
    const predictionSport = document.getElementById('prediction-sport');
    const predictionImg = document.getElementById('prediction-img');
    const confidenceText = document.getElementById('confidence-text');
    const confidenceBar = document.getElementById('confidence-bar');
    const matchBadge = document.getElementById('match-badge');
    const newScanBtn = document.getElementById('new-scan-btn');
    const mobileUploadBtn = document.getElementById('mobile-upload-btn');

    // Athlete Database
    const athletes = {
        'lionel_messi': { name: 'Lionel Messi', sport: 'Football', img: 'assets/lionel_messi_portrait_1775985439385.png' },
        'virat_kohli': { name: 'Virat Kohli', sport: 'Cricket', img: 'assets/virat_kohli_portrait_1775985353393.png' },
        'roger_federer': { name: 'Roger Federer', sport: 'Tennis', img: 'assets/roger_federer_portrait_1775985395213.png' },
        'serena_williams': { name: 'Serena Williams', sport: 'Tennis', img: 'assets/serena_williams_portrait_1775985377499.png' },
        'maria_sharapova': { name: 'Maria Sharapova', sport: 'Tennis', img: 'assets/maria_sharapova_portrait_1775985415902.png' }
    };

    // --- Event Listeners ---

    uploadBtn.addEventListener('click', () => fileInput.click());
    if (mobileUploadBtn) mobileUploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImage(file);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleImage(file);
    });

    newScanBtn.addEventListener('click', resetUI);

    // --- Core Functions ---

    function handleImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            sourceImg.src = e.target.result;
            showResults();
            startClassification();
        };
        reader.readAsDataURL(file);
    }

    function showResults() {
        resultSection.classList.remove('opacity-0', 'pointer-events-none');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    async function startClassification() {
        // Reset prediction state
        resetPrediction();
        
        // Show scanner
        scanner.style.display = 'block';
        matchBadge.innerText = 'ANALYZING...';
        matchBadge.className = 'text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-black';

        try {
            const response = await fetch('http://127.0.0.1:5000/classify_image', {
                method: 'POST',
                body: new URLSearchParams({
                    'image_data': sourceImg.src
                })
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0]; // Take the first face match
                const athleteKey = result.class;
                const confidence = Math.max(...result.class_probability);
                
                updatePredictionUI(athleteKey, confidence);
            } else {
                matchBadge.innerText = 'NO FACE DETECTED';
                matchBadge.className = 'text-[10px] bg-error/20 text-error px-2 py-0.5 rounded-full font-black';
                scanner.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
            matchBadge.innerText = 'SERVER ERROR';
            matchBadge.className = 'text-[10px] bg-error/20 text-error px-2 py-0.5 rounded-full font-black';
            scanner.style.display = 'none';
        }
    }

    function updatePredictionUI(athleteKey, confidence) {
        const result = athletes[athleteKey] || { name: athleteKey.replace('_', ' '), sport: 'Unknown', img: '' };
        
        // Stop scanner
        scanner.style.display = 'none';

        // Update UI
        predictionName.innerText = result.name;
        predictionSport.innerText = result.sport;
        if (result.img) predictionImg.src = result.img;
        
        confidenceText.innerText = `${Math.round(confidence)}%`;
        confidenceBar.style.width = `${confidence}%`;
        
        matchBadge.innerText = 'MATCH FOUND';
        matchBadge.className = 'text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-full font-black';

        // Highlight in roster
        highlightRoster(athleteKey);
    }

    function highlightRoster(athleteKey) {
        // Remove existing highlights
        document.querySelectorAll('.athlete-card').forEach(card => {
            card.classList.remove('pulse-match');
            card.querySelector('.check-badge').classList.add('opacity-0', 'scale-0');
        });

        // Add highlight to match
        const matchCard = document.querySelector(`.athlete-card[data-athlete="${athleteKey}"]`);
        if (matchCard) {
            matchCard.classList.add('pulse-match');
            const badge = matchCard.querySelector('.check-badge');
            badge.classList.remove('opacity-0', 'scale-0');
            badge.classList.add('opacity-100', 'scale-100');
            matchCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function resetPrediction() {
        predictionName.innerText = '...';
        predictionSport.innerText = '-';
        predictionImg.src = '';
        confidenceText.innerText = '0%';
        confidenceBar.style.width = '0%';
        
        document.querySelectorAll('.athlete-card').forEach(card => {
            card.classList.remove('pulse-match');
            card.querySelector('.check-badge').classList.add('opacity-0', 'scale-0');
        });
    }

    function resetUI() {
        resultSection.classList.add('opacity-0', 'pointer-events-none');
        fileInput.value = '';
        sourceImg.src = '';
        resetPrediction();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
