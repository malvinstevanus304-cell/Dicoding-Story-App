import { getToken } from '../../utils/auth.js';

export default class HomePage {
  async render() {
    return `
      <section class="container page">
        <!-- HERO SECTION -->
        <div class="hero">
          <h1 class="hero__title">Selamat Datang di Story App</h1>
          <p class="hero__subtitle">Bagikan momenmu dengan dunia 🌍</p>
        </div>

        <!-- STORY LIST -->
        <h2 class="section-title">Daftar Story Terbaru</h2>
        <div id="stories" class="stories-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyContainer = document.querySelector('#stories');
    const token = getToken();

    // Jika belum login
    if (!token) {
      storyContainer.innerHTML = `
        <p style="color:red; text-align:center;">
          <a href="#/login">Login</a>.
        </p>
      `;
      return;
    }

    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      // Jika ada error dari API
      if (!response.ok || result.error) {
        storyContainer.innerHTML = `
          <p style="color:red; text-align:center;">
            ${result.message || 'Gagal memuat story'}
          </p>
        `;
        return;
      }

      // Render daftar story
      storyContainer.innerHTML = result.listStory
        .map(
          (story) => `
            <div class="story-item">
              <img src="${story.photoUrl}" alt="Foto ${story.name}" />
              <div class="story-item__content">
                <h3>${story.name}</h3>
                <p>${story.description}</p>
              </div>
            </div>
          `
        )
        .join('');

    } catch (err) {
      storyContainer.innerHTML = `
        <p style="color:red; text-align:center;">
          Gagal memuat story: ${err.message}
        </p>
      `;
    }
  }
}
