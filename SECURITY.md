# Security Policy

## Warning: Previous Credential Exposure

**The Supabase anon key was previously exposed in the git history of this repository** (commit `7f02e05`). While the `.env` file has since been untracked, the following actions are strongly recommended:

- **Repository owner:** Rotate your Supabase anon key immediately via the Supabase Dashboard > Project Settings > API > Regenerate anon key.
- **Fork users:** Do **not** copy credentials from git history. Create your own Supabase project and supply your own keys via `.env` (see `.env.example`).

## Scope

This security policy applies to the `right-issue` source code repository.

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main`  | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not open a public GitHub issue**.

Instead, report it responsibly:

1. Email the maintainers at the address listed on the GitHub repository profile, or
2. Open a [GitHub Security Advisory](https://github.com/alfindigital/right-issue/security/advisories/new) (private disclosure).

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

We aim to acknowledge reports within **48 hours** and will work with you to address the issue before public disclosure.

## Credential Hygiene for Contributors

- **Never commit** `.env` files -- they are in `.gitignore`
- Use `.env.example` to document required environment variables with placeholder values
- Never hardcode API keys, tokens, or URLs in source files -- use `import.meta.env.*` or `process.env.*`
- If you accidentally commit credentials, rotate them immediately and use `git filter-repo` or BFG to clean history

## Supabase Security Notes

- The `VITE_SUPABASE_PUBLISHABLE_KEY` is the *anon* (public) key -- it is safe to expose to browser clients **when Row Level Security (RLS) is properly configured** on all tables
- The *service role* key must **never** be used in frontend code -- use Supabase Edge Functions for privileged operations
- Always enable RLS on every Supabase table before going to production
