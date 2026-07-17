// Mirrors AUTH_COOKIE_NAME in apps/server/src/utils/constants.ts. The two apps
// are separate deployable units with no shared package for this, so this
// literal has to stay manually in sync with the backend's cookie name.
export const AUTH_COOKIE_NAME = "token";
