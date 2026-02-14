// --- 1. Efeito de Digitação (Typewriter) ---
const textElement = document.getElementById('typewriter');
const words = ["Full Stack", "Web", "Designer"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        textElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 150;

    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000; // Pausa no final da palavra
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

document.addEventListener('DOMContentLoaded', type);


// --- 2. Scroll Reveal (Elementos aparecem ao rolar) ---
const observerOptions = {
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// --- 3. Efeito 3D Tilt nos Cards (Vanilla JS puro) ---
const cards = document.querySelectorAll('.project-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Rotação max 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

const modal = document.getElementById('project-modal');
const modalTitle = modal.querySelector('.modal-title');
const modalDesc = modal.querySelector('.modal-desc');
const modalImg = modal.querySelector('.modal-img');
const modalTags = modal.querySelector('.modal-tags');
const modalVisit = modal.querySelector('.modal-visit');
const modalClose = modal.querySelector('.modal-close');
const modalYear = modal.querySelector('.modal-year');
const modalRole = modal.querySelector('.modal-role');
const modalCategory = modal.querySelector('.modal-category');
const modalFeatures = modal.querySelector('.modal-features');

function openModal(card) {
    const title = card.querySelector('h3')?.textContent || '';
    const detailsRaw = card.dataset.details || card.querySelector('p')?.textContent || '';
    const img = card.querySelector('.project-img')?.src || '';
    const tags = Array.from(card.querySelectorAll('.tech-tags span')).map(el => el.textContent);
    const url = card.dataset.url || '#';
    
    // Novos campos
    const year = card.dataset.year || '2023';
    const role = card.dataset.role || 'Desenvolvedor';
    const category = card.dataset.category || '';

    modalTitle.textContent = title;
    if (/[;\n•]/.test(detailsRaw)) {
        const lines = detailsRaw.split(/;|\n|•/).map(s => s.trim()).filter(Boolean);
        modalDesc.innerHTML = lines.map(l => `• ${l}`).join('<br>');
    } else {
        modalDesc.textContent = detailsRaw;
    }
    modalImg.src = img;
    modalTags.innerHTML = tags.map(t => `<span>${t}</span>`).join('');
    const feats = (card.dataset.features || '').split(';').map(s => s.trim()).filter(Boolean);
    if (modalFeatures) {
        modalFeatures.innerHTML = feats.map(f => `<li>${f}</li>`).join('');
        const subtitle = modal.querySelector('.modal-subtitle');
        if (feats.length === 0) {
            modalFeatures.style.display = 'none';
            if (subtitle) subtitle.style.display = 'none';
        } else {
            modalFeatures.style.display = '';
            if (subtitle) subtitle.style.display = '';
        }
    }
    modalVisit.href = url;
    
    if (modalYear) modalYear.textContent = year;
    if (modalRole) modalRole.textContent = role;
    if (modalCategory) {
        modalCategory.textContent = category;
        const categoryItem = modalCategory.parentElement;
        if (categoryItem) categoryItem.style.display = category ? '' : 'none';
    }

    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// --- 4. Modal para Cidade (Copacabana) ---
const cityModal = document.getElementById('city-modal');
const cityClose = cityModal ? cityModal.querySelector('.modal-close') : null;
const cityVideos = cityModal ? cityModal.querySelectorAll('.city-video') : [];
const locationBtn = document.querySelector('.contact-location');

function openCityModal() {
    if (!cityModal) return;
    // Preenche vídeos a partir dos data-video* do botão
    const v1 = locationBtn?.dataset.video1 || '';
    const v2 = locationBtn?.dataset.video2 || '';
    const v3 = locationBtn?.dataset.video3 || '';
    const urls = [v1, v2, v3].filter(Boolean);
    cityVideos.forEach((iframe, idx) => {
        iframe.src = urls[idx] || urls[0] || '';
    });
    cityModal.classList.add('active');
}

function closeCityModal() {
    if (!cityModal) return;
    cityModal.classList.remove('active');
    // Limpa src para parar reprodução
    cityVideos.forEach(iframe => { iframe.src = ''; });
}

if (locationBtn) {
    locationBtn.addEventListener('click', openCityModal);
}
if (cityClose) cityClose.addEventListener('click', closeCityModal);
if (cityModal) {
    cityModal.addEventListener('click', (e) => {
        if (e.target === cityModal) closeCityModal();
    });
}
