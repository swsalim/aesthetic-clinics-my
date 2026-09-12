/** Build absolute ImageKit URLs from the current account id. */

export function getImageKitId(): string {
  return process.env.NEXT_PUBLIC_IMAGEKIT_ID || '';
}

export function imageKitUrl(path: string): string {
  const clean = path.replace(/^\//, '');
  return `https://ik.imagekit.io/${getImageKitId()}/${clean}`;
}
