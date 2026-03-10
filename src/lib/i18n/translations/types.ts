export type Translations = {
  nav: { home: string; search: string; apply: string; myClubs: string; platform: string; login: string; logout: string; about: string; support: string }
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
    deleteAccount: {
      title: string
      description: string
      button: string
      dialogTitle: string
      dialogDescription: string
      /** Use {clubs} as placeholder for the list of club names */
      clubsWarning: string
      editorOnlyNote: string
      noClubsNote: string
      confirmLabel: string
      /** Use {names} as placeholder for the club names to type */
      confirmHint: string
      deleting: string
      confirm: string
      cancel: string
    }
  }
  myClubs: {
    noClubs: string
  }
  admin: {
    dashboardTitle: string
    overviewTitle: string
    welcome: string
    welcomeMessage: string
    searchPlaceholder: string
    /** Use {shown} and {total} as placeholders */
    showingCount: string
    showMore: string
    applications: {
      title: string
      reviewTab: string
      selectApplication: string
      editTab: string
      previewTab: string
      allCountries: string
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
        socialLinks: string
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
    clubs: {
      title: string
      clubModeration: string
      forceOffline: string
      liftOffline: string
      reasonRequired: string
      clubForcedOffline: string
      offlineLifted: string
      moderatedOffline: string
      viewClub: string
      reasonPlaceholder: string
      /** Use {clubName} as placeholder */
      liftOfflineDescription: string
      noClubs: string
      name: string
      country: string
      status: string
      photos: string
      actions: string
      /** Use {count} as placeholder */
      photoCount: string
      selectClub: string
      allStatuses: string
      online: string
      offline: string
      editTab: string
      previewTab: string
      slug: string
      email: string
      description: string
      activityType: string
      location: string
      saveChanges: string
      changesSaved: string
      profileFields: {
        schedule: string
        contactPhone: string
        contactAddress: string
        howToJoin: string
        externalWebsiteUrl: string
        socialLinks: string
      }
      photoSection: string
      deleteClub: string
      /** Use {clubName} as placeholder */
      deleteClubConfirm: string
      deleteClubDescription: string
      /** Use {clubName} as placeholder */
      deleteClubHint: string
      clubDeleted: string
      deletePhoto: string
      noPhotos: string
    }
    messages: {
      title: string
      noConversations: string
      /** Use {clubName} as placeholder */
      lastMessage: string
      selectConversation: string
    }
  }
  apply: {
    title: string
    subtitle: string
    benefits: {
      free: string
      verified: string
      simple: string
      visible: string
    }
    noCatch: string
    reviewCommitment: string
    cta: string
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
      socialLinks: string
      desiredSlug: string
      otherDescription: string
    }
    placeholders: {
      name: string
      email: string
      activityType: string
      otherDescription: string
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
      otherDescriptionRequired: string
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
        promote: string
        messages: string
        settings: string
        viewPublicPage: string
      }
      clubProfile: {
        title: string
        placeholder: string
        preview: string
        editTab: string
        fields: {
          name: string
          description: string
          schedule: string
          howToJoin: string
          contactEmail: string
          contactPhone: string
          contactAddress: string
          externalWebsiteUrl: string
          socialLinks: string
        }
        placeholders: {
          name: string
          description: string
          schedule: string
          howToJoin: string
          contactEmail: string
          contactPhone: string
          contactAddress: string
          externalWebsiteUrl: string
        }
        validation: {
          nameRequired: string
          emailInvalid: string
          descriptionMaxLength: string
          scheduleMaxLength: string
          howToJoinMaxLength: string
          contactPhoneInvalid: string
          contactAddressMaxLength: string
          externalWebsiteUrlInvalid: string
        }
        logo: {
          title: string
          change: string
          remove: string
          altLabel: string
          altPlaceholder: string
          altRequired: string
          uploading: string
          errorType: string
          errorSize: string
          errorUpload: string
        }
        photos: {
          title: string
          add: string
          delete: string
          deleteConfirm: string
          maxReached: string
          /** Use {count} for current count and {min} for minimum */
          minRequired: string
          constraints: string
          uploading: string
          errorType: string
          errorSize: string
          errorUpload: string
        }
      }
      visibility: {
        title: string
        online: string
        offline: string
        onlineSuccess: string
        offlineSuccess: string
        forceOfflineWarning: string
        /** Use {count} as placeholder for the current photo count and {min} for the minimum */
        minPhotosRequired: string
        error: string
      }
      messages: {
        title: string
        placeholder: string
        send: string
        you: string
        platform: string
        empty: string
        /** Use {count} as placeholder */
        unreadBadge: string
      }
      settings: {
        title: string
        placeholder: string
        exportData: string
        exportDescription: string
      }
      promote: {
        title: string
        description: string
        badge: string
        badgeDescription: string
        qrCard: string
        qrCardDescription: string
        download: string
      }
      save: {
        save: string
        discard: string
        unsavedChanges: string
        savedSuccessfully: string
        discardConfirmTitle: string
        discardConfirmDescription: string
        leaveConfirmTitle: string
        leaveConfirmDescription: string
        stay: string
        leave: string
        keepEditing: string
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
    headlinePrefix: string
    headlineRotatingWords: string[]
    tagline: string
    philosophy: string
    trustLine: string
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
    clubsLabel: string
    /** Label for the countries stat (standalone, not a template) */
    countriesLabel: string
    activityTypes: string
    launchLabel: string
    launchValue: string
    bootstrapMessage: string
    bootstrapShare: string
    bootstrapListClub: string
    marketingSpend: string
    marketingSpendValue: string
    about: {
      title: string
      content: string
    }
    support: {
      title: string
      intro: string
      costBreakdownTitle: string
      costsDisclaimer: string
      domain: string
      server: string
      totalPerYear: string
      fundedUntil: string
      /** Use {date} as placeholder for the funded-until date */
      fundedUntilDate: string
      contributorsTitle: string
      contributorsIntro: string
      helpTitle: string
      helpText: string
    }
  }
  directory: {
    /** Use {country} as placeholder */
    title: string
    /** Use {country} as placeholder */
    description: string
    filterCountry: string
    filterCanton: string
    filterCity: string
    filterActivity: string
    allCountries: string
    allCantons: string
    allActivities: string
    noResults: string
    noResultsHint: string
    resetFilters: string
    /** Use {count} as placeholder */
    clubCount: string
    /** Use {name}, {activity}, {location} as placeholders */
    clubAriaLabel: string
    verifiedBadge: string
    verifiedDetail: string
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
    schedule: string
    howToJoin: string
    contactInfo: string
    email: string
    phone: string
    address: string
    photos: string
    goToPhoto: string
    sharePrompt: string
    shareButton: string
    linkCopied: string
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
    toggleSidebar: string
  }
  theme: { toggleTheme: string; light: string; dark: string; system: string }
  seo: {
    homeDescription: string
    searchDescription: string
    aboutDescription: string
    supportDescription: string
    applyDescription: string
    clubsIn: string
    /** Use {country} as placeholder */
    countryDescription: string
    /** Use {activity} and {country} as placeholders */
    activityDescription: string
    /** Use {canton} and {country} as placeholders */
    cantonDescription: string
    /** Use {activity}, {canton}, and {country} as placeholders */
    cantonActivityDescription: string
    browseByActivity: string
    browseByRegion: string
  }
  activityTypes: Record<string, string>
}
