# Expense Tracker

A small cross-platform expense tracker built with Expo and React Native. It keeps expenses on the device and shows spending totals in Ghana cedis (GHS).

## Features

- Add, edit, and delete expenses.
- Record an expense title, amount, category, and date.
- See all-time and current-month totals.
- View spending by category.
- Search expenses by title or category.
- See the most recent expenses first.
- Store expense data locally with AsyncStorage. Data is not synced between devices or backed up by this app.

## Requirements

- Node.js 22.13 or newer (Expo SDK 57 requirement).
- npm, included with Node.js.
- For native development, follow Expo's setup guide for the Android emulator or iOS Simulator. An iOS Simulator requires macOS.

## Getting started

Install the dependencies and start Expo:

```bash
npm ci
npx expo start
```

Use the terminal shortcuts shown by Expo to open the app on a device or emulator. To start a specific target directly:

```bash
npm run android
npm run ios
npm run web
```

## Development checks

Run the TypeScript check with:

```bash
npx tsc --noEmit
```

The `npm run lint` script is present. ESLint configuration still needs to be set up for this project.

## EAS builds

The project is linked to EAS. The `preview` profile in `eas.json` creates an internally distributed Android APK. The `production` profile uses EAS production defaults.

Sign in to Expo if needed:

```bash
npx eas-cli@latest login
```

Create a preview APK:

```bash
npx eas-cli@latest build --profile preview --platform android
```

Create production builds for Android and iOS:

```bash
npx eas-cli@latest build --profile production --platform all
```

See Expo's [EAS Build guide](https://docs.expo.dev/build/setup/) and [`eas.json` reference](https://docs.expo.dev/build/eas-json/) for build and signing details.

## Project structure

```text
src/
  app/
    _layout.tsx       Expo Router stack
    index.tsx          Expense overview
    add-expense.tsx    Add and edit form
  components/
    chart.tsx          Category spending chart
  types/
    expense.ts         Expense data types
  utils/
    storage.ts         Local expense storage
```

Routes are file-based with [Expo Router](https://docs.expo.dev/router/introduction/).
