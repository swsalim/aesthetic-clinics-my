/** Client-safe public R2 URL helper (no secrets). */
export function getR2PublicUrl(): string {
  return (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.aestheticclinics.my').replace(
    /\/$/,
    '',
  );
}

export function buildR2PublicUrl(key: string): string {
  return `${getR2PublicUrl()}/${key.replace(/^\//, '')}`;
}
