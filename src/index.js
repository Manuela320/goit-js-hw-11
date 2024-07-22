import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const gallery = document.querySelector('.gallery');
  const loadMoreBtn = document.querySelector('.load-more');
  const apiKey = '45060232-3e1d9bc13962891b397b3762a'; 
  let query = '';
  let page = 1;
  let totalHits = 0;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    query = e.target.searchQuery.value.trim();
    if (!query) return;

    page = 1;
    gallery.innerHTML = '';
    loadMoreBtn.style.display = 'none';

    const data = await fetchImages(query, page);
    handleResponse(data);
  });

  loadMoreBtn.addEventListener('click', async () => {
    page += 1;
    const data = await fetchImages(query, page);
    handleResponse(data);
  });

  async function fetchImages(query, page) {
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  function handleResponse(data) {
    if (data.totalHits === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    totalHits = data.totalHits;

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    const markup = data.hits.map(hit => createCardMarkup(hit)).join('');
    gallery.insertAdjacentHTML('beforeend', markup);

    loadMoreBtn.style.display = 'block';

    const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });
    lightbox.refresh();

    if (page * 40 >= totalHits) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  }

  function createCardMarkup({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) {
    return `
      <div class="photo-card">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b> ${likes}</p>
          <p class="info-item"><b>Views</b> ${views}</p>
          <p class="info-item"><b>Comments</b> ${comments}</p>
          <p class="info-item"><b>Downloads</b> ${downloads}</p>
        </div>
      </div>
    `;
  }
});