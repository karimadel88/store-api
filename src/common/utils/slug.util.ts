export class SlugUtil {
  static generate(text: string): string {
    if (!text) return '';

    const slug = text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\p{L}\p{N}-]+/gu, '') // Remove all non-word chars (keeping Unicode letters/numbers)
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text

    // If result is empty (e.g. only special characters), fallback to a random string or return original if needed
    // But since Mongoose requires it, we must return something.
    if (!slug && text.length > 0) {
        // Fallback for cases where all characters were stripped (e.g. emojis only)
        return Date.now().toString();
    }

    return slug;
  }
}
