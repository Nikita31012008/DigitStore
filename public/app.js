// ===================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====================
let currentUser = null;
let cart = [];
let allProducts = [];
let users = [];

const API_BASE = 'http://localhost:3000/api';

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCart();
    setupRouting();
    navigateTo('/');
});

// ===================== МАРШРУТИЗАЦИЯ =====================
function setupRouting() {
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || '/';
        navigateTo(hash);
    });
}

async function navigateTo(route) {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">Загрузка...</div>';

    const path = route.split('?')[0];
    const params = new URLSearchParams(route.split('?')[1]);

    try {
        if (path === '/') {
            showHome();
        } else if (path === '/catalog') {
            showCatalog();
        } else if (path === '/product') {
            showProductDetail(params.get('id'));
        } else if (path === '/cart') {
            showCart();
        } else if (path === '/profile') {
            if (!currentUser) {
                showAuthModal('login');
                navigateTo('/');
                return;
            }
            showProfile();
        } else if (path === '/admin') {
            if (!currentUser || currentUser.role !== 'admin') {
                alert('Доступ только для администраторов');
                navigateTo('/');
                return;
            }
            showAdmin();
        } else {
            showHome();
        }
    } catch (error) {
        console.error('Ошибка навигации:', error);
        content.innerHTML = '<h2>Ошибка загрузки</h2>';
    }
}

// ===================== ГЛАВНАЯ СТРАНИЦА =====================
function showHome() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="hero">
            <h1>🎮 Добро пожаловать в DigitStore</h1>
            <p>Лучший магазин цифровых товаров</p>
            <a href="#/catalog" class="btn btn-primary">Смотреть каталог</a>
        </div>

        <div>
            <h2 style="margin-bottom: 1.5rem; color: white;">Популярные игры</h2>
            <div class="products-grid" id="featuredProducts"></div>
        </div>
    `;

    loadAndDisplayFeaturedProducts();
}

async function loadAndDisplayFeaturedProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        allProducts = products;

        const featured = products.slice(0, 4);
        const container = document.getElementById('featuredProducts');
        container.innerHTML = featured.map(p => createProductCard(p)).join('');

        // Добавляем обработчики событий
        featured.forEach(p => {
            document.getElementById(`card-${p.id}`).addEventListener('click', () => {
                showProductModal(p);
            });
        });
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

// ===================== КАТАЛОГ =====================
async function showCatalog() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
            <h1 style="margin-bottom: 1.5rem;">📦 Каталог товаров</h1>
            
            <div class="filters">
                <input type="text" class="search-box" id="searchInput" placeholder="🔍 Поиск товара...">
                <select class="filter-select" id="categoryFilter">
                    <option value="">Все категории</option>
                    <option value="games">🎮 Игры</option>
                    <option value="dlc">💎 DLC</option>
                    <option value="accounts">👤 Аккаунты</option>
                </select>
                <select class="filter-select" id="priceFilter">
                    <option value="">Все цены</option>
                    <option value="0-500">0 - 500 ₽</option>
                    <option value="500-1000">500 - 1000 ₽</option>
                    <option value="1000+">1000+ ₽</option>
                </select>
            </div>
        </div>

        <div class="products-grid" id="productsContainer"></div>
    `;

    await loadAllProducts();

    // Фильтрация
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('priceFilter').addEventListener('change', filterProducts);
}

async function loadAllProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const price = document.getElementById('priceFilter').value;

    let filtered = allProducts.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(search);
        const categoryMatch = !category || p.category === category;
        let priceMatch = true;

        if (price === '0-500') priceMatch = p.price <= 500;
        else if (price === '500-1000') priceMatch = p.price > 500 && p.price <= 1000;
        else if (price === '1000+') priceMatch = p.price > 1000;

        return nameMatch && categoryMatch && priceMatch;
    });

    displayProducts(filtered);
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    if (products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: white;">Товары не найдены</p>';
        return;
    }

    container.innerHTML = products.map(p => createProductCard(p)).join('');

    products.forEach(p => {
        document.getElementById(`card-${p.id}`).addEventListener('click', () => {
            showProductModal(p);
        });
    });
}

function createProductCard(product) {
    return `
        <div class="product-card" id="card-${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description.substring(0, 60)}...</div>
                <div class="product-rating">⭐ ${product.rating} (${product.reviews} отзывов)</div>
                <div class="product-footer">
                    <div class="product-price">${product.price} ₽</div>
                </div>
            </div>
        </div>
    `;
}

