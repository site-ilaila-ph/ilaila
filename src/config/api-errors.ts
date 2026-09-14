export default {
  // Generic
  INVALID_JSON: {
    status: 400,
    code: "invalid-json",
    title: "Maling Request",
    detail: "Ang request body ay dapat na valid JSON.",
  },
  INVALID_URL: {
    status: 400,
    code: "invalid-url",
    title: "Maling Request",
    detail: "Ang request URL ay hindi wasto.",
  },
  ID_REQUIRED: {
    status: 400,
    code: "id-required",
    title: "Maling Request",
    detail: "Kinakailangan ng id.",
  },

  // Auth: sign-in
  SIGN_IN_FAILED: {
    status: 400,
    code: "sign-in-failed",
    title: "Maling Request",
    detail: "Nabigo ang pag-sign in.",
  },
  INVALID_CREDENTIALS: {
    status: 401,
    code: "invalid-credentials",
    title: "Hindi Autentificado",
    detail: "Di-wastong email o password.",
  },
  SIGN_IN_RATE_LIMITED: {
    status: 429,
    code: "sign-in-rate-limited",
    title: "Maraming Request",
    detail: "Napakaraming pagtatangka na mag-sign in. Pakisubukan muli sa ibang pagkakataon.",
  },
  SIGN_IN_UNAVAILABLE: {
    status: 500,
    code: "sign-in-unavailable",
    title: "Error sa Server",
    detail: "Ang sign in ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
  },

  // Auth: sign-out
  SIGN_OUT_FAILED: {
    status: 400,
    code: "sign-out-failed",
    title: "Maling Request",
    detail: "Nabigo ang pag-sign out.",
  },
  SIGN_OUT_UNAVAILABLE: {
    status: 500,
    code: "sign-out-unavailable",
    title: "Error sa Server",
    detail: "Ang sign out ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
  },

  // Auth: sign-up
  SIGN_UP_FAILED: {
    status: 400,
    code: "sign-up-failed",
    title: "Maling Request",
    detail: "Nabigo ang pag-sign up.",
  },
  SIGN_UP_INVALID: {
    status: 422,
    code: "sign-up-invalid",
    title: "Hindi Ma-process",
    detail: "Ang sign-up request ay hindi wasto.",
  },
  EMAIL_IN_USE: {
    status: 409,
    code: "email-in-use",
    title: "Salungatan",
    detail: "Mayroon nang account na may email na ito.",
  },
  SIGN_UP_RATE_LIMITED: {
    status: 429,
    code: "sign-up-rate-limited",
    title: "Maraming Request",
    detail: "Napakaraming pagtatangka na mag-sign up. Pakisubukan muli sa ibang pagkakataon.",
  },
  SIGN_UP_UNAVAILABLE: {
    status: 500,
    code: "sign-up-unavailable",
    title: "Error sa Server",
    detail: "Ang sign up ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
  },

  // Auth: forgot-password
  FORGOT_PASSWORD_FAILED: {
    status: 400,
    code: "forgot-password-failed",
    title: "Maling Request",
    detail: "Nabigo ang kahilingan sa pag-reset ng password.",
  },
  FORGOT_PASSWORD_RATE_LIMITED: {
    status: 429,
    code: "forgot-password-rate-limited",
    title: "Maraming Request",
    detail: "Napakaraming kahilingan sa pag-reset ng password. Pakisubukan muli sa ibang pagkakataon.",
  },
  FORGOT_PASSWORD_UNAVAILABLE: {
    status: 500,
    code: "forgot-password-unavailable",
    title: "Error sa Server",
    detail: "Ang pag-reset ng password ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
  },

  // Auth: update-password
  UPDATE_PASSWORD_FAILED: {
    status: 400,
    code: "update-password-failed",
    title: "Maling Request",
    detail: "Nabigo ang pag-update ng password.",
  },
  UPDATE_PASSWORD_UNAUTHORIZED: {
    status: 401,
    code: "update-password-unauthorized",
    title: "Hindi Autentificado",
    detail: "Hindi awtorisado ang pag-update ng password.",
  },
  UPDATE_PASSWORD_INVALID: {
    status: 422,
    code: "update-password-invalid",
    title: "Hindi Ma-process",
    detail: "Ang kahilingan sa pag-update ng password ay hindi wasto.",
  },
  UPDATE_PASSWORD_RATE_LIMITED: {
    status: 429,
    code: "update-password-rate-limited",
    title: "Maraming Request",
    detail: "Napakaraming pagtatangka na mag-update ng password. Pakisubukan muli sa ibang pagkakataon.",
  },
  UPDATE_PASSWORD_UNAVAILABLE: {
    status: 500,
    code: "update-password-unavailable",
    title: "Error sa Server",
    detail: "Ang pag-update ng password ay hindi available sa ngayon. Pakisubukan muli sa ibang pagkakataon.",
  },

  // App reviews
  APP_REVIEW_INVALID: {
    status: 400,
    code: "app-review-invalid",
    title: "Maling Request",
    detail: "Ang app review ay hindi mapatunayan.",
  },
  APP_REVIEW_INVALID_USER: {
    status: 400,
    code: "app-review-invalid-user",
    title: "Maling Request",
    detail: "Ang user para sa app review na ito ay hindi umiiral.",
  },
  APP_REVIEW_CONFLICT: {
    status: 409,
    code: "app-review-conflict",
    title: "Salungatan",
    detail: "Ang app review na ito ay mayroon na.",
  },

  // Businesses
  BUSINESS_NOT_FOUND: {
    status: 404,
    code: "business-not-found",
    title: "Hindi Nakita",
    detail: "Ang negosyo ay hindi umiiral.",
  },
  BUSINESS_ID_REQUIRED: {
    status: 400,
    code: "business-id-required",
    title: "Maling Request",
    detail: "Kinakailangan ng business id.",
  },
  BUSINESS_CONFLICT: {
    status: 409,
    code: "business-conflict",
    title: "Salungatan",
    detail: "Mayroon nang negosyo na may parehong mga field.",
  },
  BUSINESS_INVALID_REFERENCE: {
    status: 400,
    code: "business-invalid-reference",
    title: "Maling Request",
    detail: "Ang negosyo ay nagre-record ng record na hindi umiiral.",
  },

  // Foods
  FOOD_NOT_FOUND: {
    status: 404,
    code: "food-not-found",
    title: "Hindi Nakita",
    detail: "Ang pagkain ay hindi umiiral.",
  },
  FOOD_ID_REQUIRED: {
    status: 400,
    code: "food-id-required",
    title: "Maling Request",
    detail: "Kinakailangan ng food id.",
  },
  FOOD_CONFLICT: {
    status: 409,
    code: "food-conflict",
    title: "Salungatan",
    detail: "Mayroon nang pagkain na may parehong mga field.",
  },
  FOOD_INVALID_REFERENCE: {
    status: 400,
    code: "food-invalid-reference",
    title: "Maling Request",
    detail: "Ang pagkain ay nagre-record ng record na hindi umiiral.",
  },

  // Reviews
  REVIEW_NOT_FOUND: {
    status: 404,
    code: "review-not-found",
    title: "Hindi Nakita",
    detail: "Ang review ay hindi umiiral.",
  },
  REVIEW_ID_REQUIRED: {
    status: 400,
    code: "review-id-required",
    title: "Maling Request",
    detail: "Kinakailangan ng review id.",
  },

  // Users
  USER_NOT_FOUND: {
    status: 404,
    code: "user-not-found",
    title: "Hindi Nakita",
    detail: "Ang user ay hindi umiiral.",
  },
  USER_ID_REQUIRED: {
    status: 400,
    code: "user-id-required",
    title: "Maling Request",
    detail: "Kinakailangan ng user id.",
  },
  USER_CONFLICT: {
    status: 409,
    code: "user-conflict",
    title: "Salungatan",
    detail: "Ang user ay mayroon na.",
  },
  USER_INVALID_REFERENCE: {
    status: 400,
    code: "user-invalid-reference",
    title: "Maling Request",
    detail: "Ang user ay nagre-record ng record na hindi umiiral.",
  },
} as const satisfies Record<string, {
  status: number;
  code: string;
  title: string;
  detail: string;
}>;