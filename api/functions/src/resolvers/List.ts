import * as fbAdmin from "firebase-admin";
import { List, Todo } from "../schema";

export default {
  async todos(list: List) {
    const querySnapshot = await fbAdmin
      .firestore()
      .collection("lists")
      .doc(list.id)
      .collection("todos")
      .get();
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id
        } as Todo)
    );
  }
};
