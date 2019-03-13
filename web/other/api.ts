import { LINK_URI } from "../other/init-apollo";

interface FetchBody {
  [key: string]: any;
}

function getSessionCookie(res: Response) {
  const setCookieHeader = res.headers.get("set-cookie");
  if (setCookieHeader) {
    const sessionCookieMatches = setCookieHeader.match(/session=(.+?);/);
    if (sessionCookieMatches) {
      return sessionCookieMatches[1];
    }
  }
}

function doFetch(method: string, body: FetchBody) {
  let session: string | undefined;
  return fetch(LINK_URI, {
    method,
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
    .then((response) => {
      session = getSessionCookie(response);
      return response.json();
    })
    .then((jsonResponse) => {
      jsonResponse = {
        ...jsonResponse,
        session
      };
      return jsonResponse;
    });
}

export function get(body: FetchBody) {
  return doFetch("GET", body);
}
export function post(body: FetchBody) {
  return doFetch("POST", body);
}
