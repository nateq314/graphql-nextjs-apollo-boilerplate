import * as firebaseAdmin from "firebase-admin";
import { AuthError } from "./utils";

const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    // TODO: replace these with env variables
    projectId: "focus-champion-231019",
    clientEmail: "665094268382-compute@developer.gserviceaccount.com",
    privateKey:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIFTMejAgimTu/\noNRnRmGPN27yyARRJzLkbsy91DukF1ld4WAlGKpfu+foOhGE4Hn9+34l+IZ6EYYi\nkWcXrEsdSnl+/IQ7yZxTEsdZzGM+yX30JXwhmtb3Qka3KJ93P94L5FUvHEIZkLj5\nbIhZWK6IMEf3D91+0U0tagO3jSka40pfvABNTr+k2xVwKatDtzDlGyjSgwjR2wC3\nxKxj92VP/QLdpYpKHAlTTxjwDZ3UbZp/sMrSUnNpxtv8i6cS/nGJG3XyLGn/YKpW\n5N/dEaSOluifrD/WMctQQLvIBxBnn/RPSU4F+I8Baj0Ya7RQQwfUV/9/jjbyZPIR\n4p9QvqYVAgMBAAECggEADUX4GIcE+c6dO8Qz8w9POjdc4Tb1r7CLBsPMSgJCBqEU\nk6QiQwkU3GRUfn/Drm353yiHoNs7iJjlriC5QcUd9+PQlY+znLJuRXCR0Fo9HJWK\nCTVSESSlgs0Jxe19pA/qRMhcAlO8lYJCqIFTtkxUymzG3r6rB1Zj6VGxd27M6Eny\nY7HSS57jYQd11YdtVG5d6kutVCSrLp6PwK3Y1989VU9lDWONBqcd9q0i2199SWq0\nQQcD5/bcZABp7AwkYIBUZKMXlQaELpSjKC6FPbQm6Nn8nbV3YnsbHCBHV/Lbfm07\ndoKRpQqKJKznWWUitz3fBOFvON8bd4pcuft34dlFwQKBgQDv+xDZVy2WWCcPPx1F\nasgJq4FyYl36Ony9QY9oJx0sm3+y7YOdqZ3ibRNyqfcqvPsaLfEc0o9gZfvbYs1c\nNGDD5TYBS74ePLrgzWs94cwYIleHjKcQ3VCW1q6bt+qvxeDuANpRFEX1lGYT3dLo\nQZz7VlJfF/ZGau7KQhrl1PdMZQKBgQDVcFWd25UetKjJJqt3bBk7y3S3r2dq69IB\nAkXmQjm3XhEGuJI1Mm8AqGGY26DDoNbqKn9sbNhZXhIi8OKZBvetEq8YMr3BSI5o\nKBVZ5YVhQxNOzKu8aQV2E1keicnvnsdpeqb0zVY92fcRcUoauKBheU3of2bZ5l65\nbTMxRTmf8QKBgFRzfwdtJW7OENjNtihSnpjAkSpGsZm4cWNMqgHWGe8zvami6flW\n0mf3SKvGYmPY42jgGASzmJ8s5Ifc6jXzfMYTaIDmPb54Uq9/uqipSGCJ3VGnTreh\nmpWqcQH9pAo9UZ2QEUQNJV153r5JBsqTJIJSa2Rpk1JOmT/2KW8OFgT9AoGBAJAr\nrOlQJU30Yf5dbHziO7k0GMbqaETEvbmIu4ZpPWsq0v1jNv9P7cLX+fSyhcken4zU\n3/VxIEJdVIrdg3IyTqJNeJAz1hD03ZxlVua+LnYgRK55eZduqQ20zAHguNJuwevx\nuUyqVpK45DaX+6JJC6xLr+BYDjUpctp1dJrXU7FBAoGACqRZwOMT0COaRwilJsSp\nRVm47KC5n6Vnqg1bs5qBOKYeE94LFqMPXRO6h7Woq+1ffmBtISGErn8QlftMeJlX\nDvDxbmMEO8iZqBRazKwAn2+rbt2ANcboicbWaK79G4LK8SUUNBpvHkOgJmwE7eSK\nZOAaKbWZVUbQSpGzHOOu974=\n-----END PRIVATE KEY-----\n"
  }),
  databaseURL: "https://focus-champion-231019.firebaseio.com"
});

// returns cookie token
async function createUserSessionToken(
  args: any,
  decodedIdToken?: firebaseAdmin.auth.DecodedIdToken
) {
  // Get the ID token.
  const idToken = args.idToken.toString();
  // Only process if the user just signed in in the last 5 minutes.
  // To guard against ID token theft, reject and require re-authentication.
  if (!decodedIdToken) {
    // tslint:disable-next-line:no-parameter-reassignment
    decodedIdToken = await admin.auth().verifyIdToken(idToken);
  }
  if (!(new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60))
    throw new AuthError({ message: "Recent sign-in required!" });

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  const sessionCookie = await admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .catch((error) => {
      console.error(error);
      throw new AuthError({
        message: "User Session Token Creation Error",
        stack: error
      });
    });
  return [sessionCookie, expiresIn] as [string, number];
}

// Returns decoded user claims
async function verifyUserSessionToken(token: string) {
  // Verify session cookies tokens with firebase admin.
  // This is a low overhead operation.
  try {
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(token, true /** checkRevoked */);
    return decodedClaims;
  } catch {
    throw new AuthError({ message: "User Session Token Verification Error" });
  }
}

// Sets properties into firebase user
function setUserClaims(uid: string, data: any) {
  return admin.auth().setCustomUserClaims(uid, data);
}

function getUserRecord(uid: string) {
  return admin.auth().getUser(uid);
}

function verifyIdToken(idToken: string) {
  return admin.auth().verifyIdToken(idToken);
}

export {
  createUserSessionToken,
  getUserRecord,
  setUserClaims,
  verifyIdToken,
  verifyUserSessionToken
};