function getCategoryName(category) {
    const names = {
        'games': '🎮 Игры',
        'dlc': '💎 DLC',
        'accounts': '👤 Аккаунты'
    };
    return names[category] || category;
}

// ===================== СТРАНИЦА ТОВАРА =====================
async function showProductDetail(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        showProductModal(product);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function showProductModal(product) {
    const modal = document.getElementById('productModal');
    const detail = document.getElementById('productDetail');

    detail.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div>
                <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px;">
            </div>
            <div>
                <div class="product-category" style="color: #667eea;">${getCategoryName(product.category)}</div>
                <h2 style="margin: 1rem 0;">${product.name}</h2>
                <div class="product-rating" style="margin-bottom: 1rem;">⭐ ${product.rating} (${product.reviews} отзывов)</div>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 1rem;">${product.description}</p>
                
                <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <p><strong>Разработчик:</strong> ${product.developer}</p>
                    <p><strong>Дата выхода:</strong> ${new Date(product.releaseDate).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Платформы:</strong> ${product.platform.join(', ')}</p>
                    <p><strong>В наличии:</strong> ${product.stock} шт.</p>
                </div>

                <div style="font-size: 2rem; font-weight: bold; color: #667eea; margin-bottom: 1.5rem;">${product.price} ₽</div>

                ${currentUser ? `
                    <button class="btn btn-success" onclick="addToCart(${product.id}, '${product.name}', ${product.price})" style="width: 100%; padding: 12px; font-size: 1.1rem;">
                        🛒 Добавить в корзину
                    </button>
                ` : `
                    <button class="btn btn-primary" onclick="showAuthModal('login')" style="width: 100%; padding: 12px; font-size: 1.1rem;">
                        Авторизуйтесь для покупки
                    </button>
                `}
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// ===================== КОРЗИНА =====================
function addToCart(productId, name, price) {
    const item = {
        id: productId,
        name: name,
        price: price,
        quantity: 1
    };

    const existing = cart.find(c => c.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push(item);
    }

    saveCart();
    updateCartCount();
    alert(`✅ ${name} добавлен в корзину!`);
    closeProductModal();
}

function saveCart() {
    localStorage.setItem('digitstore_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('digitstore_cart');
    cart = saved ? JSON.parse(saved) : [];
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

async function showCart() {
    const content = document.getElementById('content');

    if (cart.length === 0) {
        content.innerHTML = `
            <div class="cart-container" style="text-align: center; padding: 3rem;">
                <h2>🛒 Ваша корзина пуста</h2>
                <p style="color: #666; margin: 1rem 0;">Добавьте товары для покупки</p>
                <a href="#/catalog" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let html = `
        <div class="cart-container">
            <h1 style="margin-bottom: 2rem;">🛒 Корзина</h1>
            <div style="margin-bottom: 2rem;">
    `;

    cart.forEach((item, index) => {
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div>Количество: ${item.quantity}</div>
                    <div class="cart-item-price">${item.price * item.quantity} ₽</div>
                </div>
                <button class="btn btn-danger" onclick="removeFromCart(${index})">Удалить</button>
            </div>
        `;
    });

    html += `
            </div>
            <div class="cart-total">
                Итого: ${total} ₽
            </div>
        `;

    if (currentUser) {
        html += `
            <button class="btn btn-success" onclick="checkout()" style="width: 100%; padding: 12px; font-size: 1.1rem; margin-top: 1.5rem;">
                ✅ Оформить заказ
            </button>
        `;
    } else {
        html += `
            <button class="btn btn-primary" onclick="showAuthModal('login')" style="width: 100%; padding: 12px; font-size: 1.1rem; margin-top: 1.5rem;">
                Авторизуйтесь для оформления
            </button>
        `;
    }

    html += `</div>`;
    content.innerHTML = html;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    showCart();
}

async function checkout() {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }

    try {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                items: cart,
                total: total
            })
        });

        const order = await response.json();
        alert(`✅ Заказ #${order.id} успешно оформлен!\nСумма: ${order.total} ₽`);
        cart = [];
        saveCart();
        updateCartCount();
        navigateTo('/');
    } catch (error) {
        alert('❌ Ошибка оформления заказа');
        console.error(error);
    }
}

// ===================== АВТОРИЗАЦИЯ =====================
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        currentUser = JSON.parse(user);
        updateNavbar();
    } else {
        updateNavbar();
    }
}

