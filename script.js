// Товары в каталоге
const products = [
    {
        id: 1,
        name: 'GTA V',
        category: 'games',
        price: 1299,
        description: 'Легендарная игра от Rockstar Games',
        emoji: '🎮'
    },
    {
        id: 2,
        name: 'Red Dead Redemption 2',
        category: 'games',
        price: 999,
        description: 'Эпическое приключение на Диком Западе',
        emoji: '🤠'
    },
    {
        id: 3,
        name: 'Cyberpunk 2077',
        category: 'games',
        price: 799,
        description: 'Футуристическая RPG от CD Projekt Red',
        emoji: '🤖'
    },
    {
        id: 4,
        name: 'Elden Ring',
        category: 'games',
        price: 1499,
        description: 'Challenging action RPG от FromSoftware',
        emoji: '⚔️'
    },
    {
        id: 5,
        name: 'GTA Online Premium Edition',
        category: 'dlc',
        price: 499,
        description: 'Премиум издание GTA Online',
        emoji: '💎'
    },
    {
        id: 6,
        name: 'Fortnite Battle Pass',
        category: 'dlc',
        price: 599,
        description: 'Seasonal battle pass для Fortnite',
        emoji: '🎯'
    },
    {
        id: 7,
        name: 'Steam Gift Card 500₽',
        category: 'accounts',
        price: 500,
        description: 'Подарочная карта Steam',
        emoji: '🎁'
    },
    {
        id: 8,
        name: 'PlayStation Plus 1 month',
        category: 'accounts',
        price: 399,
        description: 'Месячная подписка PlayStation Plus',
        emoji: '🎮'
    }
];

// Корзина
let cart = [];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupEventListeners();
    loadCartFromStorage();
});

// Установка слушателей событий
function setupEventListeners() {
    document.getElementById('cartIcon').addEventListener('click', openCart);
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('priceFilter').addEventListener('change', filterProducts);
}

// Отрисовка товаров
function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    
    if (productsToRender.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Товары не найдены</p>';
        return;
    }
    
    grid.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            <div class="product-image">${product.emoji}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-category">${getCategoryName(product.category)}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-footer">
                <span class="product-price">${product.price} ₽</span>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">В корзину</button>
            </div>
        </div>
    `).join('');
}

// Получить название категории
function getCategoryName(category) {
    const categories = {
        'games': '🎮 Игры',
        'dlc': '💎 DLC',
        'accounts': '👤 Аккаунты'
    };
    return categories[category] || category;
}

// Фильтрация товаров
function filterProducts() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const categoryValue = document.getElementById('categoryFilter').value;
    const priceValue = document.getElementById('priceFilter').value;
    
    let filtered = products.filter(product => {
        // Поиск по названию и описанию
        const matchesSearch = product.name.toLowerCase().includes(searchValue) || 
                            product.description.toLowerCase().includes(searchValue);
        
        // Фильтр по категории
        const matchesCategory = !categoryValue || product.category === categoryValue;
        
        // Фильтр по цене
        let matchesPrice = true;
        if (priceValue) {
            if (priceValue === '0-500') matchesPrice = product.price <= 500;
            else if (priceValue === '500-1000') matchesPrice = product.price > 500 && product.price <= 1000;
            else if (priceValue === '1000+') matchesPrice = product.price > 1000;
        }
        
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    renderProducts(filtered);
}

// Добавить в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.name} добавлен в корзину!`);
}

// Удалить из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Обновить корзину
function updateCart() {
    saveCartToStorage();
    updateCartCount();
    renderCartItems();
}

// Обновить количество товаров в корзине
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Отрисовать товары в корзине
function renderCartItems() {
    const cartItemsDiv = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center; color: #666;">Корзина пуста</p>';
        document.getElementById('totalPrice').textContent = '0';
        return;
    }
    
    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name} x${item.quantity}</div>
                <div class="cart-item-price">${item.price * item.quantity} ₽</div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Удалить</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('totalPrice').textContent = total;
}

// Открыть корзину
function openCart() {
    document.getElementById('cartModal').style.display = 'block';
    renderCartItems();
}

// Закрыть корзину
function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

// Оформить покупку
function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Спасибо за покупку! Сумма: ${total} ₽\n\nВы будете перенаправлены на страницу оплаты.`);
    
    // Очистить корзину после оформления
    cart = [];
    updateCart();
    closeCart();
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        animation: slideUp 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Закрыть модальное окно при клике вне его
window.addEventListener('click', (event) => {
    const modal = document.getElementById('cartModal');
    if (event.target === modal) {
        closeCart();
    }
});

// Сохрани��ь корзину в LocalStorage
function saveCartToStorage() {
    localStorage.setItem('digitstore_cart', JSON.stringify(cart));
}

// Загрузить корзину из LocalStorage
function loadCartFromStorage() {
    const saved = localStorage.getItem('digitstore_cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartCount();
    }
}