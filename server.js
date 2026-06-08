const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_secret_key_change_this';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory database
let users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@digitstore.ru',
        password: bcryptjs.hashSync('admin123', 10),
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?img=1',
        createdAt: new Date()
    },
    {
        id: 2,
        username: 'user',
        email: 'user@digitstore.ru',
        password: bcryptjs.hashSync('user123', 10),
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=2',
        createdAt: new Date()
    }
];

let products = [
    {
        id: 1,
        name: 'GTA V',
        category: 'games',
        price: 1299,
        description: 'Легендарная игра от Rockstar Games. Огромный открытый мир, множество миссий и развлечений.',
        image: 'https://images.unsplash.com/photo-1538481143235-5d630ad36a9e?w=500&h=300&fit=crop',
        rating: 4.8,
        reviews: 1250,
        developer: 'Rockstar Games',
        releaseDate: '2013-09-17',
        platform: ['PC', 'PS4', 'Xbox One'],
        stock: 100
    },
    {
        id: 2,
        name: 'Red Dead Redemption 2',
        category: 'games',
        price: 999,
        description: 'Эпическое приключение на Диком Западе. Шедевр от Rockstar с невероятной графикой.',
        image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop',
        rating: 4.9,
        reviews: 980,
        developer: 'Rockstar Games',
        releaseDate: '2018-10-26',
        platform: ['PC', 'PS4', 'Xbox One'],
        stock: 75
    },
    {
        id: 3,
        name: 'Cyberpunk 2077',
        category: 'games',
        price: 799,
        description: 'Футуристическая RPG от CD Projekt Red. Окунитесь в мир ночного города.',
        image: 'https://images.unsplash.com/photo-1538481143235-5d630ad36a9e?w=500&h=300&fit=crop',
        rating: 4.5,
        reviews: 756,
        developer: 'CD Projekt Red',
        releaseDate: '2020-12-10',
        platform: ['PC', 'PS4', 'Xbox One'],
        stock: 50
    },
    {
        id: 4,
        name: 'Elden Ring',
        category: 'games',
        price: 1499,
        description: 'Challenging action RPG от FromSoftware. Игра в стиле Dark Souls с открытым миром.',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=300&fit=crop',
        rating: 4.7,
        reviews: 892,
        developer: 'FromSoftware',
        releaseDate: '2022-02-25',
        platform: ['PC', 'PS4', 'Xbox One'],
        stock: 60
    },
    {
        id: 5,
        name: 'The Witcher 3',
        category: 'games',
        price: 599,
        description: 'RPG шедевр от CD Projekt Red. Играйте за Геральта в огромном открытом мире.',
        image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop',
        rating: 4.8,
        reviews: 1150,
        developer: 'CD Projekt Red',
        releaseDate: '2015-05-19',
        platform: ['PC', 'PS4', 'Xbox One'],
        stock: 40
    },
    {
        id: 6,
        name: 'Fortnite Battle Pass',
        category: 'dlc',
        price: 599,
        description: 'Seasonal battle pass для Fortnite. Получите эксклюзивные скины и предметы.',
        image: 'https://images.unsplash.com/photo-1552865881-20461ba0f187?w=500&h=300&fit=crop',
        rating: 4.3,
        reviews: 2100,
        developer: 'Epic Games',
        releaseDate: '2018-02-22',
        platform: ['PC', 'PS4', 'Xbox One', 'Mobile'],
        stock: 999
    },
    {
        id: 7,
        name: 'Steam Gift Card 500₽',
        category: 'accounts',
        price: 500,
        description: 'Подарочная карта Steam. Используйте для покупки игр на платформе Steam.',
        image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop',
        rating: 5.0,
        reviews: 450,
        developer: 'Valve',
        releaseDate: '2003-09-12',
        platform: ['PC'],
        stock: 500
    },
    {
        id: 8,
        name: 'PlayStation Plus 1 месяц',
        category: 'accounts',
        price: 399,
        description: 'Месячная подписка PlayStation Plus. Бесплатные игры и онлайн-игры.',
        image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop',
        rating: 4.6,
        reviews: 680,
        developer: 'Sony',
        releaseDate: '2010-06-23',
        platform: ['PS4', 'PS5'],
        stock: 1000
    }
];

let orders = [];
let nextUserId = 3;
let nextOrderId = 1;

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Middleware для проверки админа
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// =============== АВТОРИЗАЦИЯ ===============

// Регистрация
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already taken' });
    }

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    const user = {
        id: nextUserId++,
        username,
        email,
        password: bcryptjs.hashSync(password, 10),
        role: 'user',
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 100)}`,
        createdAt: new Date()
    };

    users.push(user);

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
    });
});

// Вход
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.find(u => u.email === email);

    if (!user || !bcryptjs.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
    });
});

// =============== ТОВАРЫ ===============

// Получить все товары
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Получить товар по ID
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

// Создать товар (админ)
app.post('/api/products', authenticateToken, checkAdmin, (req, res) => {
    const { name, category, price, description, image, developer, releaseDate, platform } = req.body;

    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    const product = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name,
        category,
        price,
        description: description || '',
        image: image || 'https://via.placeholder.com/500x300',
        rating: 4.5,
        reviews: 0,
        developer: developer || '',
        releaseDate: releaseDate || new Date().toISOString().split('T')[0],
        platform: platform || ['PC'],
        stock: 100
    };

    products.push(product);
    res.status(201).json(product);
});

// Обновить товар (админ)
app.put('/api/products/:id', authenticateToken, checkAdmin, (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });

    Object.assign(product, req.body);
    res.json(product);
});

// Удалить товар (админ)
app.delete('/api/products/:id', authenticateToken, checkAdmin, (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    const product = products.splice(index, 1);
    res.json(product);
});

// =============== ЗАКАЗЫ ===============

// Получить мои заказы
app.get('/api/orders', authenticateToken, (req, res) => {
    const userOrders = orders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
});

// Получить все заказы (админ)
app.get('/api/orders/admin/all', authenticateToken, checkAdmin, (req, res) => {
    res.json(orders);
});

// Создать заказ
app.post('/api/orders', authenticateToken, (req, res) => {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    const order = {
        id: nextOrderId++,
        userId: req.user.id,
        items,
        total,
        status: 'pending',
        createdAt: new Date()
    };

    orders.push(order);
    res.status(201).json(order);
});

// =============== ПОЛЬЗОВАТЕЛИ ===============

// Получить профиль
app.get('/api/users/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// Обновить профиль
app.put('/api/users/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.avatar) user.avatar = req.body.avatar;

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// Получить всех пользователей (админ)
app.get('/api/users', authenticateToken, checkAdmin, (req, res) => {
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
});

// =============== СТАТИСТИКА ===============

// Получить статистику (админ)
app.get('/api/stats', authenticateToken, checkAdmin, (req, res) => {
    const stats = {
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length
    };
    res.json(stats);
});

// Serve index.html для всех несоответствующих маршрутов
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 DigitStore запущен на http://localhost:${PORT}`);
    console.log(`📊 Админ: admin@digitstore.ru / admin123`);
    console.log(`👤 Пользователь: user@digitstore.ru / user123\n`);
});
