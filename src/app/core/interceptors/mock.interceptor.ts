/**
 * Mock HTTP interceptor — provides an in-memory backend for the demo.
 *
 * Must be registered LAST in the interceptor chain so that
 * errorInterceptor and loadingInterceptor still function correctly.
 *
 * Supported routes:
 *   GET|POST        /api/products
 *   GET|PUT|DELETE   /api/products/:id
 *   GET|POST        /api/users
 *   GET|PUT|DELETE   /api/users/:id
 *   GET             /api/categories
 *   GET             /api/error-test   ← always returns 500 (toast demo)
 */
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of, timer, switchMap, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import type { HttpEvent } from '@angular/common/http';

// ── Configuration ────────────────────────────────────────────────────
const MOCK_DELAY_MS = 600;

// ── Helpers ──────────────────────────────────────────────────────────
function respond<T>(body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse<T>({ status, body })).pipe(delay(MOCK_DELAY_MS));
}

function respondError(
  status: number,
  statusText: string,
): Observable<HttpEvent<never>> {
  return timer(MOCK_DELAY_MS).pipe(
    switchMap(() =>
      throwError(
        () => new HttpErrorResponse({ status, statusText, url: '' }),
      ),
    ),
  );
}

/** RxJS-compatible delay using timer + switchMap (works with of()) */
function delay<T>(ms: number) {
  return (source: Observable<T>): Observable<T> =>
    timer(ms).pipe(switchMap(() => source));
}

// ── Seed data — Products ─────────────────────────────────────────────
interface MockProduct {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
  contactEmail: string;
  isActive: boolean;
  discount: number;
  promoCode: string;
  category: string;
}

let productNextId = 7;
const mockProducts: MockProduct[] = [
  {
    id: 1,
    name: 'Wireless Headphones Pro',
    description:
      'Premium over-ear wireless headphones with active noise cancellation and 30-hour battery life',
    sku: 'ELC-00001',
    price: 149.99,
    quantity: 250,
    contactEmail: 'audio@techstore.com',
    isActive: true,
    discount: 20,
    promoCode: 'AUDIO20',
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Organic Cotton T-Shirt',
    description:
      'Comfortable organic cotton crew-neck t-shirt available in multiple colors and sizes',
    sku: 'CLT-00002',
    price: 29.99,
    quantity: 500,
    contactEmail: 'apparel@fashionhub.com',
    isActive: true,
    discount: 5,
    promoCode: 'STYLE5',
    category: 'Clothing',
  },
  {
    id: 3,
    name: 'Artisan Dark Chocolate',
    description:
      'Hand-crafted 72% cacao dark chocolate bar with sea salt and roasted almonds',
    sku: 'FOD-00003',
    price: 12.5,
    quantity: 1000,
    contactEmail: 'info@chocoshop.com',
    isActive: true,
    discount: 0,
    promoCode: '',
    category: 'Food',
  },
  {
    id: 4,
    name: 'TypeScript Design Patterns',
    description:
      'Comprehensive guide to design patterns implemented in TypeScript with real-world examples',
    sku: 'BOK-00004',
    price: 44.99,
    quantity: 120,
    contactEmail: 'books@devpress.com',
    isActive: false,
    discount: 0,
    promoCode: '',
    category: 'Books',
  },
  {
    id: 5,
    name: 'Mechanical Keyboard RGB',
    description:
      'Full-size mechanical keyboard with Cherry MX switches and customizable RGB backlighting',
    sku: 'ELC-00005',
    price: 89.99,
    quantity: 75,
    contactEmail: 'peripherals@techstore.com',
    isActive: true,
    discount: 10,
    promoCode: 'KEYS10',
    category: 'Electronics',
  },
  {
    id: 6,
    name: 'Hiking Backpack 40L',
    description:
      'Durable 40-liter hiking backpack with rain cover and ergonomic support frame system',
    sku: 'OTH-00006',
    price: 79.99,
    quantity: 200,
    contactEmail: 'gear@outdoors.com',
    isActive: true,
    discount: 15,
    promoCode: 'HIKE15',
    category: 'Other',
  },
];

// ── Seed data — Users ────────────────────────────────────────────────
interface MockUser {
  id: number;
  name: string;
  email: string;
}

let userNextId = 4;
const mockUsers: MockUser[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com' },
];

