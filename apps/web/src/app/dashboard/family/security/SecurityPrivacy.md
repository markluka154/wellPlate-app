# Security & Privacy for Family Pack

## Data Protection

```typescript
// Enhanced security for family data

interface SecurityMeasures {
  // ============================================
  // ENCRYPTION
  // ============================================
  encryption: {
    // Data at rest encryption
    atRest: {
      algorithm: 'AES-256-GCM',
      keyManagement: 'AWS KMS',
      keyRotation: '30 days',
      
      // What gets encrypted
      sensitiveData: [
        'allergies',
        'healthGoals',
        'weightKg',
        'heightCm',
        'photos',
        'calendarEvents',
        'preferences',
        'reactions'
      ]
    },
    
    // Data in transit encryption
    inTransit: {
      protocol: 'TLS 1.3',
      certificateValidation: true,
      hsts: true
    },
    
    // Field-level encryption for highly sensitive data
    fieldLevel: {
      allergies: 'AES-256',
      healthConditions: 'AES-256',
      paymentInfo: 'PCI-DSS compliant',
      biometricData: 'none'  // Not collected
    }
  },
  
  // ============================================
  // ACCESS CONTROL
  // ============================================
  accessControl: {
    // Family member role-based permissions
    familyMembersCanView: [
      'mealPlans',
      'shoppingLists',
      'memories',
      'achievements',
      'cookingTasks',
      'calendar'
    ],
    
    onlyAdultsCanEdit: [
      'budget',
      'budgetLimits',
      'memberProfiles',
      'preferences',
      'calendarEvents',
      'paymentMethods',
      'subscriptionSettings',
      'dataExport'
    ],
    
    onlyAdultsCanView: [
      'costBreakdown',
      'healthData',
      'analytics'
    ],
    
    childrenCanView: [
      'todaysMeal',
      'theirOwnProfile',
      'achievements',
      'theirOwnTasks',
      'familyMemories'
    ],
    
    childrenCanEdit: [
      'theirOwnReactions',
      'theirOwnTasks',
      'theirOwnAchievements'
    ],
    
    // Role definitions
    roles: {
      ADULT: {
        can: 'everything',
        restrictions: 'none'
      },
      TEEN: {
        can: [
          'viewMealPlans',
          'startCooking',
          'markTasksComplete',
          'rateMeals',
          'logReactions'
        ],
        cannot: [
          'editBudget',
          'deleteData',
          'exportData'
        ]
      },
      CHILD: {
        can: [
          'viewTodaysMeal',
          'viewTheirOwnProfile',
          'viewAchievements',
          'completeSafeTasks'
        ],
        cannot: [
          'editAnything',
          'viewFinancialData',
          'viewPrivateData'
        ]
      },
      SENIOR: {
        can: 'sameAsAdult',
        additionalCare: 'readability-optimizations'
      }
    }
  },
  
  // ============================================
  // PRIVACY
  // ============================================
  privacy: {
    // Photo handling
    photoStorage: {
      location: 'AWS S3',
      encryption: 'AES-256',
      bucketPolicy: 'private',
      accessControl: 'family-only',
      versioning: true,
      lifecycle: '2-years'
    },
    
    photoFaceBlurring: {
      enabled: false,  // User choice
      byDefault: false,
      canEnable: true,
      purpose: 'sharing-public-memories'
    },
    
    // Data retention
    dataRetention: {
      mealPlans: '2-years',
      reactions: '2-years',
      photos: 'indefinite-unless-deleted',
      financialData: '2-years',
      analytics: '1-year'
    },
    
    // Data deletion
    deleteAllData: {
      triggeredBy: 'user-request',
      process: 'secure-wipe',
      confirmation: 'required',
      irreversible: true,
      timeline: '48-hours',
      backupRetention: 'none'
    },
    
    // Data export
    exportAllData: {
      formats: ['JSON', 'CSV', 'PDF'],
      includes: [
        'allMealPlans',
        'allReactions',
        'allMemories',
        'allAnalytics',
        'allProfileData',
        'allPhotos'  // As links
      ],
      excludes: [
        'paymentInformation',
        'encryptedAllergies'
      ],
      delivery: 'secure-download-link'
    },
    
    // Privacy controls
    privacyControls: {
      shareWithOtherFamilies: false,  // Not implemented yet
      showInPublicFeeds: false,
      allowDataSharingForResearch: false,  // Opt-in only
      anonymizedAnalytics: true
    }
  },
  
  // ============================================
  // COMPLIANCE
  // ============================================
  compliance: {
    GDPR: {
      compliant: true,
      rightToAccess: true,
      rightToErasure: true,
      dataPortability: true,
      lawfulBasis: 'consent',
      dataProcessing: 'legitimate-interests',
      dataMinimization: true,
      retentionLimits: true
    },
    
    CCPA: {
      compliant: true,
      optOutOfSale: true,  // We don't sell data
      discloseCollection: true,
      rightToKnow: true,
      rightToDelete: true,
      nonDiscrimination: true
    },
    
    COPPA: {
      compliant: true,
      parentalConsent: 'required-for-under-13',
      limitedDataCollection: true,
      noBehavioralAdvertising: true,
      noPersonalInfoDisclosure: true,
      childAccountsRestricted: true
    },
    
    HIPAA: {
      compliant: false,  // Not healthcare focused
      healthDataHandling: 'basic-screening',
      noMedicalRecords: true
    }
  }
}
```

