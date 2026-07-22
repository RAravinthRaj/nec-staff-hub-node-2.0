/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

const normalizeStringArray = (items: unknown[]): string[] => {
  return items
    .flatMap((item) => {
      const value = typeof item === 'string' ? item : String(item ?? '');
      const trimmed = value.trim();

      if (
        trimmed.startsWith('data:') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('file://')
      ) {
        return [trimmed];
      }

      return value.split(',');
    })
    .map((item) => item.trim())
    .filter(Boolean);
};

export const normalizeDocuments = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return normalizeStringArray(value);
  }

  if (value == null) {
    return [];
  }

  if (typeof value !== 'string') {
    return normalizeStringArray([value]);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return normalizeStringArray(parsed);
    }

    if (typeof parsed === 'string') {
      return normalizeStringArray([parsed]);
    }
  } catch (_) {
    return normalizeStringArray([trimmed]);
  }

  return normalizeStringArray([trimmed]);
};
