export function buildClubAdminUrl(host: string, country: string, slug: string): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}/${country}/${slug}`
}
