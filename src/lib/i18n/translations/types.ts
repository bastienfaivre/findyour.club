export type Translations = {
  nav: { home: string; apply: string; myClubs: string; login: string; logout: string; about: string; support: string }
  common: { loading: string; error: string; save: string; cancel: string; submit: string; confirm: string }
  language: { label: string; fr: string; de: string; it: string; en: string }
  auth: {
    signIn: string
    signInSubtitle: string
    or: string
    setPassword: string
    setPasswordSubtitle: string
    twoFactor: string
    twoFactorSubtitle: string
    totpSetup: string
    totpSetupSubtitle: string
    accountSettings: string
    signedInAs: string
    changePassword: string
    passkeys: string
    errorTitle: string
    returnToSignIn: string
    errors: {
      configuration: string
      accessDenied: string
      verification: string
      /** Use {email} as placeholder for the support email address */
      tokenInvalid: string
      /** Use {email} as placeholder for the support email address */
      tokenExpired: string
      inviteExpired: string
      inviteEmailMismatch: string
      default: string
    }
    fields: {
      email: string
      password: string
      currentPassword: string
      newPassword: string
      confirmPassword: string
      /** Label for the 6-digit code field on the TOTP challenge page */
      codeTotp: string
      /** Label for the 6-digit code field on the TOTP setup page */
      codeSetup: string
    }
    form: {
      signingIn: string
      signIn: string
      updatingPassword: string
      updatePassword: string
      settingPassword: string
      setPasswordBtn: string
      verifying: string
      verify: string
      activate2fa: string
      copy: string
      copied: string
      enrollTotp: string
      resetTotp: string
      removing: string
      disable2fa: string
      addPasskey: string
      working: string
      remove: string
      signInWithPasskey: string
      authenticating: string
      passwordChanged: string
      passwordHint: string
      strength: string
      strengthTooShort: string
      strengthWeak: string
      strengthFair: string
      strengthStrong: string
      totpEnabled: string
      totpNotEnrolled: string
      totpEnabledDesc: string
      totpNotEnrolledDesc: string
      totpConfirmDisable: string
      noPasskeys: string
      /** Use {date} as placeholder for the formatted date */
      passkeyAdded: string
      passkeyConfirmRemove: string
      passkeyDefaultName: string
      passkeyStartFailed: string
      passkeyCompleteFailed: string
      passkeyRegistrationFailed: string
    }
    banner: {
      pre: string
      link: string
      post: string
    }
  }
  myClubs: {
    noClubs: string
  }
  admin: {
    dashboardTitle: string
    applications: {
      title: string
      empty: string
      name: string
      activityType: string
      description: string
      submittedAt: string
      email: string
      desiredSlug: string
      location: string
      country: string
      showMore: string
      showLess: string
      approve: string
      reject: string
      /** Use {name} as placeholder for the club name */
      approveConfirm: string
      rejectTitle: string
      rejectDescription: string
      rejectReason: string
      rejectReasonPlaceholder: string
      approved: string
      /** Use {email} as placeholder for the applicant email */
      approvedWithEmail: string
      rejected: string
      /** Use {email} as placeholder for the applicant email */
      rejectedWithEmail: string
      confirmApprove: string
      confirmReject: string
      keepReviewing: string
      profileFields: {
        schedule: string
        contactPhone: string
        contactAddress: string
        howToJoin: string
        externalWebsiteUrl: string
      }
      operatorMessage: {
        label: string
        placeholder: string
      }
      errors: {
        notFound: string
        alreadyReviewed: string
        unauthorized: string
        slugRequired: string
        slugInvalid: string
        slugConflict: string
        emailFailed: string
      }
    }
  }
  apply: {
    title: string
    subtitle: string
    fields: {
      name: string
      email: string
      country: string
      activityType: string
      location: string
      description: string
      profileDetails: string
      howToJoin: string
      schedule: string
      contactPhone: string
      contactAddress: string
      externalWebsiteUrl: string
      desiredSlug: string
    }
    placeholders: {
      name: string
      email: string
      activityType: string
      location: string
      description: string
      howToJoin: string
      schedule: string
      contactPhone: string
      contactAddress: string
      desiredSlug: string
    }
    requiredLegend: string
    validation: {
      nameRequired: string
      emailInvalid: string
      activityTypeRequired: string
      locationRequired: string
      descriptionRequired: string
      descriptionMaxLength: string
      howToJoinRequired: string
      scheduleMaxLength: string
      contactPhoneMaxLength: string
      contactAddressMaxLength: string
      externalWebsiteUrlInvalid: string
      desiredSlugRequired: string
      desiredSlugInvalid: string
    }
    desiredSlugHint: string
    success: string
    errors: {
      rateLimited: string
      turnstileFailed: string
      serverError: string
    }
    submitting: string
  }
  club: {
    settings: string
    admin: {
      sidebar: {
        clubProfile: string
        settings: string
        viewPublicPage: string
      }
      clubProfile: {
        title: string
        placeholder: string
      }
      settings: {
        title: string
        placeholder: string
      }
      navigation: string
      openMenu: string
      skipToContent: string
    }
    membership: {
      members: string
      noMembers: string
      email: string
      role: string
      status: string
      actions: string
      owner: string
      editor: string
      active: string
      pending: string
      transfer: string
      revoke: string
      confirm: string
      cancel: string
      /** Use {email} as placeholder */
      transferConfirm: string
      /** Use {email} as placeholder */
      revokeConfirm: string
      transferSuccess: string
      revokeSuccess: string
      inviteEditor: string
      emailAddress: string
      sending: string
      inviteAsEditor: string
      /** Use {email} as placeholder */
      inviteSent: string
    }
  }
  platform: {
    headline: string
    philosophy: string
    stats: {
      /** Use {count} as placeholder */
      clubs: string
      /** Use {count} as placeholder */
      countries: string
    }
    /** Use {country} as placeholder */
    exploreCountry: string
    availableNow: string
    comingSoon: string
    associations: string
    /** Label for the countries stat (standalone, not a template) */
    countriesLabel: string
    activityTypes: string
    marketingSpend: string
    marketingSpendValue: string
    about: {
      title: string
      content: string
    }
    support: {
      title: string
      donationHeadline: string
      donationText: string
      supportFormPlaceholder: string
    }
  }
  directory: {
    /** Use {country} as placeholder */
    title: string
    /** Use {country} as placeholder */
    description: string
    filterCanton: string
    filterActivity: string
    allCantons: string
    allActivities: string
    noResults: string
    noResultsHint: string
    resetFilters: string
    /** Use {count} as placeholder */
    clubCount: string
    /** Use {name}, {activity}, {location} as placeholders */
    clubAriaLabel: string
  }
  clubSite: {
    contactCta: string
    visitWebsite: string
    home: string
    contact: string
    editSite: string
    menu: string
    navigation: string
    poweredBy: string
    poweredByAriaLabel: string
  }
  layout: {
    skipToContent: string
    mainNavigation: string
    openMenu: string
    copyright: string
    platformLinks: string
    legalLinks: string
    privacy: string
    terms: string
  }
  theme: { toggleTheme: string; light: string; dark: string; system: string }
  activityTypes: Record<string, string>
}
