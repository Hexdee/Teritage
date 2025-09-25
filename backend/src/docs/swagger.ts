import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Teritage API",
      version: "1.0.0",
      description: "API documentation for Teritage inheritance platform"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ApiMessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" }
          }
        },
        VerificationTokenResponse: {
          type: "object",
          properties: {
            verificationToken: { type: "string" }
          }
        },
        AuthTokenResponse: {
          type: "object",
          properties: {
            token: { type: "string" }
          }
        },
        AuthSignInResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string", format: "email" },
                username: { type: "string", nullable: true }
              }
            }
          }
        },
        UsernameResponse: {
          type: "object",
          properties: {
            username: { type: "string" }
          }
        },
        TeritageUser: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            notes: { type: "string" }
          }
        },
        TeritageInheritor: {
          type: "object",
          properties: {
            address: { type: "string" },
            sharePercentage: { type: "integer", minimum: 1, maximum: 100 },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            notes: { type: "string" }
          }
        },
        TeritageToken: {
          type: "object",
          properties: {
            address: { type: "string", description: "Token contract address. Use 0x000... for HBAR." },
            type: { type: "string", enum: ["ERC20", "HTS", "HBAR"] }
          },
          required: ["type"],
          description: "Tracked token configuration for a Teritage plan"
        },
        TeritageActivity: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            description: { type: "string" },
            metadata: { type: "object" },
            timestamp: { type: "string", format: "date-time" }
          }
        },
        TeritageCheckIn: {
          type: "object",
          properties: {
            id: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            secondsSinceLast: { type: "integer" },
            timelinessPercent: { type: "integer" },
            triggeredBy: { type: "string" },
            note: { type: "string" }
          }
        },
        TeritagePlan: {
          type: "object",
          properties: {
            ownerAddress: { type: "string" },
            user: { $ref: "#/components/schemas/TeritageUser" },
            inheritors: {
              type: "array",
              items: { $ref: "#/components/schemas/TeritageInheritor" }
            },
            tokens: {
              type: "array",
              items: { $ref: "#/components/schemas/TeritageToken" }
            },
            checkInIntervalSeconds: { type: "integer" },
            lastCheckInAt: { type: "string", format: "date-time" },
            isClaimInitiated: { type: "boolean" },
            activities: {
              type: "array",
              items: { $ref: "#/components/schemas/TeritageActivity" }
            },
            checkIns: {
              type: "array",
              items: { $ref: "#/components/schemas/TeritageCheckIn" }
            },
            socialLinks: {
              type: "array",
              items: { type: "string", format: "uri" }
            },
            notifyBeneficiary: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        TeritageStatus: {
          type: "object",
          properties: {
            lastCheckInAt: { type: "string", format: "date-time" },
            nextCheckInDueAt: { type: "string", format: "date-time" },
            secondsUntilDue: { type: "integer" },
            isOverdue: { type: "boolean" },
            isClaimInitiated: { type: "boolean" }
          }
        },
        TeritagePlanResponse: {
          type: "object",
          properties: {
            plan: { $ref: "#/components/schemas/TeritagePlan" }
          }
        },
        TeritagePlanWithStatusResponse: {
          type: "object",
          properties: {
            plan: { $ref: "#/components/schemas/TeritagePlan" },
            status: { $ref: "#/components/schemas/TeritageStatus" }
          }
        },
        TeritageActivitiesResponse: {
          type: "object",
          properties: {
            activities: {
              type: "array",
              items: { $ref: "#/components/schemas/TeritageActivity" }
            }
          }
        },
        TeritageCheckInsResponse: {
          type: "object",
          properties: {
            checkIns: {
              type: "array",
              items: { $ref: "#/components/schemas/TeritageCheckIn" }
            }
          }
        },
        TeritageLatestCheckInResponse: {
          type: "object",
          properties: {
            latest: { $ref: "#/components/schemas/TeritageCheckIn" }
          }
        },
        HederaTokenBalance: {
          type: "object",
          properties: {
            tokenId: { type: "string" },
            symbol: { type: "string" },
            name: { type: "string" },
            decimals: { type: "integer" },
            balance: { type: "number" },
            priceUsd: { type: "number" },
            change24hPercent: { type: "number" },
            iconUrl: { type: "string", format: "uri", nullable: true }
          }
        },
        WalletTokensResponse: {
          type: "object",
          properties: {
            tokens: {
              type: "array",
              items: { $ref: "#/components/schemas/HederaTokenBalance" }
            }
          }
        },
        WalletSummary: {
          type: "object",
          properties: {
            totalPortfolioValueUsd: { type: "number" },
            change24hPercent: { type: "number" },
            assignedPercentage: { type: "number" },
            unallocatedPercentage: { type: "number" },
            notifyBeneficiary: { type: "boolean" },
            socialLinks: {
              type: "array",
              items: { type: "string", format: "uri" }
            },
            tokenCount: { type: "integer" }
          }
        },
        WalletSummaryResponse: {
          type: "object",
          properties: {
            summary: { $ref: "#/components/schemas/WalletSummary" }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"]
});
