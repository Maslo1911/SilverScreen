
const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = 3000;

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!ACCESS_SECRET || !REFRESH_SECRET || !supabaseUrl || !supabaseKey) {
    console.error('❌ Ошибка: Проверь .env файл!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('🔥 Подключено к Supabase — полная ER-диаграмма');

// ====================== MIDDLEWARE ======================
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const success = (res, data, status = 200) => res.status(status).json({ success: true, data });
const error = (res, message, status = 400) => res.status(status).json({ success: false, error: message });

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
    if (req.user?.role !== 'admin') return error(res, "Недостаточно прав доступа", 403);
    next();
};

// ====================== AUTH ======================
app.post('/api/v1/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return error(res, "Email и password обязательны");
    if (password.length < 6) return error(res, "Пароль должен быть не менее 6 символов");

    const { data: existing } = await supabase.from('user').select('id').eq('email', email).single();
    if (existing) return error(res, "Пользователь уже существует", 409);

    const hashed = await bcrypt.hash(password, 10);
    const { error: e } = await supabase.from('user').insert([{ id: nanoid(6), email, password: hashed, role_id: '2' }]);
    if (e) return error(res, e.message, 500);
    success(res, { message: "Регистрация прошла успешно" }, 201);
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { data: user, error: e } = await supabase.from('user').select('id, email, password, role_id').eq('email', email).single();
    if (e || !user || !(await bcrypt.compare(password, user.password))) return error(res, "Неверный email или пароль", 401);

    const role = user.role_id === '1' ? 'admin' : 'user';
    const accessToken = jwt.sign({ id: user.id, role }, ACCESS_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7*24*60*60*1000 });
    success(res, { accessToken });
});

app.post('/api/v1/auth/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return error(res, "Нет refresh токена", 401);
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const accessToken = jwt.sign({ id: payload.id, role: 'user' }, ACCESS_SECRET, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: payload.id }, REFRESH_SECRET, { expiresIn: '7d' });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7*24*60*60*1000 });
        success(res, { accessToken });
    } catch (err) {
        return error(res, "Неверный или просроченный refresh токен", 401);
    }
});

app.post('/api/v1/auth/logout', (req, res) => {
    res.clearCookie('refreshToken');
    success(res, { message: "Вы вышли из системы" });
});

// ====================== USERS ======================
app.get('/api/v1/users/me', authenticate, async (req, res) => {
    const { data: user } = await supabase.from('user').select('id, email, role_id').eq('id', req.user.id).single();
    if (!user) return error(res, "Пользователь не найден", 404);
    success(res, { id: user.id, email: user.email, role: user.role_id === '1' ? 'admin' : 'user' });
});

app.put('/api/v1/users/me', authenticate, (req, res) => success(res, { message: "Профиль успешно обновлён" }));

app.get('/api/v1/users', authenticate, isAdmin, async (req, res) => {
    const { data } = await supabase.from('user').select('id, email, role_id');
    success(res, data);
});

// ====================== ROLES ======================
app.get('/api/v1/roles', authenticate, isAdmin, async (req, res) => {
    const { data } = await supabase.from('role').select('*');
    success(res, data);
});

app.post('/api/v1/roles', authenticate, isAdmin, async (req, res) => {
    if (!req.body.name) return error(res, "Название роли обязательно");
    const { data, error: e } = await supabase.from('role').insert([{ id: nanoid(6), name: req.body.name, description: req.body.description || '' }]).select().single();
    if (e) return error(res, e.message, 500);
    success(res, data, 201);
});

app.get('/api/v1/roles/:id', authenticate, isAdmin, async (req, res) => {
    const { data } = await supabase.from('role').select('*').eq('id', req.params.id).single();
    data ? success(res, data) : error(res, "Роль не найдена", 404);
});

app.put('/api/v1/roles/:id', authenticate, isAdmin, async (req, res) => {
    const { data, error: e } = await supabase.from('role').update(req.body).eq('id', req.params.id).select().single();
    if (e) return error(res, e.message, 500);
    success(res, data);
});

app.delete('/api/v1/roles/:id', authenticate, isAdmin, async (req, res) => {
    const { error: e } = await supabase.from('role').delete().eq('id', req.params.id);
    if (e) return error(res, e.message, 500);
    res.status(204).send();
});

// ====================== PERMISSIONS ======================
app.get('/api/v1/permissions', authenticate, isAdmin, async (req, res) => {
    const { data } = await supabase.from('permissions').select('*');
    success(res, data);
});

// ====================== CATEGORIES ======================
app.get('/api/v1/categories', async (req, res) => {
    const { data } = await supabase.from('category').select('*');
    success(res, data);
});

app.post('/api/v1/categories', authenticate, isAdmin, async (req, res) => {
    if (!req.body.name) return error(res, "Название категории обязательно");
    const { data, error: e } = await supabase.from('category').insert([{ id: nanoid(6), name: req.body.name }]).select().single();
    if (e) return error(res, e.message, 500);
    success(res, data, 201);
});

app.get('/api/v1/categories/:id', async (req, res) => {
    const { data } = await supabase.from('category').select('*').eq('id', req.params.id).single();
    data ? success(res, data) : error(res, "Категория не найдена", 404);
});

app.put('/api/v1/categories/:id', authenticate, isAdmin, async (req, res) => {
    const { data, error: e } = await supabase.from('category').update(req.body).eq('id', req.params.id).select().single();
    if (e) return error(res, e.message, 500);
    success(res, data);
});

