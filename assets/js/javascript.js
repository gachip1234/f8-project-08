const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
  const cached = localStorage.getItem(path);
  if (cached) {
    $(selector).innerHTML = cached;
  }

  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      if (html !== cached) {
        $(selector).innerHTML = html;
        localStorage.setItem(path, html);
      }
    })
    .finally(() => {
      window.dispatchEvent(new Event("template-loaded"));
    });
}

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
  if (!element) return true;

  if (window.getComputedStyle(element).display === "none") {
    return true;
  }

  let parent = element.parentElement;
  while (parent) {
    if (window.getComputedStyle(parent).display === "none") {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
  if (isHidden($(".js-dropdown-list"))) return;

  const items = $$(".js-dropdown-list > li");

  items.forEach((item) => {
    const arrowPos = item.offsetLeft + item.offsetWidth / 2;
    item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
  });
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener("resize", calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener("template-loaded", calArrowPos);

/**
 * Handle Dark/Light Mode Theme Toggle
 */
function initTheme() {
  const currentTheme = localStorage.getItem("theme");
  const html = document.documentElement;

  // Setup initial class based on storage
  if (currentTheme === "light") {
    html.classList.remove("dark");
  } else {
    // Default to dark mode
    html.classList.add("dark");
  }
}

// Chạy khởi tạo theme ngay
initTheme();

window.addEventListener("template-loaded", () => {
  const themeToggleGrp = document.querySelector(".js-theme-toggle");
  if (themeToggleGrp) {
    const themeIcon = themeToggleGrp.querySelector(".js-theme-icon");
    const html = document.documentElement;

    // Prevent duplicate event bindings
    if (themeToggleGrp.dataset.themeInit) return;
    themeToggleGrp.dataset.themeInit = "true";

    // Set correct icon initially when template loads
    if (html.classList.contains("dark")) {
      themeIcon.src = "./assets/icons/sun.svg";
    } else {
      themeIcon.src = "./assets/icons/moon.svg";
    }

    themeToggleGrp.addEventListener("click", () => {
      html.classList.toggle("dark");

      if (html.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeIcon.src = "./assets/icons/sun.svg";
      } else {
        localStorage.setItem("theme", "light");
        themeIcon.src = "./assets/icons/moon.svg";
      }
    });
  }
});

/**
 * Handle Like Button Interactions
 */
window.addEventListener("DOMContentLoaded", () => {
  const likeBtns = document.querySelectorAll(".like-btn");
  likeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const countSpan = btn.querySelector(".like-btn__count");
      if (!countSpan) return;
      
      let currentCount = parseInt(countSpan.textContent) || 0;
      const isLiked = btn.classList.contains("like-btn--liked");
      
      if (isLiked) {
        btn.classList.remove("like-btn--liked");
        countSpan.textContent = Math.max(0, currentCount - 1);
      } else {
        btn.classList.add("like-btn--liked");
        countSpan.textContent = currentCount + 1;
      }
    });
  });
});

/**
 * Handle Mobile Drawer Interactions
 */
window.addEventListener("template-loaded", () => {
  const drawer = document.querySelector(".js-drawer");
  const openBtn = document.querySelector(".js-drawer-open");
  const closeBtns = document.querySelectorAll(".js-drawer-close");
  const accordionLabels = document.querySelectorAll(".js-drawer-accordion");

  if (!drawer || !openBtn) return;

  // Open drawer
  openBtn.onclick = () => {
    drawer.classList.add("show");
  };

  // Close drawer
  closeBtns.forEach((btn) => {
    btn.onclick = () => {
      drawer.classList.remove("show");
    };
  });

  // Accordion toggle
  accordionLabels.forEach((label) => {
    label.onclick = () => {
      const parent = label.parentElement;
      const submenu = parent.querySelector(".drawer-nav__submenu");
      if (submenu) {
        submenu.classList.toggle("open");
        label.classList.toggle("active");
      }
    };
  });

  // Search Sidebar toggle
  const searchToggle = document.querySelector(".js-search-toggle");
  const home = document.querySelector(".js-home");
  if (searchToggle && home) {
    searchToggle.onclick = () => {
      home.classList.toggle("home--show-sidebar");
    };
  }

  // Filter Toggle
  const filterBtn = document.querySelector(".js-filter-btn");
  const filterDropdown = document.querySelector(".js-filter");
  const filterOverlay = document.querySelector(".js-filter-overlay");
  const filterCloses = document.querySelectorAll(".js-filter-close");

  if (filterBtn && filterDropdown && filterOverlay) {
    filterBtn.onclick = (e) => {
      e.stopPropagation();
      filterDropdown.classList.toggle("show");
      filterOverlay.classList.toggle("show");
    };

    filterCloses.forEach((btn) => {
      btn.onclick = () => {
        filterDropdown.classList.remove("show");
        filterOverlay.classList.remove("show");
      };
    });

    filterOverlay.onclick = () => {
      filterDropdown.classList.remove("show");
      filterOverlay.classList.remove("show");
    };

    // Close on click outside (for desktop dropdown)
    window.addEventListener("click", (e) => {
      if (!filterDropdown.contains(e.target) && !filterBtn.contains(e.target)) {
        filterDropdown.classList.remove("show");
        filterOverlay.classList.remove("show");
      }
    });
  }
});

