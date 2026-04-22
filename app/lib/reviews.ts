// app/lib/reviews.ts
export interface UserReview {
  id: number;
  movieId: number;
  movieTitle: string;
  year: number;
  rating: number;
  text: string;
  image: string;
  author: string;
  date: string;
  likes: number;
}

const STORAGE_KEY = 'user_reviews';
const LIKES_KEY = 'review_likes';
const CURRENT_USER = 'User Userovich';

export function getAllReviews(): UserReview[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveReview(review: Omit<UserReview, 'id'>): UserReview {
  const reviews = getAllReviews();
  const newId = Date.now();
  const newReview: UserReview = { ...review, id: newId, likes: 0 };
  reviews.push(newReview);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  return newReview;
}

export function updateReview(id: number, updatedReview: Partial<UserReview>): void {
  const reviews = getAllReviews();
  const index = reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    reviews[index] = { ...reviews[index], ...updatedReview };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }
}

export function deleteReview(id: number): void {
  const reviews = getAllReviews();
  const filtered = reviews.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  const likesStore = JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
  if (likesStore[`user_${id}`]) {
    delete likesStore[`user_${id}`];
    localStorage.setItem(LIKES_KEY, JSON.stringify(likesStore));
  }
}

export function getReviewsForMovie(movieId: number): UserReview[] {
  const all = getAllReviews();
  return all.filter(r => r.movieId === movieId);
}

export function getUserReviews(author: string): UserReview[] {
  const all = getAllReviews();
  return all.filter(r => r.author === author);
}

// Новая функция: проверка, писал ли пользователь рецензию на фильм
export function hasUserReviewedMovie(movieId: number, excludeReviewId?: number): boolean {
  const reviews = getAllReviews();
  return reviews.some(r => r.movieId === movieId && r.author === CURRENT_USER && (excludeReviewId === undefined || r.id !== excludeReviewId));
}

// ---- Лайки (без изменений) ----
interface LikesStore {
  [reviewId: string]: {
    [userId: string]: boolean;
  };
}

function getLikesStore(): LikesStore {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(LIKES_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function saveLikesStore(store: LikesStore) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LIKES_KEY, JSON.stringify(store));
}

export function getTotalLikes(reviewId: string, baseLikes: number): number {
  const store = getLikesStore();
  const userLikesCount = store[reviewId] ? Object.keys(store[reviewId]).length : 0;
  return baseLikes + userLikesCount;
}

export function hasUserLiked(reviewId: string): boolean {
  const store = getLikesStore();
  return !!(store[reviewId] && store[reviewId][CURRENT_USER]);
}

export function likeReview(reviewId: string): void {
  const store = getLikesStore();
  if (!store[reviewId]) store[reviewId] = {};
  if (!store[reviewId][CURRENT_USER]) {
    store[reviewId][CURRENT_USER] = true;
    saveLikesStore(store);
  }
}

export function unlikeReview(reviewId: string): void {
  const store = getLikesStore();
  if (store[reviewId] && store[reviewId][CURRENT_USER]) {
    delete store[reviewId][CURRENT_USER];
    saveLikesStore(store);
  }
}