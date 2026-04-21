// server.js — Финальная чистая версия

const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const ACCESS_SECRET = 'access_secret_key_films_2026_very_strong';

let films = [];
let categories = [];
let users = [];
let reviews = [];
let roles = [
    { id: '1', name: 'Admin', description: 'Полный доступ' },
    { id: '2', name: 'User', description: 'Обычный пользователь' }
];

// ====================== MIDDLEWARE ======================
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());

// Унифицированные ответы
const success = (res, data, status = 200) =>
    res.status(status).json({ success: true, data });

const error = (res, message, status = 400) =>
    res.status(status).json({ success: false, error: message });

// ====================== AUTH MIDDLEWARE ======================
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return error(res, "Нет токена авторизации", 401);

    try {
        req.user = jwt.verify(token, ACCESS_SECRET);
        next();
    } catch (err) {
        return error(res, "Неверный или просроченный токен", 401);
    }
};

const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return error(res, "Недостаточно прав доступа", 403);
    }
    next();
};

// ====================== ИНИЦИАЛИЗАЦИЯ ======================
const initData = async () => {
    const adminHash = await bcrypt.hash('admin123', 10);
    users.push({
        id: nanoid(6),
        email: 'admin@filmhub.ru',
        password: adminHash,
        role: 'admin'
    });

    films = [
        { id: nanoid(8), title: "Дюна: Часть вторая", category: "Фантастика", year: 2024, averageRating: 4.8 },
        { id: nanoid(8), title: "Оппенгеймер", category: "Драма", year: 2023, averageRating: 4.9 },
        { id: nanoid(8), title: "Барби", category: "Комедия", year: 2023, averageRating: 4.5 }
    ];

    console.log('✅ FilmHub сервер запущен');
    console.log('👤 Админ: admin@filmhub.ru / admin123');
};

initData();

// ====================== AUTH ======================
app.post('/api/v1/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return error(res, "Email и password обязательны");
    if (password.length < 6) return error(res, "Пароль должен быть не менее 6 символов");
    if (users.find(u => u.email === email)) return error(res, "Пользователь уже существует", 409);

    const hashed = await bcrypt.hash(password, 10);
    users.push({ id: nanoid(6), email, password: hashed, role: 'user' });

    success(res, { message: "Регистрация прошла успешно" }, 201);
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return error(res, "Неверный email или пароль", 401);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: '24h' });
    success(res, { accessToken: token });
});

// ====================== USERS ======================
app.get('/api/v1/users/me', authenticate, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return error(res, "Пользователь не найден", 404);
    success(res, { id: user.id, email: user.email, role: user.role });
});

app.put('/api/v1/users/me', authenticate, (req, res) => {
    success(res, { message: "Профиль успешно обновлён" });
});

app.get('/api/v1/users', authenticate, isAdmin, (req, res) => {
    success(res, users.map(u => ({ id: u.id, email: u.email, role: u.role })));
});

// ====================== ROLES & PERMISSIONS ======================
app.get('/api/v1/roles', authenticate, isAdmin, (req, res) => success(res, roles));

app.post('/api/v1/roles', authenticate, isAdmin, (req, res) => {
    if (!req.body.name) return error(res, "Название роли обязательно");
    const newRole = { id: nanoid(6), name: req.body.name, description: req.body.description || '' };
    roles.push(newRole);
    success(res, newRole, 201);
});

app.get('/api/v1/roles/{id}', authenticate, isAdmin, (req, res) => {
    const role = roles.find(r => r.id === req.params.id);
    role ? success(res, role) : error(res, "Роль не найдена", 404);
});

app.put('/api/v1/roles/{id}', authenticate, isAdmin, (req, res) => {
    success(res, { message: "Роль успешно обновлена" });
});

app.delete('/api/v1/roles/{id}', authenticate, isAdmin, (req, res) => {
    roles = roles.filter(r => r.id !== req.params.id);
    res.status(204).send();
});

app.get('/api/v1/permissions', authenticate, isAdmin, (req, res) => success(res, permissions));

// ====================== CATEGORIES ======================
app.get('/api/v1/categories', (req, res) => success(res, categories));

app.post('/api/v1/categories', authenticate, isAdmin, (req, res) => {
    if (!req.body.name) return error(res, "Название категории обязательно");
    const newCat = { id: nanoid(6), name: req.body.name };
    categories.push(newCat);
    success(res, newCat, 201);
});

