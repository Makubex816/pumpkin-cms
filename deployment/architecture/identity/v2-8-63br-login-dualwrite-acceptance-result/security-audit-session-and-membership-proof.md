# Security audit, session, and membership proof

Exactly two logical logins created exactly two `identity_login_dual_write` audits, one per request. Profile/authorization reads created no additional login audits. Session version remained compatible. Password fingerprints and login emails matched; membership counts remained one for each selected identity.

Vegas membership `236d4370c0d6eeadae6d06c50290837b` remains active TenantAdmin and primary admin for tenant UID `b3735ec299501035e4fa751f80940368`. SuperAdmin global authorization remains independent of its non-admin Ice membership.
