flowchart TD
    Start([Start Migration]) --> Phase1[Phase 1: Foundation Setup]

    %% Phase 1: Foundation Setup
    Phase1 --> P1D1[Day 1-2: Dependencies & Config]
    P1D1 --> P1D1a[Install drizzle-orm, drizzle-kit, @types/pg, pg]
    P1D1a --> P1D1b[Create drizzle.config.ts]
    P1D1b --> P1D1c[Setup lib/db/schema/ directory]
    P1D1c --> P1D1d[Configure environment variables]

    P1D1d --> P1D2[Day 3-5: Schema Translation]
    P1D2 --> P1D2a[Convert Prisma enums to Drizzle]
    P1D2a --> P1D2b[Create schema files: enums.ts]
    P1D2b --> P1D2c[Create profiles.ts schema]
    P1D2c --> P1D2d[Create students.ts schema]
    P1D2d --> P1D2e[Create mentors.ts schema]
    P1D2e --> P1D2f[Create institutions.ts schema]
    P1D2f --> P1D2g[Create connections.ts schema]
    P1D2g --> P1D2h[Create feed.ts schema]
    P1D2h --> P1D2i[Create skills-interests.ts schema]

    P1D2i --> P1D3[Day 6-7: Database Connection]
    P1D3 --> P1D3a[Create lib/db/drizzle.ts client]
    P1D3a --> P1D3b[Setup connection pooling]
    P1D3b --> P1D3c[Test basic connection]

    P1D3c --> Phase2[Phase 2: Core API Migration]

    %% Phase 1: Foundation Setup ⏱️ **3 Days (August 12-14)**

    %% **Status:** ✅ **COMPLETED (August 14, 2025)**
    %% **Priority:** 🔥 Critical Foundation

    ### Day 1 (August 12): Configuration & Core Setup
    - [x] **Install Drizzle Dependencies** `drizzle-orm drizzle-kit @types/pg pg`
    - [x] **Create drizzle.config.ts** - Database configuration
    - [x] **Setup lib/db/drizzle.ts** - Database client initialization
    - [x] **Create lib/db/schema/enums.ts** - Convert Prisma enums
    - [x] **Initial schema structure** - Base table definitions

    ### Day 2 (August 13): Schema Migration Foundation  
    - [x] **Create lib/db/schema/profiles.ts** - User profiles schema
    - [x] **Setup lib/db/schema/index.ts** - Schema exports
    - [x] **Create migration documentation** - Migration strategy & plan
    - [x] **Test basic database connection** - Verify Drizzle setup

    ### Day 3 (August 14): Schema Completion & Testing
    - [x] **Complete remaining core schemas** - Students, mentors, institutions
    - [x] **Create relationship mappings** - Foreign keys and relations
    - [x] **Setup development workflows** - Scripts and commands
    - [x] **Documentation finalization** - Complete migration plan

    %% Phase 2: API Layer Migration ⏱️ **2 Weeks (August 15-29)**

    **Status:** 🔄 **READY TO START (August 15, 2025)**
    **Priority:** 🟠 High Impact

    %% Phase 2: Core API Migration
    Phase2 --> P2W1[Week 2: Authentication & Profile APIs]
    P2W1 --> P2W1a[Migrate lib/services/auth-service.ts]
    P2W1a --> P2W1b[Update 8 authentication endpoints]
    P2W1b --> P2W1c[Migrate 2 profile management APIs]
    P2W1c --> P2W1d[Update lib/db/profile.ts utilities]
    P2W1d --> P2W1e[Update lib/db/auth.ts utilities]

    P2W1e --> P2W2[Week 3: User Management APIs]
    P2W2 --> P2W2a[Migrate 4 student APIs]
    P2W2a --> P2W2b[Update 12 institution APIs]
    P2W2b --> P2W2c[Migrate skills/interests APIs]
    P2W2c --> P2W2d[Update lib/db-utils.ts]

    P2W2d --> Phase3[Phase 3: Feature Migration]

    %% Phase 3: Feature Migration
    Phase3 --> P3W1[Week 4: Social Features]
    P3W1 --> P3W1a[Migrate 5 connection system APIs]
    P3W1a --> P3W1b[Update 4 circles functionality APIs]
    P3W1b --> P3W1c[Migrate 2 messaging APIs]

    P3W1c --> P3W2[Week 5: Content & Feed]
    P3W2 --> P3W2a[Migrate 8 feed system APIs]
    P3W2a --> P3W2b[Update goals/achievements APIs]
    P3W2b --> P3W2c[Migrate 10 parent management APIs]

    P3W2c --> Phase4[Phase 4: Component Updates]

    %% Phase 4: Component Updates
    Phase4 --> P4W1[Week 6: Profile Components]
    P4W1 --> P4W1a[Update 8 profile form components]
    P4W1a --> P4W1b[Migrate 35+ profile display components]
    P4W1b --> P4W1c[Update 15+ onboarding components]

    P4W1c --> P4W2[Week 7: Feed & Social Components]
    P4W2 --> P4W2a[Update 15+ feed components]
    P4W2a --> P4W2b[Migrate notification system]
    P4W2b --> P4W2c[Update messaging interface components]

    P4W2c --> Phase5[Phase 5: Data Migration & Testing]

    %% Phase 5: Data Migration & Testing
    Phase5 --> P5Data[Data Migration Strategy]
    P5Data --> P5Data1[Create migration scripts]
    P5Data1 --> P5Data2[Setup dual-write system]
    P5Data2 --> P5Data3[Validate data integrity]
    P5Data3 --> P5Data4[Performance testing]

    P5Data4 --> P5Test[Testing Protocol]
    P5Test --> P5Test1[Unit tests for API endpoints]
    P5Test1 --> P5Test2[Integration tests for workflows]
    P5Test2 --> P5Test3[End-to-end testing]
    P5Test3 --> P5Test4[Load testing]

    P5Test4 --> Phase6[Phase 6: Deployment & Monitoring]

    %% Phase 6: Deployment & Monitoring
    Phase6 --> P6Deploy[Deployment Strategy]
    P6Deploy --> P6Deploy1[Blue-green deployment]
    P6Deploy1 --> P6Deploy2[Database connection switchover]
    P6Deploy2 --> P6Deploy3[Monitor error rates]
    P6Deploy3 --> P6Deploy4[Rollback plan ready]

    P6Deploy4 --> P6Cleanup[Post-Migration Cleanup]
    P6Cleanup --> P6Cleanup1[Remove Prisma dependencies]
    P6Cleanup1 --> P6Cleanup2[Delete prisma/ directory]
    P6Cleanup2 --> P6Cleanup3[Update documentation]
    P6Cleanup3 --> P6Cleanup4[Clean unused imports]

    P6Cleanup4 --> Complete([Migration Complete])

    %% Risk Mitigation
    Phase1 -.-> Risk1[Risk Mitigation]
    Phase2 -.-> Risk1
    Phase3 -.-> Risk1
    Phase4 -.-> Risk1
    Phase5 -.-> Risk1
    Phase6 -.-> Risk1

    Risk1 --> Risk1a[Parallel Development]
    Risk1 --> Risk1b[Feature Flags]
    Risk1 --> Risk1c[Comprehensive Backup]
    Risk1 --> Risk1d[API Response Format Preservation]
    Risk1 --> Risk1e[Database Relationship Preservation]

    %% Success Metrics
    Complete --> Success[Success Metrics]
    Success --> Success1[Zero Downtime ✓]
    Success --> Success2[Same/Better Performance ✓]
    Success --> Success3[100% Data Integrity ✓]
    Success --> Success4[All Features Working ✓]
    Success --> Success5[Reduced Query Complexity ✓]

    %% Critical Files to Migrate
    subgraph CriticalFiles["Critical Files to Update"]
        CF1[lib/services/auth-service.ts]
        CF2[app/api/auth/*/route.ts - 8 files]
        CF3[app/api/profile/*/route.ts - 2 files]
        CF4[app/api/student/*/route.ts - 4 files]
        CF5[app/api/institution/*/route.ts - 12 files]
        CF6[app/api/connections/*/route.ts - 5 files]
        CF7[app/api/feed/*/route.ts - 8 files]
        CF8[components/profile/forms/*.tsx - 8 files]
        CF9[components/profile/*.tsx - 35+ files]
        CF10[app/notifications/page.tsx]
    end

    %% Database Tables Priority
    subgraph DatabaseTables["Database Schema Priority"]
        DB1[High Priority: profiles, student_profiles, mentor_profiles]
        DB2[High Priority: institution_profiles, skills, interests]
        DB3[Medium Priority: connections, feed_posts, circles]
        DB4[Low Priority: mood_board, social_links, achievements]
    end

    %% Styling
    classDef phase fill:#e1f5fe,stroke:#01579b,color:#000
    classDef week fill:#f3e5f5,stroke:#4a148c,color:#000
    classDef day fill:#fff3e0,stroke:#e65100,color:#000
    classDef task fill:#e8f5e8,stroke:#1b5e20,color:#000
    classDef risk fill:#ffebee,stroke:#c62828,color:#000
    classDef success fill:#e0f2f1,stroke:#00695c,color:#000
    classDef critical fill:#fff8e1,stroke:#f57f17,color:#000

    class Phase1,Phase2,Phase3,Phase4,Phase5,Phase6 phase
    class P2W1,P2W2,P3W1,P3W2,P4W1,P4W2 week
    class P1D1,P1D2,P1D3 day
    class P1D1a,P1D1b,P1D1c,P1D1d,P1D2a,P1D2b,P1D2c,P1D2d,P1D2e,P1D2f,P1D2g,P1D2h,P1D2i,P1D3a,P1D3b,P1D3c task
    class P2W1a,P2W1b,P2W1c,P2W1d,P2W1e,P2W2a,P2W2b,P2W2c,P2W2d task
    class P3W1a,P3W1b,P3W1c,P3W2a,P3W2b,P3W2c task
    class P4W1a,P4W1b,P4W1c,P4W2a,P4W2b,P4W2c task
    class P5Data1,P5Data2,P5Data3,P5Data4,P5Test1,P5Test2,P5Test3,P5Test4 task
    class P6Deploy1,P6Deploy2,P6Deploy3,P6Deploy4,P6Cleanup1,P6Cleanup2,P6Cleanup3,P6Cleanup4 task
    class Risk1,Risk1a,Risk1b,Risk1c,Risk1d,Risk1e risk
    class Success,Success1,Success2,Success3,Success4,Success5 success
    class CF1,CF2,CF3,CF4,CF5,CF6,CF7,CF8,CF9,CF10 critical
    class DB1,DB2,DB3,DB4 critical