// ── Route handlers ───────────────────────────────────────────────────
function handleProducts(
  req: HttpRequest<unknown>,
): Observable<HttpEvent<unknown>> {
  const idMatch = req.url.match(/\/products\/(\d+)/);
  const id = idMatch ? Number(idMatch[1]) : null;

  switch (req.method) {
    case 'GET':
      if (id !== null) {
        const product = mockProducts.find((p) => p.id === id);
        return product
          ? respond({ ...product })
          : respondError(404, 'Product not found');
      }
      return respond(mockProducts.map((p) => ({ ...p })));

    case 'POST': {
      const body = req.body as Partial<MockProduct>;
      const created: MockProduct = {
        id: productNextId++,
        name: body.name ?? '',
        description: body.description ?? '',
        sku: body.sku ?? '',
        price: body.price ?? 0,
        quantity: body.quantity ?? 0,
        contactEmail: body.contactEmail ?? '',
        isActive: body.isActive ?? false,
        discount: body.discount ?? 0,
        promoCode: body.promoCode ?? '',
        category: body.category ?? '',
      };
      mockProducts.push(created);
      return respond({ ...created });
    }

    case 'PUT':
    case 'PATCH': {
      const idx = mockProducts.findIndex((p) => p.id === id);
      if (idx === -1) return respondError(404, 'Product not found');
      mockProducts[idx] = {
        ...mockProducts[idx],
        ...(req.body as Partial<MockProduct>),
      };
      return respond({ ...mockProducts[idx] });
    }

    case 'DELETE': {
      const delIdx = mockProducts.findIndex((p) => p.id === id);
      if (delIdx === -1) return respondError(404, 'Product not found');
      mockProducts.splice(delIdx, 1);
      return respond(null);
    }

    default:
      return respondError(405, 'Method not allowed');
  }
}

function handleUsers(
  req: HttpRequest<unknown>,
): Observable<HttpEvent<unknown>> {
  const idMatch = req.url.match(/\/users\/(\d+)/);
  const id = idMatch ? Number(idMatch[1]) : null;

  switch (req.method) {
    case 'GET':
      if (id !== null) {
        const user = mockUsers.find((u) => u.id === id);
        return user
          ? respond({ ...user })
          : respondError(404, 'User not found');
      }
      return respond(mockUsers.map((u) => ({ ...u })));

    case 'POST': {
      const body = req.body as Partial<MockUser>;
      const created: MockUser = {
        id: userNextId++,
        name: body.name ?? '',
        email: body.email ?? '',
      };
      mockUsers.push(created);
      return respond({ ...created });
    }

    case 'PUT':
    case 'PATCH': {
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx === -1) return respondError(404, 'User not found');
      mockUsers[idx] = {
        ...mockUsers[idx],
        ...(req.body as Partial<MockUser>),
      };
      return respond({ ...mockUsers[idx] });
    }

    case 'DELETE': {
      const delIdx = mockUsers.findIndex((u) => u.id === id);
      if (delIdx === -1) return respondError(404, 'User not found');
      mockUsers.splice(delIdx, 1);
      return respond(null);
    }

    default:
      return respondError(405, 'Method not allowed');
  }
}

// ── Auth mock handler ─────────────────────────────────────────────────
function handleAuth(
  req: HttpRequest<unknown>,
): Observable<HttpEvent<unknown>> | null {
  const url = req.url;

  if (url.includes('/auth/login') && req.method === 'POST') {
    const body = req.body as { email?: string; password?: string } | null;
    if (!body?.email || !body?.password) {
      return respondError(400, 'Email and password are required');
    }
    return respond({
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Admin User',
        email: body.email,
        roles: ['admin', 'user'],
      },
    });
  }

  if (url.includes('/auth/me') && req.method === 'GET') {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return respondError(401, 'Unauthorized');
    }
    return respond({
      id: 1,
      name: 'Admin User',
      email: 'admin@demo.com',
      roles: ['admin', 'user'],
    });
  }

  return null;
}

// ── Main interceptor ─────────────────────────────────────────────────
export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  // Simulate server error (toast demo)
  if (url.includes('/error-test')) {
    return respondError(500, 'Simulated server error');
  }

  // Auth endpoints
  if (url.includes('/auth/')) {
    const authResponse = handleAuth(req);
    if (authResponse) return authResponse;
  }

  // Products CRUD
  if (url.includes('/products')) {
    return handleProducts(req);
  }

  // Users CRUD
  if (url.includes('/users')) {
    return handleUsers(req);
  }

  // Categories (demonstrates SKIP_LOADING — no spinner)
  if (url.includes('/categories')) {
    return respond([
      'Electronics',
      'Clothing',
      'Food',
      'Books',
      'Other',
    ]);
  }

  // Pass through any unmatched requests
  return next(req);
};
