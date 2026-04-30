# Security Specification: AgriAssist

## Data Invariants
1. A Diagnosis must belong to the user who created it and include a disease and treatment.
2. A ChatMessage must be linked to the authenticated user's ID.
3. User profiles are private and can only be managed by the owner.

## The Dirty Dozen (Test Matrix)
1. **Unauthenticated Read**: Attempting to read a user profile without signing in. (DENY)
2. **Identity Spoofing**: User A trying to read User B's diagnoses. (DENY)
3. **Foreign Write**: User A trying to add a message to User B's subcollection. (DENY)
4. **Invalid Keys**: Creating a diagnosis with a "isAdmin: true" ghost field. (DENY)
5. **Type Poisoning**: Sending a number into the `disease` string field. (DENY)
6. **Size Attack**: Sending a 2MB string as the `treatment`. (DENY)
7. **Timestamp Fraud**: Providing a manual, old `createdAt` timestamp instead of server time. (DENY)
8. **Path Variable Injection**: Using a 1KB string as `userId` in the document path. (DENY)
9. **Relational Orphan**: Creating a sub-diagnosis for a user that doesn't have a profile yet. (DENY)
10. **Immutable Violation**: Trying to change the `userId` of an existing diagnosis record. (DENY)
11. **State Shortcut**: (N/A for this simple app, but logic gates applied to status updates). (DENY)
12. **Blanket Query**: Querying all diagnoses across all users. (DENY)
