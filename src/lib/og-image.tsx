import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const BADGE_SIZE = { width: 800, height: 200 }
export const QR_CARD_SIZE = { width: 744, height: 1052 } // ~A6 at 2x
export const OG_CONTENT_TYPE = 'image/png'

/**
 * Generate a branded OG image for static/platform pages.
 * Renders a card with gradient accent, platform name, page title, and subtitle.
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient accent in top-right corner */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        {/* Subtle gradient accent in bottom-left corner */}
        <div
          style={{
            position: 'absolute',
            bottom: '-160px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

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
              background: 'linear-gradient(180deg, #3b82f6, #a855f7)',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#e4e4e7',
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
                color: '#a1a1aa',
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
            background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
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
  clubName,
  activityType,
  location,
}: {
  clubName: string
  activityType?: string | null
  location?: string | null
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

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
              background: 'linear-gradient(180deg, #3b82f6, #a855f7)',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#e4e4e7',
            }}
          >
            findyour.club
          </div>
        </div>

        {/* Center: club info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              maxWidth: '1000px',
            }}
          >
            {clubName}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              fontSize: 28,
              color: '#a1a1aa',
            }}
          >
            {activityType && <span>{activityType}</span>}
            {activityType && location && <span>·</span>}
            {location && <span>{location}</span>}
          </div>
        </div>

        {/* Bottom: accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
            display: 'flex',
          }}
        />
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

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
              background: 'linear-gradient(180deg, #3b82f6, #a855f7)',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#e4e4e7',
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
                color: '#a1a1aa',
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
            background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
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
 */
export function generateBadgeImage({ clubName }: { clubName: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
          padding: '24px 48px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            {clubName}
          </div>
          <div style={{ fontSize: 22, color: '#a1a1aa', textAlign: 'center' }}>
            is on
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, textAlign: 'center' }}>
            findyour.club
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
