interface MaintenanceBannerProps {
  message: string
}

// Matches http(s) URLs, excluding trailing punctuation like "." or ")" at the end of a sentence
const URL_PATTERN = /(https?:\/\/[^\s]*[^\s.,;:!?)])/

export type BannerPart = { type: 'text' | 'link'; value: string }

export function splitLinks(message: string): BannerPart[] {
  return message
    .split(URL_PATTERN)
    .map((value, i): BannerPart => ({ type: i % 2 === 1 ? 'link' : 'text', value }))
    .filter((part) => part.value !== '')
}

export function MaintenanceBanner({ message }: MaintenanceBannerProps) {
  return (
    <div className="shrink-0 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-200 z-10">
      {splitLinks(message).map((part, i) =>
        part.type === 'link' ? (
          <a
            key={i}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 break-all hover:text-amber-950 dark:hover:text-amber-100"
          >
            {part.value}
          </a>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </div>
  )
}
