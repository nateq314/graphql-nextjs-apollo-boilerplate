import { GooglePubSub } from "@axelspringer/graphql-google-pubsub";

const credentials = require("../../credentials.json");

export const pubsub = new GooglePubSub({
  projectId: "focus-champion-231019",
  credentials
});

export const SOMETHING_CHANGED_TOPIC = "something_changed";

export default {
  somethingChanged: {
    subscribe: () => pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC)
  }
};