## Implementation Guidelines

```typescript
// apps/web/src/lib/security/family-security.ts

export class FamilySecurityManager {
  // Check if user can access resource
  static async canAccess(
    userId: string,
    resource: string,
    action: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    const user = await getUser(userId)
    const family = await getFamilyProfile(userId)
    const resourcePermissions = this.getResourcePermissions(resource)
    
    // Check role-based access
    const rolePermission = this.checkRolePermission(
      user.role,
      resourcePermissions,
      action
    )
    
    if (!rolePermission) {
      return false
    }
    
    // Check family membership
    if (resource.includes('family')) {
      const isMember = family.members.some(m => m.userId === userId)
      return isMember
    }
    
    return true
  }
  
  // Encrypt sensitive fields before saving
  static async encryptSensitiveFields(data: any): Promise<any> {
    const sensitiveFields = [
      'allergies',
      'healthGoals',
      'weightKg',
      'heightCm'
    ]
    
    const encrypted = { ...data }
    
    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        encrypted[field] = await encrypt(encrypted[field])
      }
    }
    
    return encrypted
  }
  
  // Audit log for sensitive operations
  static async logSensitiveOperation(
    userId: string,
    operation: string,
    resource: string,
    details?: any
  ): Promise<void> {
    await db.auditLog.create({
      userId,
      operation,
      resource,
      details,
      timestamp: new Date()
    })
  }
  
  // Verify age for COPPA compliance
  static async verifyAge(parentUserId: string, childAge: number): Promise<boolean> {
    if (childAge < 13) {
      // Require parental consent
      const consent = await db.parentalConsent.findUnique({
        where: { parentUserId_childUserId: { parentUserId, childUserId } }
      })
      
      return consent?.verified === true
    }
    
    return childAge >= 13
  }
}
```

## Privacy Settings UI

```typescript
// apps/web/src/app/dashboard/family/settings/privacy/page.tsx

interface PrivacySettings {
  // Data visibility
  dataVisibility: {
    shareMealPlansWithFamily: boolean
    shareMemoriesPublicly: boolean
    showAchievementsInFamilyFeed: boolean
    allowPhotoFaceBlurring: boolean
  }
  
  // Data retention
  dataRetention: {
    keepMealPlansFor: '1-year' | '2-years' | '3-years' | 'indefinite'
    keepPhotosFor: '1-year' | '2-years' | '3-years' | 'indefinite'
    autoDeleteOldData: boolean
  }
  
  // Access control
  accessControl: {
    allowChildrenToEditTheirProfile: boolean
    allowTeensToStartCooking: boolean
    requireAdultApprovalForPurchases: boolean
  }
  
  // Analytics
  analytics: {
    shareAnonymizedData: boolean
    allowPersonalizedRecommendations: boolean
    trackUsagePatterns: boolean
  }
  
  // Export & Delete
  dataManagement: {
    exportButton: () => void
    deleteAccountButton: () => void
    deleteConfirmation: string  // Type "DELETE" to confirm
  }
}
```


