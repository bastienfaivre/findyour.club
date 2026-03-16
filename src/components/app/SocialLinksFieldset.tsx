import { SOCIAL_PLATFORMS, type SocialPlatform } from '@/lib/social-platforms'

interface SocialLinksFieldsetProps {
  label: string
  /** 'legend' for form fieldsets, 'label' for admin views */
  labelAs?: 'legend' | 'label'
  /** Optional extra element rendered after the label (e.g. a HelpTip) */
  labelExtra?: React.ReactNode
  renderInput: (platform: SocialPlatform) => React.ReactNode
}

export function SocialLinksFieldset({ label, labelAs = 'legend', labelExtra, renderInput }: SocialLinksFieldsetProps) {
  return (
    <fieldset className="space-y-3">
      {labelAs === 'legend' ? (
        <legend className="text-sm font-medium flex items-center gap-1.5">{label}{labelExtra}</legend>
      ) : (
        <label className="text-sm font-medium flex items-center gap-1.5">{label}{labelExtra}</label>
      )}
      {SOCIAL_PLATFORMS.map((platform) => {
        const Icon = platform.icon
        return (
          <div key={platform.key} className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {renderInput(platform)}
          </div>
        )
      })}
    </fieldset>
  )
}
