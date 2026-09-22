document.addEventListener('DOMContentLoaded', () => {
  const photoGrid = document.getElementById('photoGrid');
  const loadMoreTip = document.getElementById('loadMoreTip');

  const BASE_URL = 'https://photowall-1301526781.cos.ap-guangzhou.myqcloud.com/images';
  const BASE_URL_thumbs = 'https://photowall-1301526781.cos.ap-guangzhou.myqcloud.com/thumbs';
  const TOTAL_COUNT = 382;
  const PAGE_SIZE = 6;

  const photos = Array.from({ length: TOTAL_COUNT }, (_, index) => ({
    id: index,
    category: 'graduation',
    title: `合影${index + 1}`,
    // location: '图书馆大草坪',
    date: '2017-06',
    thumb: `${BASE_URL_thumbs}/${index}.jpg`,
    src: `${BASE_URL}/${index}.jpg`
  }));

  const filterBtns = document.querySelectorAll('.filter-btn');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxMeta = document.getElementById('lightboxMeta');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentVisibleCards = [];
  let currentIndex = 0;
  let activeFilter = 'all';
  let visibleCount = PAGE_SIZE;

  function getFilteredPhotos() {
    if (activeFilter === 'all') return photos;
    return photos.filter(photo => photo.category === activeFilter);
  }

  function renderPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.category = photo.category;
    card.dataset.src = photo.src;
    card.dataset.thumb = photo.thumb;

    card.innerHTML = `
      <div class="photo-wrapper">
        <img src="${photo.thumb}" alt="${photo.title}" loading="lazy">
      </div>
      <div class="photo-info">
        <div class="photo-title">${photo.title}</div>
        <div class="photo-meta">
          <span>${photo.date}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      currentIndex = currentVisibleCards.indexOf(card);
      showLightbox(card);
    });

    return card;
  }

  function updateVisibleCards() {
    const filteredPhotos = getFilteredPhotos();

    photoGrid.innerHTML = '';
    filteredPhotos.slice(0, visibleCount).forEach(photo => {
      const card = renderPhotoCard(photo);
      photoGrid.appendChild(card);
    });

    currentVisibleCards = Array.from(photoGrid.querySelectorAll('.photo-card'));

    if (visibleCount >= filteredPhotos.length) {
      loadMoreTip.textContent = '已加载全部照片';
      loadMoreTip.classList.add('end');
    } else {
      loadMoreTip.textContent = '下拉加载更多';
      loadMoreTip.classList.remove('end');
    }
  }

  function loadMore() {
    const filteredPhotos = getFilteredPhotos();
    if (visibleCount >= filteredPhotos.length) return;
    visibleCount += PAGE_SIZE;
    updateVisibleCards();
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      visibleCount = PAGE_SIZE;
      updateVisibleCards();
    });
  });

  function showLightbox(card) {
    if (!card) return;
    const imgSrc = card.dataset.src;
    const title = card.querySelector('.photo-title').innerText;
    const meta = card.querySelector('.photo-meta').innerText;

    lightboxImg.src = imgSrc;
    lightboxTitle.innerText = title;
    lightboxMeta.innerText = meta;
    lightbox.classList.add('show');
  }

  function hideLightbox() {
    lightbox.classList.remove('show');
  }

  lightboxClose.addEventListener('click', hideLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-img-container')) {
      hideLightbox();
    }
  });

  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentVisibleCards.length === 0) return;
    currentIndex = (currentIndex - 1 + currentVisibleCards.length) % currentVisibleCards.length;
    showLightbox(currentVisibleCards[currentIndex]);
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentVisibleCards.length === 0) return;
    currentIndex = (currentIndex + 1) % currentVisibleCards.length;
    showLightbox(currentVisibleCards[currentIndex]);
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
  });

  window.addEventListener('scroll', () => {
    const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 80;
    if (scrollBottom) {
      loadMore();
    }
  });

  updateVisibleCards();
});
