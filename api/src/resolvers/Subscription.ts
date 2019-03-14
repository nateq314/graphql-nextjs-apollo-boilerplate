import { GooglePubSub } from "@axelspringer/graphql-google-pubsub";

const credentials = require("../../credentials.json");

// All received messages pass through here first.
// This is annoying but if we don't do this, the messages don't come through
const commonMessageHandler = (message: any) => {
  try {
    const utf8 = Buffer.from(message.data, "base64").toString("utf-8");
    return JSON.parse(utf8);
  } catch {
    return {};
  }
};

export const pubsub = new GooglePubSub(
  {
    projectId: "focus-champion-231019",
    credentials
  },
  undefined,
  commonMessageHandler
);

export const SOMETHING_CHANGED_TOPIC = "something_changed";

export default {
  somethingChanged: {
    resolve: (payload: any) => payload,
    subscribe: () => pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC)
  }
};
