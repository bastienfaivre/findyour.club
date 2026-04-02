import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const BADGE_SIZE = { width: 1600, height: 200 }
export const QR_CARD_SIZE = { width: 744, height: 1052 } // ~A6 at 2x
export const STORY_SIZE = { width: 1080, height: 1920 } // Instagram story
export const OG_CONTENT_TYPE = 'image/png'

/**
 * Generate a branded OG image for static/platform pages.
 * Clean card with platform name, page title, and subtitle.
 */
export function generateStaticOgImage({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '60px 80px',
        }}
      >
        {/* Top: platform name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: '#a1a1aa',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#a1a1aa',
            }}
          >
            findyour.club
          </div>
        </div>

        {/* Center: title + subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 28,
                color: '#71717a',
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom: thin accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#27272a',
            display: 'flex',
          }}
        />
      </div>
    ),
    OG_SIZE,
  )
}

/**
 * Generate a branded OG image for a club page.
 * Shows club name, activity type, location, and platform branding.
 */
export function generateClubOgImage({
  logoUrl,
  faviconDataUrl,
}: {
  clubName?: string
  activityType?: string | null
  location?: string | null
  logoUrl?: string | null
  faviconDataUrl?: string | null
}) {
  const logoSrc = logoUrl || faviconDataUrl

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        {logoSrc && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={logoSrc}
            width={400}
            height={400}
            style={{ objectFit: 'contain' }}
          />
        )}
      </div>
    ),
    OG_SIZE,
  )
}

/**
 * Generate a branded OG image for country/category pages.
 */
export function generateCategoryOgImage({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '60px 80px',
        }}
      >
        {/* Top: platform name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: '#a1a1aa',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#a1a1aa',
            }}
          >
            findyour.club
          </div>
        </div>

        {/* Center: title + subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 28,
                color: '#71717a',
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom: accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#27272a',
            display: 'flex',
          }}
        />
      </div>
    ),
    OG_SIZE,
  )
}

/**
 * Generate a "We're on findyour.club" badge for a club.
 * Includes the club logo (if available) and the platform favicon.
 */
export function generateBadgeImage({
  clubName,
  clubLogoUrl,
  faviconDataUrl,
  verified,
}: {
  clubName: string
  clubLogoUrl?: string | null
  faviconDataUrl: string
  verified?: boolean
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#09090b',
            color: '#fafafa',
            padding: '24px 40px',
            gap: '28px',
            borderRadius: '16px',
          }}
        >
        {/* Club logo */}
        {clubLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={clubLogoUrl}
            width={120}
            height={120}
            style={{ borderRadius: '16px', objectFit: 'contain' }}
          />
        )}

        {/* Text block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}
          >
            {clubName}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: 22, color: '#71717a', fontWeight: 700 }}>
              is on
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              src={faviconDataUrl}
              width={28}
              height={28}
              style={{ borderRadius: '6px' }}
            />
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              findyour.club
            </div>
          </div>
          {verified && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#22c55e" />
                <path d="M5 8.5L7 10.5L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontSize: 16, color: '#22c55e', fontWeight: 700 }}>
                Verified
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    ),
    BADGE_SIZE,
  )
}

/**
 * Generate a printable QR code card for a club.
 * The QR code is passed as a pre-rendered data URL.
 */
export function generateQrCardImage({
  clubName,
  qrDataUrl,
}: {
  clubName: string
  qrDataUrl: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          color: '#09090b',
          fontFamily: 'sans-serif',
          padding: '60px',
          gap: '40px',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            maxWidth: '600px',
          }}
        >
          {clubName}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={qrDataUrl}
          width={400}
          height={400}
          style={{ borderRadius: '12px' }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: 20, color: '#71717a' }}>Find us on</div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>findyour.club</div>
        </div>
      </div>
    ),
    QR_CARD_SIZE,
  )
}

/**
 * Generate an Instagram story image for a club.
 * 1080x1920, dark branded design with club logo, name, platform branding, and club URL.
 */
export function generateStoryImage({
  clubName,
  clubLogoUrl,
  clubUrl,
}: {
  clubName: string
  clubLogoUrl?: string | null
  clubUrl: string
}) {
  // Strip protocol for display
  const displayUrl = clubUrl.replace(/^https?:\/\//, '')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '100px 60px',
          gap: '60px',
        }}
      >
        {/* Club logo */}
        {clubLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={clubLogoUrl}
            width={240}
            height={240}
            style={{ borderRadius: '32px', objectFit: 'contain' }}
          />
        )}

        {/* Club name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          {clubName}
        </div>

        {/* "is now on" + platform name */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: 36, color: '#71717a', fontWeight: 700 }}>
            is now on
          </div>
          <div style={{ fontSize: 52, fontWeight: 800 }}>
            findyour.club
          </div>
        </div>

        {/* Club URL — for use with Instagram link sticker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#18181b',
            padding: '20px 40px',
            borderRadius: '16px',
            marginTop: '20px',
          }}
        >
          <div style={{ fontSize: 28, color: '#a1a1aa', fontWeight: 600 }}>
            {displayUrl}
          </div>
        </div>
      </div>
    ),
    STORY_SIZE,
  )
}
