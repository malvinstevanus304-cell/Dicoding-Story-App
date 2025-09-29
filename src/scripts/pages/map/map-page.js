import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getToken } from '../../utils/auth';

// 🔹 Fix import ikon Leaflet di Webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: iconUrl,
  shadowUrl: iconShadow,
});

export default class MapPage {
  async render() {
    return `
      <section class="container page">
        <div class="hero">
          <h1 class="hero__title">📍 Story Map</h1>
          <p class="hero__subtitle">Lihat cerita terbaru lengkap dengan lokasi di peta</p>
        </div>

        <div class="map-container">
          <div class="map-stories">
            <h2 class="section-title">Daftar Story</h2>
            <ul class="stories-list" id="story-list"></ul>
          </div>
          <div class="map-view">
            <h2 class="section-title">Peta Lokasi</h2>
            <div id="map" style="height: 400px;"></div>
          </div>
        </div>

        <div id="message" class="map-message"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = getToken();
    const msg = document.querySelector('#message');

    if (!token) {
      msg.textContent = '⚠️ Silakan login dulu untuk melihat story dengan lokasi.';
      return;
    }

    try {
      const res = await fetch('https://story-api.dicoding.dev/v1/stories?location=1', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        msg.textContent = data.message || 'Gagal memuat data';
        return;
      }

      this._renderStories(data.listStory);
      this._renderMap(data.listStory);
    } catch (err) {
      msg.textContent = `Terjadi kesalahan: ${err.message}`;
    }
  }

  _renderStories(stories) {
    const list = document.querySelector('#story-list');
    list.innerHTML = '';
    stories.forEach((s, i) => {
      const li = document.createElement('li');
      li.className = 'story-item';
      li.dataset.index = i;
      li.innerHTML = `
        <img src="${s.photoUrl}" alt="${s.name}">
        <div class="story-item__content">
          <h3>${s.name}</h3>
          <p>${s.description}</p>
          <small>${new Date(s.createdAt).toLocaleString()}</small>
        </div>
      `;
      list.appendChild(li);
    });
  }

  _renderMap(stories) {
    const map = L.map('map').setView([-2.5, 118], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const markers = [];

    stories.forEach((s, i) => {
      let marker;
      if (s.lat !== undefined && s.lon !== undefined) {
        marker = L.marker([s.lat, s.lon])
          .addTo(map)
          .bindPopup(`<b>${s.name}</b><br>${s.description}`);
      } else {
        // fallback marker di posisi default
        marker = L.marker([-2.5, 118])
          .addTo(map)
          .bindPopup(`<b>${s.name}</b><br>${s.description}`);
      }
      markers.push(marker);
    });

    // Klik list story → fokus marker
    document.querySelectorAll('#story-list li').forEach((li) => {
      li.addEventListener('click', () => {
        const idx = li.dataset.index;
        const marker = markers[idx];
        if (marker) {
          map.setView(marker.getLatLng(), 13, { animate: true });
          if (marker.getPopup()) marker.openPopup();
          this._highlightStory(idx);
        }
      });
    });
  }

  _highlightStory(idx) {
    document.querySelectorAll('#story-list li').forEach((li, i) => {
      li.style.backgroundColor = i == idx ? '#d0f0ff' : '#fff';
    });
  }
}
