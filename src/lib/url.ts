export function buildClubAdminUrl(host: string, lang: string, country: string, slug: string): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}/${lang}/${country}/${slug}`
}
