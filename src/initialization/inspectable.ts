import Store from "./store.js";

export default class Inspectable {
    public static inspect<T extends Inspectable>(_obj: T) {
        return Store.get(this);
    }
}