app.delete('/api/v1/categories/:id', authenticate, isAdmin, async (req, res) => {
    const { error: e } = await supabase.from('category').delete().eq('id', req.params.id);
    if (e) return error(res, e.message, 500);
    res.status(204).send();
});

// ====================== FILMS ======================
app.get('/api/v1/films', async (req, res) => {
    const { data } = await supabase.from('film').select('*, film_category(category(*)), film_actor(actor(*))');
    success(res, { films: data, total: data.length });
});

app.post('/api/v1/films', authenticate, isAdmin, async (req, res) => {
    const { data, error: e } = await supabase.from('film').insert([req.body]).select().single();
    if (e) return error(res, e.message, 500);
    success(res, data, 201);
});

app.get('/api/v1/films/:id', async (req, res) => {
    const { data } = await supabase.from('film').select('*, film_category(category(*)), film_actor(actor(*))').eq('id', req.params.id).single();
    data ? success(res, data) : error(res, "Фильм не найден", 404);
});

app.put('/api/v1/films/:id', authenticate, isAdmin, async (req, res) => {
    const { data, error: e } = await supabase.from('film').update(req.body).eq('id', req.params.id).select().single();
    if (e) return error(res, e.message, 500);
    success(res, data);
});

app.delete('/api/v1/films/:id', authenticate, isAdmin, async (req, res) => {
    const { error: e } = await supabase.from('film').delete().eq('id', req.params.id);
    if (e) return error(res, e.message, 500);
    res.status(204).send();
});

app.get('/api/v1/films/top', async (req, res) => {
    const { data } = await supabase.from('film').select('*, film_category(category(*)), film_actor(actor(*))').order('rating', { ascending: false }).limit(parseInt(req.query.limit) || 10);
    success(res, data);
});

// ====================== REVIEWS ======================
app.post('/api/v1/films/:film_id/reviews', authenticate, async (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return error(res, "Рейтинг должен быть от 1 до 5");

    const { data, error: e } = await supabase.from('review').insert([{
        id: nanoid(8),
        film_id: req.params.film_id,
        user_id: req.user.id,
        rating: Number(rating),
        comment: comment || '',
        likes: 0,
        created_at: new Date().toISOString()
    }]).select().single();
    if (e) return error(res, e.message, 500);
    success(res, data, 201);
});

app.get('/api/v1/films/:film_id/reviews', async (req, res) => {
    const { data } = await supabase.from('review').select('*').eq('film_id', req.params.film_id);
    success(res, data);
});

app.get('/api/v1/reviews/my', authenticate, async (req, res) => {
    const { data } = await supabase.from('review').select('*').eq('user_id', req.user.id);
    success(res, data);
});

app.get('/api/v1/reviews/:id', async (req, res) => {
    const { data } = await supabase.from('review').select('*').eq('id', req.params.id).single();
    data ? success(res, data) : error(res, "Отзыв не найден", 404);
});

app.put('/api/v1/reviews/:id', authenticate, (req, res) => success(res, { message: "Отзыв успешно обновлён" }));

app.delete('/api/v1/reviews/:id', authenticate, async (req, res) => {
    const { error: e } = await supabase.from('review').delete().eq('id', req.params.id);
    if (e) return error(res, e.message, 500);
    res.status(204).send();
});

app.post('/api/v1/reviews/:id/like', authenticate, async (req, res) => {
    const { data: review } = await supabase.from('review').select('likes').eq('id', req.params.id).single();
    if (review) await supabase.from('review').update({ likes: (review.likes || 0) + 1 }).eq('id', req.params.id);
    success(res, { likes: (review?.likes || 0) + 1 });
});

app.delete('/api/v1/reviews/:id/like', authenticate, async (req, res) => {
    const { data: review } = await supabase.from('review').select('likes').eq('id', req.params.id).single();
    if (review && review.likes > 0) await supabase.from('review').update({ likes: review.likes - 1 }).eq('id', req.params.id);
    success(res, { likes: (review?.likes || 0) - 1 || 0 });
});

app.get('/api/v1/films/:film_id/average-rating', async (req, res) => {
    const { data } = await supabase.from('review').select('rating').eq('film_id', req.params.film_id);
    const avg = data.length ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0;
    success(res, { averageRating: Number(avg.toFixed(1)) });
});

app.get('/api/v1/users/:user_id/reviews', async (req, res) => {
    const { data } = await supabase.from('review').select('*').eq('user_id', req.params.user_id);
    success(res, data);
});

// ====================== JUNCTION ======================
app.post('/api/v1/films/:film_id/categories', authenticate, isAdmin, async (req, res) => {
    const { category_id } = req.body;
    if (!category_id) return error(res, "category_id обязателен");
    const { error: e } = await supabase.from('film_category').insert([{ film_id: req.params.film_id, category_id }]);
    if (e) return error(res, e.message, 500);
    success(res, { message: "Категория добавлена к фильму" });
});

app.post('/api/v1/films/:film_id/actors', authenticate, isAdmin, async (req, res) => {
    const { actor_id, character, ordering } = req.body;
    if (!actor_id) return error(res, "actor_id обязателен");
    const { error: e } = await supabase.from('film_actor').insert([{ film_id: req.params.film_id, actor_id, character, ordering: ordering || 0 }]);
    if (e) return error(res, e.message, 500);
    success(res, { message: "Актёр добавлен к фильму" });
});

// ====================== ЗАПУСК ======================
app.listen(port, () => {
    console.log(`✅ FilmHub сервер запущен на http://localhost:${port}`);
    console.log('👤 Админ: admin@filmhub.ru / admin123');
});