function showAuthModal(type = 'login') {
    const modal = document.getElementById('authModal');
    const container = document.getElementById('authContainer');

    if (type === 'login') {
        container.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">🔐 Вход</h2>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="loginEmail" placeholder="example@mail.com">
            </div>
            <div class="form-group">
                <label>Пароль</label>
                <input type="password" id="loginPassword" placeholder="Ваш пароль">
            </div>
            <button class="btn btn-primary" onclick="login()" style="width: 100%; padding: 10px; margin-bottom: 1rem;">Войти</button>
            <p style="text-align: center; color: #666;">
                Нет аккаунта? <a href="javascript:showAuthModal('register')" style="color: #667eea; text-decoration: none; font-weight: bold;">Зарегистрироваться</a>
            </p>
            <div style="background: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem; font-size: 0.9rem;">
                <p><strong>📝 Тестовый аккаунт:</strong></p>
                <p>Email: user@digitstore.ru</p>
                <p>Пароль: user123</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">📝 Регистрация</h2>
            <div class="form-group">
                <label>Имя пользователя</label>
                <input type="text" id="regUsername" placeholder="Ваше имя">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="regEmail" placeholder="example@mail.com">
            </div>
            <div class="form-group">
                <label>Пароль</label>
                <input type="password" id="regPassword" placeholder="Минимум 6 символов">
            </div>
            <button class="btn btn-primary" onclick="register()" style="width: 100%; padding: 10px; margin-bottom: 1rem;">Зарегистрироваться</button>
            <p style="text-align: center; color: #666;">
                Уже есть аккаунт? <a href="javascript:showAuthModal('login')" style="color: #667eea; text-decoration: none; font-weight: bold;">Войти</a>
            </p>
        `;
    }

    modal.style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Заполните все поля');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Invalid credentials');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        updateNavbar();
        closeAuthModal();
        alert('✅ Добро пожаловать!');
    } catch (error) {
        alert('❌ Неверные данные');
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!username || !email || !password || password.length < 6) {
        alert('Заполните все поля корректно');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) throw new Error('Registration failed');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        updateNavbar();
        closeAuthModal();
        alert('✅ Регистрация успешна!');
    } catch (error) {
        alert('❌ Ошибка регистрации');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateNavbar();
    navigateTo('/');
    alert('Вы вышли из аккаунта');
}

function updateNavbar() {
    const navUser = document.getElementById('navUser');

    if (currentUser) {
        navUser.innerHTML = `
            <div class="user-menu" style="position: relative;">
                <img src="${currentUser.avatar}" alt="${currentUser.username}" class="user-avatar" onclick="toggleUserMenu()">
                <div class="dropdown-menu" id="userDropdown" style="display: none;">
                    <a href="#/profile">👤 Профиль</a>
                    ${currentUser.role === 'admin' ? '<a href="#/admin">⚙️ Администрация</a>' : ''}
                    <a href="javascript:logout()">🚪 Выход</a>
                </div>
            </div>
        `;
    } else {
        navUser.innerHTML = `
            <button class="btn btn-primary" onclick="showAuthModal('login')">🔐 Вход</button>
            <button class="btn btn-secondary" onclick="showAuthModal('register')">📝 Регистрация</button>
        `;
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Закрыть меню при клике вне его
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !e.target.closest('.user-menu')) {
        dropdown.style.display = 'none';
    }
});

// ===================== ПРОФИЛЬ =====================
async function showProfile() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <img src="${currentUser.avatar}" alt="${currentUser.username}" class="profile-avatar">
                <div class="profile-info">
                    <h2>${currentUser.username}</h2>
                    <p>Email: ${currentUser.email}</p>
                    <p>Роль: ${currentUser.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}</p>
                </div>
            </div>

            <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Мои заказы</h3>
            <div id="userOrders"></div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const orders = await response.json();

        const ordersContainer = document.getElementById('userOrders');
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p style="color: #666;">У вас еще нет заказов</p>';
        } else {
            ordersContainer.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Номер заказа</th>
                            <th>Дата</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr>
                                <td>#${o.id}</td>
                                <td>${new Date(o.createdAt).toLocaleDateString('ru-RU')}</td>
                                <td>${o.total} ₽</td>
                                <td><span style="background: #ffc107; padding: 4px 12px; border-radius: 4px; font-size: 0.9rem;">${o.status === 'pending' ? '⏳ В ожидании' : 'Завершен'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
    }
}

// ===================== АДМИН-ПАНЕЛЬ =====================
async function showAdmin() {
    const content = document.getElementById('content');
    content.innerHTML = '<div style="color: white;">Загрузка панели администратора...</div>';

    try {
        const statsResponse = await fetch(`${API_BASE}/stats`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const stats = await statsResponse.json();

        content.innerHTML = `
            <div class="admin-container">
                <div class="admin-header">
                    <h1>⚙️ Администрация</h1>
                    <button class="btn btn-primary" onclick="showAddProductModal()">+ Добавить товар</button>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Пользователей</h3>
                        <div class="stat-value">${stats.totalUsers}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Товаров</h3>
                        <div class="stat-value">${stats.totalProducts}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Заказов</h3>
                        <div class="stat-value">${stats.totalOrders}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Выручка</h3>
                        <div class="stat-value">${stats.totalRevenue} ₽</div>
                    </div>
                </div>

                <div style="background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">🔴 Срочные заказы</h3>
                    <div id="pendingOrders"></div>
                </div>

                <div>
                    <h3 style="margin-bottom: 1rem;">📦 Все товары</h3>
                    <div id="adminProducts"></div>
                </div>
            </div>
        `;

        // Загружаем ожидающие заказы
        const ordersResponse = await fetch(`${API_BASE}/orders/admin/all`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const orders = await ordersResponse.json();
        const pendingOrders = orders.filter(o => o.status === 'pending');

        const pendingContainer = document.getElementById('pendingOrders');
        if (pendingOrders.length === 0) {
            pendingContainer.innerHTML = '<p style="color: #666;">Нет ожидающих заказов</p>';
        } else {
            pendingContainer.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Пользователь</th>
                            <th>Сумма</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pendingOrders.slice(0, 5).map(o => `
                            <tr>
                                <td>#${o.id}</td>
                                <td>User #${o.userId}</td>
                                <td>${o.total} ₽</td>
                                <td>${new Date(o.createdAt).toLocaleDateString('ru-RU')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        // Загружаем товары
        const productsResponse = await fetch(`${API_BASE}/products`);
        const products = await productsResponse.json();
        allProducts = products;

        const productsContainer = document.getElementById('adminProducts');
        productsContainer.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Цена</th>
                        <th>Продано</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>${getCategoryName(p.category)}</td>
                            <td>${p.price} ₽</td>
                            <td>${p.reviews}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn-secondary" onclick="editProduct(${p.id})">✏️ Редактировать</button>
                                    <button class="btn btn-danger" onclick="deleteProduct(${p.id})">🗑️ Удалить</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Ошибка админ-панели:', error);
        content.innerHTML = '<div style="color: #ff6b6b;">Ошибка загрузки панели</div>';
    }
}

function showAddProductModal() {
    const modal = document.getElementById('productModal');
    const detail = document.getElementById('productDetail');

    detail.innerHTML = `
        <h2>➕ Добавить товар</h2>
        <div class="form-group">
            <label>Название</label>
            <input type="text" id="productName" placeholder="Название товара">
        </div>
        <div class="form-group">
            <label>Категория</label>
            <select id="productCategory">
                <option value="games">🎮 Игры</option>
                <option value="dlc">💎 DLC</option>
                <option value="accounts">👤 Аккаунты</option>
            </select>
        </div>
        <div class="form-group">
            <label>Цена (₽)</label>
            <input type="number" id="productPrice" placeholder="1000">
        </div>
        <div class="form-group">
            <label>Описание</label>
            <textarea id="productDescription" placeholder="Описание товара" rows="4"></textarea>
        </div>
        <div class="form-group">
            <label>Разработчик</label>
            <input type="text" id="productDeveloper" placeholder="Название студии">
        </div>
        <div class="form-group">
            <label>URL изображения</label>
            <input type="text" id="productImage" placeholder="https://example.com/image.jpg">
        </div>
        <button class="btn btn-success" onclick="saveProduct()" style="width: 100%; padding: 10px; margin-bottom: 1rem;">✅ Сохранить</button>
    `;
    modal.style.display = 'block';
}

async function saveProduct() {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const developer = document.getElementById('productDeveloper').value;
    const image = document.getElementById('productImage').value;

    if (!name || !price) {
        alert('Заполните обязательные поля');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name,
                category,
                price,
                description,
                developer,
                image: image || 'https://via.placeholder.com/500x300'
            })
        });

        if (!response.ok) throw new Error('Failed to save');

        alert('✅ Товар добавлен!');
        closeProductModal();
        showAdmin();
    } catch (error) {
        alert('❌ Ошибка сохранения товара');
        console.error(error);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Удалить товар?')) return;

    try {
        await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        alert('✅ Товар удален');
        showAdmin();
    } catch (error) {
        alert('❌ Ошибка удаления');
    }
}

function editProduct(productId) {
    alert('📝 Функция редактирования в разработке');
}
