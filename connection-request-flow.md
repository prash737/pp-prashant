
```mermaid
flowchart TD
    %% User Actions
    A["User clicks Add Connection button"] --> B["Add Connection Dialog opens"]
    B --> C["User searches for other users"]
    C --> D["API call: GET /api/users/search?q=searchTerm"]
    D --> E["Display search results with user cards"]
    E --> F["User clicks Send Request on a user card"]
    
    %% Connection Request Creation
    F --> G["API call: POST /api/connections/request"]
    G --> H{Check Authentication}
    H -->|No Token| I["Return 401 Unauthorized"]
    H -->|Valid Token| J["Extract user from Supabase session"]
    
    J --> K{Validate Request Data}
    K -->|Missing receiverId| L["Return 400 Bad Request"]
    K -->|Self request| M["Return 400 Cannot send to yourself"]
    K -->|Valid| N["Check if receiver exists in database"]
    
    N --> O{Receiver exists?}
    O -->|No| P["Return 404 User not found"]
    O -->|Yes| Q["Check for existing connection request"]
    
    Q --> R{Request already exists?}
    R -->|Yes| S["Return 400 Request already exists"]
    R -->|No| T["Check if already connected"]
    
    T --> U{Already connected?}
    U -->|Yes| V["Return 400 Already connected"]
    U -->|No| W["Create connection request in database"]
    
    W --> X["Return created request with sender/receiver details"]
    X --> Y["Update UI: Show Request Sent state"]
    
    %% Viewing Connection Requests
    Z["User navigates to Profile → Circle → Requests tab"] --> AA["Load ConnectionRequestsView component"]
    AA --> BB["API call: GET /api/connections/requests?type=received"]
    AA --> CC["API call: GET /api/connections/requests?type=sent"]
    
    BB --> DD{Check Authentication}
    CC --> DD
    DD -->|No Token| EE["Return 401 Unauthorized"]
    DD -->|Valid Token| FF["Query database for requests"]
    
    FF --> GG["For received: WHERE receiverId = currentUser.id"]
    FF --> HH["For sent: WHERE senderId = currentUser.id"]
    
    GG --> II["Include sender profile data"]
    HH --> JJ["Include receiver profile data"]
    
    II --> KK["Return received requests array"]
    JJ --> LL["Return sent requests array"]
    
    KK --> MM["Display in Received tab with Accept/Decline buttons"]
    LL --> NN["Display in Sent tab with status"]
    
    %% Responding to Connection Requests
    OO["User clicks Accept or Decline"] --> PP["API call: PUT /api/connections/requests/[id]"]
    PP --> QQ{Check Authentication}
    QQ -->|No Token| RR["Return 401 Unauthorized"]
    QQ -->|Valid Token| SS["Find connection request by ID"]
    
    SS --> TT{Request exists?}
    TT -->|No| UU["Return 404 Not found"]
    TT -->|Yes| VV{User is receiver?}
    
    VV -->|No| WW["Return 403 Unauthorized"]
    VV -->|Yes| XX{"Action = accept?"}
    
    XX -->|Accept| YY["Create connection in connections table"]
    XX -->|Decline| ZZ["Update request status to declined"]
    
    YY --> AAA["Set user1Id = sender, user2Id = receiver"]
    YY --> BBB["Set connectionType = friend"]
    YY --> CCC["Update request status to accepted"]
    
    ZZ --> DDD["Return success response"]
    CCC --> DDD
    
    DDD --> EEE["Refresh connection requests list"]
    EEE --> FFF["Update UI to show new connection status"]
    
    %% Viewing Connections
    GGG["User views Circle → All Connections"] --> HHH["Load CircleView component"]
    HHH --> III["API call: GET /api/connections"]
    III --> JJJ{Check Authentication}
    JJJ -->|No Token| KKK["Return 401 Unauthorized"]
    JJJ -->|Valid Token| LLL["Query connections where user1Id OR user2Id = currentUser.id"]
    
    LLL --> MMM["Include both user profiles for each connection"]
    MMM --> NNN["Return connections array with user details"]
    NNN --> OOO["Display connections in grid/list view"]
    OOO --> PPP["Show Remove button on each connection card"]
    
    %% Removing Connections
    QQQ["User clicks Remove on connection"] --> RRR["API call: DELETE /api/connections/[id]"]
    RRR --> SSS{Check Authentication}
    SSS -->|No Token| TTT["Return 401 Unauthorized"]
    SSS -->|Valid Token| UUU["Find connection by ID"]
    
    UUU --> VVV{Connection exists?}
    VVV -->|No| WWW["Return 404 Not found"]
    VVV -->|Yes| XXX{User is part of connection?}
    
    XXX -->|No| YYY["Return 403 Unauthorized"]
    XXX -->|Yes| ZZZ["Delete connection from database"]
    
    ZZZ --> AAAA["Return success response"]
    AAAA --> BBBB["Refresh connections list"]
    BBBB --> CCCC["Update UI to remove connection card"]
    
    %% Database Tables Involved
    DDDD["Database Operations"] --> EEEE["connection_requests table"]
    DDDD --> FFFF["connections table"]
    DDDD --> GGGG["profiles table"]
    
    EEEE --> HHHH["id, senderId, receiverId, message, status, createdAt"]
    FFFF --> IIII["id, user1Id, user2Id, connectionType, connectedAt"]
    GGGG --> JJJJ["id, firstName, lastName, profileImageUrl, role, bio"]
    
    %% Styling
    classDef apiCall fill:#e1f5fe,stroke:#01579b,color:#000
    classDef userAction fill:#f3e5f5,stroke:#4a148c,color:#000
    classDef decision fill:#fff3e0,stroke:#e65100,color:#000
    classDef database fill:#e8f5e8,stroke:#1b5e20,color:#000
    classDef error fill:#ffebee,stroke:#c62828,color:#000
    
    class G,D,BB,CC,PP,III,RRR apiCall
    class A,F,Z,OO,GGG,QQQ userAction
    class H,K,O,R,U,TT,VV,XX,JJJ,VVV,XXX decision
    class W,FF,YY,LLL,ZZZ database
    class I,L,M,P,S,V,RR,UU,WW,KKK,TTT,WWW,YYY error
```

## Connection Request Flow Overview

This flowchart shows the complete connection request system with the following key components:

### 1. **Connection Request Creation**
- User searches for other users via `/api/users/search`
- Sends connection request via `POST /api/connections/request`
- System validates authentication, checks for duplicates, and creates request

### 2. **Viewing Requests**
- Users can view received and sent requests via `/api/connections/requests`
- Requests are displayed in tabs with appropriate actions

### 3. **Responding to Requests**
- Receivers can accept/decline via `PUT /api/connections/requests/[id]`
- Accepting creates a new connection in the `connections` table
- Declining updates request status

### 4. **Managing Connections**
- Users view connections via `GET /api/connections`
- Can remove connections via `DELETE /api/connections/[id]`
- UI updates automatically after actions

### 5. **Database Tables**
- `connection_requests`: Stores pending/processed requests
- `connections`: Stores established connections
- `profiles`: User profile information for display

### 6. **Authentication & Authorization**
- All endpoints verify Supabase session tokens
- Users can only modify their own requests/connections
- Proper error handling for unauthorized access
