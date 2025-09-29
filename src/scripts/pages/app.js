import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { getToken, clearToken } from '../utils/auth';
import { subscribePush, unsubscribePush } from '../push'; // ✅ sudah aman

class App {
  #content;
  #drawerButton;
  #navigationDrawer;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupLogout();
    this._setupSkipToContent();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.#navigationDrawer.classList.remove('open');
    });
  }

  _setupLogout() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'logout-link') {
        e.preventDefault();
        clearToken();
        window.location.hash = '#/login';
      }
    });
  }

  _setupSkipToContent() {
    const skipLink = document.getElementById('skip-to-content');
    const mainContent = document.getElementById('main-content');

    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus({ preventScroll: true });
        window.scrollTo({
          top: mainContent.offsetTop,
          behavior: 'smooth',
        });
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url] || routes['/'];

    if (this.#currentPage?.stop) {
      try {
        await this.#currentPage.stop();
      } catch (err) {
        console.warn('Gagal stop halaman sebelumnya:', err);
      }
    }

    this.#currentPage = page;

    const renderAndAttach = async () => {
      try {
        const content = await page.render();
        this.#content.innerHTML =
          content || '<section class="page"><p>⚠️ Konten gagal dimuat.</p></section>';
        if (page.afterRender) await page.afterRender();
      } catch (err) {
        console.error('Render error:', err);
        this.#content.innerHTML =
          '<section class="page"><p>⚠️ Terjadi kesalahan saat memuat halaman.</p></section>';
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(renderAndAttach);
    } else {
      await renderAndAttach();
    }

    const section = this.#content.querySelector('.page');
    if (section) section.classList.add('fade-in');

    const isLogin = getToken();
    document
      .querySelectorAll('.nav-list li.login, .nav-list li.register')
      .forEach((el) => {
        el.style.display = isLogin ? 'none' : 'block';
      });
    document.querySelectorAll('.nav-list li.logout').forEach((el) => {
      el.style.display = isLogin ? 'block' : 'none';
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // =====================================================
    // 🔹 Tambahkan Toggle Push Notification di halaman Home
    // =====================================================
    if (url === '/') {
      const notifToggle = document.createElement('button');
      notifToggle.id = 'toggle-push';
      notifToggle.textContent = 'Aktifkan Notifikasi';
      notifToggle.classList.add('btn', 'btn-warning');
      this.#content.prepend(notifToggle);

      notifToggle.addEventListener('click', async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await unsubscribePush(registration);
          notifToggle.textContent = 'Aktifkan Notifikasi';
        } else {
          await subscribePush(registration);
          notifToggle.textContent = 'Matikan Notifikasi';
        }
      });
    }
  }
}

export default App;