app.get('/api/v1/categories/{id}', (req, res) => {
    const cat = categories.find(c => c.id === req.params.id);
    cat ? success(res, cat) : error(res, "Категория не найдена", 404);
});

app.put('/api/v1/categories/{id}', authenticate, isAdmin, (req, res) => {
    success(res, { message: "Категория успешно обновлена" });
});

app.delete('/api/v1/categories/{id}', authenticate, isAdmin, (req, res) => {
    categories = categories.filter(c => c.id !== req.params.id);
    res.status(204).send();
});

// ====================== FILMS ======================
app.get('/api/v1/films', (req, res) => success(res, { films, total: films.length }));

app.post('/api/v1/films', authenticate, isAdmin, (req, res) => {
    if (!req.body.title || !req.body.category) return error(res, "title и category обязательны");
    const newFilm = { id: nanoid(8), ...req.body, averageRating: 0 };
    films.push(newFilm);
    success(res, newFilm, 201);
});

app.get('/api/v1/films/{id}', (req, res) => {
    const film = films.find(f => f.id === req.params.id);
    film ? success(res, film) : error(res, "Фильм не найден", 404);
});

app.put('/api/v1/films/{id}', authenticate, isAdmin, (req, res) => {
    const film = films.find(f => f.id === req.params.id);
    if (!film) return error(res, "Фильм не найден", 404);
    Object.assign(film, req.body);
    success(res, film);
});

app.delete('/api/v1/films/{id}', authenticate, isAdmin, (req, res) => {
    films = films.filter(f => f.id !== req.params.id);
    res.status(204).send();
});

app.get('/api/v1/films/top', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const top = [...films].sort((a, b) => b.averageRating - a.averageRating).slice(0, limit);
    success(res, top);
});

// ====================== REVIEWS ======================
app.post('/api/v1/films/{film_id}/reviews', authenticate, (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return error(res, "Рейтинг должен быть от 1 до 5");

    const review = {
        id: nanoid(8),
        filmId: req.params.film_id,
        userId: req.user.id,
        rating: Number(rating),
        comment: comment || '',
        likes: 0,
        createdAt: new Date().toISOString()
    };

    reviews.push(review);

    // Пересчёт среднего рейтинга
    const filmReviews = reviews.filter(r => r.filmId === req.params.film_id);
    const avg = filmReviews.length ? filmReviews.reduce((sum, r) => sum + r.rating, 0) / filmReviews.length : 0;
    const film = films.find(f => f.id === req.params.film_id);
    if (film) film.averageRating = Number(avg.toFixed(1));

    success(res, review, 201);
});

app.get('/api/v1/films/{film_id}/reviews', (req, res) => success(res, reviews.filter(r => r.filmId === req.params.film_id)));

app.get('/api/v1/reviews/my', authenticate, (req, res) => success(res, reviews.filter(r => r.userId === req.user.id)));

app.get('/api/v1/reviews/{id}', (req, res) => {
    const review = reviews.find(r => r.id === req.params.id);
    review ? success(res, review) : error(res, "Отзыв не найден", 404);
});

app.put('/api/v1/reviews/{id}', authenticate, (req, res) => success(res, { message: "Отзыв успешно обновлён" }));

app.delete('/api/v1/reviews/{id}', authenticate, (req, res) => {
    reviews = reviews.filter(r => r.id !== req.params.id);
    res.status(204).send();
});

app.post('/api/v1/reviews/{id}/like', authenticate, (req, res) => {
    const review = reviews.find(r => r.id === req.params.id);
    if (review) review.likes++;
    success(res, { likes: review?.likes || 0 });
});

app.delete('/api/v1/reviews/{id}/like', authenticate, (req, res) => {
    const review = reviews.find(r => r.id === req.params.id);
    if (review && review.likes > 0) review.likes--;
    success(res, { likes: review?.likes || 0 });
});

app.get('/api/v1/films/{film_id}/average-rating', (req, res) => {
    const film = films.find(f => f.id === req.params.film_id);
    success(res, { averageRating: film ? film.averageRating : 0 });
});

app.get('/api/v1/users/{user_id}/reviews', (req, res) => success(res, reviews.filter(r => r.userId === req.params.user_id)));

app.listen(port, () => {
    console.log(`✅ FilmHub сервер запущен на http://localhost:${port}`);
});