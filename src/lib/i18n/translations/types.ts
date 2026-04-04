export type Translations = {
  nav: { home: string; search: string; apply: string; myClubs: string; platform: string; login: string; logout: string; about: string; roadmap: string; support: string }
  common: { loading: string; error: string; save: string; cancel: string; submit: string; confirm: string }
  language: { label: string; fr: string; de: string; it: string; en: string }
  auth: {
    signIn: string
    signInSubtitle: string
    or: string
    setPassword: string
    setPasswordSubtitle: string
    setPasswordProfileHint: string
    twoFactor: string
    twoFactorSubtitle: string
    totpSetup: string
    totpSetupSubtitle: string
    accountSettings: string
    signedInAs: string
    changePassword: string
    passkeys: string
    profile: {
      title: string
      description: string
      firstName: string
      lastName: string
      phone: string
      preferredLanguage: string
      saving: string
      saved: string
    }
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
    forgotPassword: {
      link: string
      title: string
      subtitle: string
      sendLink: string
      sending: string
      successMessage: string
      backToLogin: string
    }
    resetPassword: {
      title: string
      subtitle: string
      resetting: string
      resetBtn: string
    }
    deleteAccount: {
      title: string
      description: string
      button: string
      dialogTitle: string
      dialogDescription: string
      consequences: string[]
      /** Use {clubs} as placeholder for the list of club names */
      clubsBlockingNote: string
      editorOnlyNote: string
      noClubsNote: string
      acknowledge: string
      deleting: string
      confirm: string
      cancel: string
    }
  }
  admin: {
    searchPlaceholder: string
    /** Use {shown} and {total} as placeholders */
    showingCount: string
    showMore: string
    applications: {
      title: string
      empty: string
      selectApplication: string
      reviewTab: string
      editTab: string
      previewTab: string
      allCountries: string
      name: string
      activityType: string
      description: string
      submittedAt: string
      email: string
      desiredSlug: string
      desiredSlugHint: string
      location: string
      country: string
      showMore: string
      approve: string
      reject: string
      /** Use {name} as placeholder for the club name */
      approveConfirm: string
      rejectTitle: string
      rejectDescription: string
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
      applicantSection: string
      clubSection: string
      existingClubs: string
      noExistingClubs: string
      saveChanges: string
      changesSaved: string
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
      members: string
      noMembers: string
      freshness: {
        title: string
        verified: string
        approaching: string
        expired: string
      }
    }
    users: {
      title: string
      selectUser: string
      noUsers: string
      firstName: string
      lastName: string
      email: string
      phone: string
      preferredLanguage: string
      role: string
      operator: string
      clubAdmin: string
      managedClubs: string
      noManagedClubs: string
      owner: string
      editor: string
    }
    messages: {
      title: string
      noConversations: string
      selectConversation: string
    }
    stats: {
      title: string
      description: string
      overview: string
      totalClubs: string
      publishedClubs: string
      totalUsers: string
      totalApplications: string
      pendingApplications: string
      pageViews: string
      pageViewsDescription: string
      last7Days: string
      last30Days: string
      allTime: string
      topClubs: string
      topClubsDescription: string
      /** Use {count} as placeholder */
      views: string
      noData: string
      uniqueVisitors: string
    }
    settings: {
      title: string
      description: string
      saved: string
      // Email toggles
      emailToggles: string
      emailTogglesDescription: string
      applicationSubmitted: string
      applicationSubmittedDescription: string
      applicationSubmittedRecipient: string
      applicationSubmittedRecipientDescription: string
      applicationRejected: string
      applicationRejectedDescription: string
      operatorMessage: string
      operatorMessageDescription: string
      forceOffline: string
      forceOfflineDescription: string
      alwaysEnabled: string
      applicationApproved: string
      applicationApprovedDescription: string
      editorInvited: string
      editorInvitedDescription: string
      passwordReset: string
      passwordResetDescription: string
      // Platform controls
      platformControls: string
      platformControlsDescription: string
      registrationsEnabled: string
      registrationsEnabledDescription: string
      maintenanceBanner: string
      maintenanceBannerDescription: string
      maintenanceBannerPlaceholder: string
      // Rate limits
      rateLimits: string
      rateLimitsDescription: string
      applicationsPerHour: string
      applicationsPerHourDescription: string
      loginAttemptsPerHour: string
      loginAttemptsPerHourDescription: string
      supportMessagesPerHour: string
      supportMessagesPerHourDescription: string
      invitationsPerHour: string
      invitationsPerHourDescription: string
      perHour: string
      // Club limits
      clubLimits: string
      clubLimitsDescription: string
      maxEditorsPerClub: string
      maxEditorsPerClubDescription: string
      maxPhotosPerClub: string
      maxPhotosPerClubDescription: string
      maxImageSizeMb: string
      maxImageSizeMbDescription: string
      maxDescriptionLength: string
      maxDescriptionLengthDescription: string
      maxScheduleLength: string
      maxScheduleLengthDescription: string
      maxHowToJoinLength: string
      maxHowToJoinLengthDescription: string
      imageTransactionsPerDay: string
      imageTransactionsPerDayDescription: string
      chars: string
      perDay: string
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
    registrationsClosed: string
    cta: string
    responsibleWarning: string
    responsibleShare: string
    responsibleShareButton: string
    steps: {
      aboutYou: string
      aboutYourClub: string
      next: string
      back: string
    }
    fields: {
      firstName: string
      lastName: string
      email: string
      phone: string
      preferredLanguage: string
      name: string
      clubEmail: string
      sameAsMyEmail: string
      sameAsMyPhone: string
      country: string
      activityType: string
      location: string
      description: string
      howToJoin: string
      schedule: string
      contactPhone: string
      contactAddress: string
      externalWebsiteUrl: string
      socialLinks: string
      desiredSlug: string
      otherDescription: string
      logo: string
      uploadLogo: string
      changeLogo: string
    }
    sections: {
      identity: string
      about: string
      contact: string
      social: string
      url: string
    }
    helpers: {
      logo: string
      activityType: string
      description: string
      schedule: string
      howToJoin: string
    }
    placeholders: {
      firstName: string
      lastName: string
      email: string
      phone: string
      name: string
      clubEmail: string
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
      firstNameRequired: string
      lastNameRequired: string
      emailInvalid: string
      preferredLanguageRequired: string
      nameRequired: string
      activityTypeRequired: string
      locationRequired: string
      descriptionRequired: string
      descriptionMaxLength: string
      howToJoinRequired: string
      scheduleRequired: string
      scheduleMaxLength: string
      applicantPhoneInvalid: string
      contactPhoneInvalid: string
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
      logoErrorType: string
      logoErrorSize: string
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
        help: string
        viewPublicPage: string
      }
      help: {
        title: string
        intro: string
        pages: {
          profile: {
            title: string
            description: string
            subsections: {
              identity: string
              about: string
              contact: string
              social: string
              media: string
              verification: string
              completeness: string
            }
          }
          promote: {
            title: string
            description: string
            items: string[]
          }
          settings: {
            title: string
            description: string
            subsections: {
              visibility: string
              team: string
              data: string
              danger: string
            }
          }
          messages: {
            title: string
            description: string
            items: string[]
          }
        }
        ownerOnly: string
        tip: string
        tipContent: string
      }
      clubProfile: {
        title: string
        placeholder: string
        preview: string
        editTab: string
        sections: {
          identity: string
          about: string
          contact: string
          social: string
          media: string
        }
        completeness: {
          /** Use {filled} and {total} as placeholders */
          label: string
        }
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
        helpers: {
          description: string
          schedule: string
          howToJoin: string
        }
        tips: {
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
          descriptionRequired: string
          descriptionMaxLength: string
          scheduleRequired: string
          scheduleMaxLength: string
          howToJoinRequired: string
          howToJoinMaxLength: string
          contactPhoneInvalid: string
          contactAddressMaxLength: string
          externalWebsiteUrlInvalid: string
        }
        logo: {
          title: string
          change: string
          remove: string
          cancel: string
          confirm: string
          altLabel: string
          altPlaceholder: string
          altRequired: string
          uploading: string
          errorType: string
          /** Use {sizeMb} as placeholder */
          errorSize: string
          errorUpload: string
        }
        photos: {
          title: string
          add: string
          delete: string
          deleteConfirm: string
          /** Use {max} as placeholder */
          maxReached: string
          /** Use {max} and {sizeMb} as placeholders */
          constraints: string
          uploading: string
          errorType: string
          /** Use {sizeMb} as placeholder */
          errorSize: string
          errorUpload: string
          setAsMain: string
          isMain: string
        }
      }
      visibility: {
        title: string
        online: string
        offline: string
        onlineSuccess: string
        offlineSuccess: string
        forceOfflineWarning: string
        error: string
      }
      messages: {
        title: string
        placeholder: string
        send: string
        you: string
        platform: string
        empty: string
        loadOlder: string
        /** Use {count} as placeholder */
        unreadBadge: string
      }
      welcome: {
        title: string
        description: string
        steps: string[]
        dismiss: string
      }
      settings: {
        title: string
        placeholder: string
        sections: {
          visibility: string
          team: string
          data: string
          danger: string
        }
        verification: {
          confirmButton: string
          confirmSuccess: string
          countdown: {
            healthy: string
            approaching: string
            expired: string
          }
          banner: {
            approaching: string
            expired: string
            andMore: string
          }
        }
        exportData: string
        exportDescription: string
        exportPreparing: string
        exportDoNotClose: string
        exportError: string
        deleteClub: {
          title: string
          description: string
          button: string
          /** Use {clubName} as placeholder */
          dialogTitle: string
          dialogDescription: string
          consequences: string[]
          exportReminder: string
          /** Use {clubName} as placeholder */
          confirmHint: string
          acknowledge: string
          deleting: string
          confirm: string
          cancel: string
        }
      }
      promote: {
        title: string
        description: string
        comingSoon: string
        story: string
        storyDescription: string
        poster: string
        posterDescription: string
        badge: string
        badgeDescription: string
        qrCard: string
        qrCardDescription: string
        download: string
        embedTitle: string
        embedDescription: string
        copySnippet: string
        copied: string
        preview: string
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
        draftFound: string
        draftRestore: string
        draftDiscard: string
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
      cancelInvite: string
      /** Use {email} as placeholder */
      cancelInviteConfirm: string
      inviteCancelled: string
      /** Use {current} and {max} as placeholders */
      editorCount: string
      /** Use {max} as placeholder */
      editorLimitReached: string
    }
  }
  platform: {
    headline: string
    headlinePrefix: string
    headlineRotatingWords: string[]
    tagline: string
    taglineBullets: {
      intro: string
      whoLabel: string
      whoText: string
      whenLabel: string
      whenText: string
      howLabel: string
      howText: string
      closing: string
    }
    trustLine: string
    stats: {
      /** Use {count} as placeholder */
      clubs: string
    }
    /** Use {country} as placeholder */
    exploreCountry: string
    availableNow: string
    comingSoon: string
    activityTypes: string
    bootstrapMessage: string
    bootstrapShare: string
    bootstrapListClub: string
    searchCityPlaceholder: string
    searchCityButton: string
    about: {
      title: string
      content: string[]
      author: string
    }
    roadmap: {
      title: string
      content: string[]
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
    freshnessBadgeUpToDate: string
    freshnessBadgeApproaching: string
    freshnessBadgeNotVerified: string
    shareCtaMessage: string
    listCtaMessage: string
  }
  clubSite: {
    contactCta: string
    visitWebsite: string
    description: string
    schedule: string
    howToJoin: string
    contactInfo: string
    freshnessExpiredBanner: string
    email: string
    phone: string
    address: string
    photos: string
    goToPhoto: string
    closeLightbox: string
    shareButton: string
    linkCopied: string
  }
  layout: {
    skipToContent: string
    copyright: string
    privacy: string
    terms: string
    toggleSidebar: string
  }
  theme: { toggleTheme: string; light: string; dark: string; system: string }
  privacy: {
    title: string
    lastUpdated: string
    intro: string
    operator: {
      title: string
      content: string
    }
    dataCollected: {
      title: string
      visitors: {
        title: string
        items: string[]
      }
      applicants: {
        title: string
        items: string[]
      }
      clubAdmins: {
        title: string
        items: string[]
      }
    }
    usage: {
      title: string
      items: string[]
    }
    security: {
      title: string
      items: string[]
    }
    thirdParty: {
      title: string
      content: string
      items: string[]
    }
    cookies: {
      title: string
      content: string
    }
    retention: {
      title: string
      content: string
    }
    rights: {
      title: string
      content: string
      items: string[]
    }
    contact: {
      title: string
      content: string
    }
  }
  terms: {
    title: string
    lastUpdated: string
    intro: string
    acceptance: {
      title: string
      content: string
    }
    service: {
      title: string
      content: string
    }
    accounts: {
      title: string
      content: string
      items: string[]
    }
    clubContent: {
      title: string
      content: string
      items: string[]
    }
    moderation: {
      title: string
      content: string
    }
    intellectualProperty: {
      title: string
      content: string
    }
    liability: {
      title: string
      content: string
    }
    termination: {
      title: string
      content: string
    }
    changes: {
      title: string
      content: string
    }
    contact: {
      title: string
      content: string
    }
  }
  seo: {
    homeDescription: string
    searchDescription: string
    aboutDescription: string
    roadmapDescription: string
    supportDescription: string
    privacyDescription: string
    termsDescription: string
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
    ogHomeSubtitle: string
  }
  activityTypes: Record<string, string>
  emails: {
    footer: {
      noreply: string
      contact: string
      copyright: string
    }
    acceptance: {
      subject: string
      heading: string
      /** Use {clubName} as placeholder */
      congratulations: string
      platformMessage: string
      liveLine: string
      setupLine: string
      setupButton: string
      expiry: string
    }
    rejection: {
      /** Use {clubName} as placeholder */
      subject: string
      heading: string
      /** Use {clubName} as placeholder */
      thankYou: string
      defaultReason: string
      reapply: string
      regards: string
    }
    applicationSubmitted: {
      /** Use {clubName} as placeholder */
      subject: string
      heading: string
      /** Use {applicantName} and {clubName} as placeholders */
      intro: string
      reviewButton: string
    }
    operatorMessage: {
      /** Use {clubName} as placeholder */
      subject: string
      heading: string
      /** Use {clubName} as placeholder */
      intro: string
      regards: string
    }
    forceOffline: {
      /** Use {clubName} as placeholder */
      subject: string
      heading: string
      /** Use {clubName} as placeholder */
      intro: string
      resolution: string
      regards: string
    }
    invitation: {
      /** Use {clubName} as placeholder */
      subject: string
      heading: string
      /** Use {clubName} as placeholder */
      intro: string
      cta: string
      acceptButton: string
      expiry: string
    }
    passwordReset: {
      subject: string
      heading: string
      intro: string
      resetButton: string
      expiry: string
    }
    verificationReminder: {
      /** Use {clubName} as placeholder */
      subject: string
      heading: string
      /** Use {clubName} as placeholder */
      intro: string
      cta: string
      verifyButton: string
    }
    verificationExpired: {
      /** Use {clubName} as placeholder */
      subject: string
      heading: string
      /** Use {clubName} as placeholder */
      intro: string
      cta: string
      verifyButton: string
    }
  }
  errors: {
    unauthorized: string
    notFound: string
    serverError: string
    validationError: string
    tooManyAttempts: string
    invalidCredentials: string
    botProtectionFailed: string
    registrationsClosed: string
    invalidImageType: string
    uploadFailed: string
    emailFailed: string
    alreadyReviewed: string
    notAuthenticated: string
    clubNotFound: string
    ownerOnly: string
    tooManyInvitations: string
    maxEditorsReached: string
    invalidEmail: string
    alreadyMember: string
    pendingInvite: string
    wrongPassword: string
    passwordBreached: string
  }
}
