const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

const createdUser = {
  name: 'محمد حسين',
  email: `s.${Date.now()}@najah.edu`,
  password: 'Test@12345',
};

const registeredUsers = new Map();
const waitToSeeStep = (page) => page.waitForTimeout(1200);

async function mockAuthApi(page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = request.url().toLowerCase();

    if (request.method() === 'POST' && url.includes('/api/account/register')) {
      const body = request.postDataJSON();

      registeredUsers.set(body.email, {
        name: body.fullName,
        email: body.email,
        password: body.password,
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'تم إنشاء الحساب' }),
      });
      return;
    }

    if (request.method() === 'POST' && url.includes('/api/account/login')) {
      const body = request.postDataJSON();
      const savedUser = registeredUsers.get(body.email);

      if (!savedUser || savedUser.password !== body.password) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'header.payload.signature',
          isProfileCompleted: true,
          roles: [],
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}

async function registerUser(page, user) {
  await page.goto('/register');
  await waitToSeeStep(page);

  await page.getByPlaceholder('الاسم الكامل').fill(user.name);
  await waitToSeeStep(page);

  await page.getByPlaceholder('البريد الجامعي').fill(user.email);
  await waitToSeeStep(page);

  await page.getByPlaceholder('كلمة المرور').fill(user.password);
  await waitToSeeStep(page);

  await page.getByText('إنشاء الحساب', { exact: true }).click();
}

async function loginUser(page, email, password) {
  await page.goto('/login');
  await waitToSeeStep(page);

  await page.getByPlaceholder('البريد الجامعي').fill(email);
  await waitToSeeStep(page);

  await page.getByPlaceholder('كلمة المرور').fill(password);
  await waitToSeeStep(page);

  await page.getByText('دخول', { exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await mockAuthApi(page);
});

test('1 - creates a new account only', async ({ page }) => {
  await registerUser(page, createdUser);

  await expect(page.getByText(/عن ماذا تبحث اليوم/)).toBeVisible();
  await waitToSeeStep(page);
});

test('2 - logs in with the account created in the first test', async ({ page }) => {
  await loginUser(page, createdUser.email, createdUser.password);

  await expect(page.getByText(/عن ماذا تبحث اليوم/)).toBeVisible();
  await waitToSeeStep(page);
});

test('3 - shows an error when login email does not exist', async ({ page }) => {
  await loginUser(page, 'not-found@university.edu', 'Test@12345');

  await expect(
    page.getByText('البريد الإلكتروني أو كلمة المرور غير صحيحة'),
  ).toBeVisible();
  await waitToSeeStep(page);
});
