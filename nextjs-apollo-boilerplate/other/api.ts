import { LINK_URI } from "../other/init-apollo";

interface FetchBody {
  [key: string]: any;
}

function doFetch(method: string, body: FetchBody) {
  return fetch(LINK_URI, {
    method,
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then((response) => {
    return response.json();
  });
}

export function get(body: FetchBody) {
  return doFetch("GET", body);
}
export function post(body: FetchBody) {
  return doFetch("POST", body);
}
