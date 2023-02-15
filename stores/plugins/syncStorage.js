import { SYSTEM_CONFIG } from "@/config/app.config";
import { isNull } from "lodash-es";

class SyncStorage {
  constructor(option) {
    /** init options */
    this.storage =
      (window && window[option.storage]) ||
      (window && window[SYSTEM_CONFIG.storage]);
    this.prefix = option.prefix || SYSTEM_CONFIG.prefix;
    this.user = "user";
    this.token = "token";

    console.log(
      "[pinia.SyncStorage] option:",
      option.storage || SYSTEM_CONFIG.storage,
      this.prefix,
      option,
    );
  }

  /**
   * Pinia subscribe plugin function.
   * @param {Object} store Pinia instance
   */
  async subscribe(store) {
    if (!this.checkStorage()) {
      throw new Error('[Pinia.SyncStorage] Invalid "Storage" instance given');
    }

    if (this.checkVersion(SYSTEM_CONFIG.version)) {
      console.log(
        `[Pinia.SyncStorage] Current version of the application "${SYSTEM_CONFIG.version}"`,
      );
    } else {
      console.warn(
        `[Pinia.SyncStorage] Application version updated to "${SYSTEM_CONFIG.version}"`,
      );
    }

    // init and apply user state from storage
    this.initUserState(store);

    store.$subscribe((mutation, state) => {
      // console.log("storage subscribe", mutation.type);
      if (mutation.storeId === "user") {
        if (!isNull(state.token)) {
          this.setToStorage(`${this.prefix}${this.token}`, state.token);
        }
        this.setToStorage(
          `${this.prefix}${this.user}`,
          JSON.stringify(state.user),
        );
      }
    });
  }

  /**
   * Check LocalStorage to read/write.
   */
  checkStorage() {
    try {
      this.storage.setItem(`${this.prefix}@@`, 1);
      this.storage.removeItem(`${this.prefix}@@`);
    } catch (err) {
      console.error(`[pinia.SyncStorage] Check storage failed: ${err}`);
      return false;
    }

    return true;
  }

  /**
   * Check application version.
   * If the version of the application has changed, then the storage is cleared of the session
   * and settings. Required to apply the settings of the new version of the application
   * @param {String} version version of the application
   */
  checkVersion(version) {
    try {
      if (this.getFromStorage(`${this.prefix}version`) === version) {
        return true;
      }

      this.storage.clear();
      this.setToStorage(`${this.prefix}version`, version);
    } catch (err) {
      console.error(`[pinia.SyncStorage] Check version failed: ${err}`);
    }
    return false;
  }

  /**
   * Get user info from storage.
   */
  initUserState(store) {
    const userState = this.getFromStorage(`${this.prefix}${this.user}`);
    const token = this.getFromStorage(`${this.prefix}${this.token}`) || null;
    if (userState) {
      const storageUserInfo = JSON.parse(userState);
      store.$state.token = storageUserInfo.jwt?.token || token;
      store.$state.role = storageUserInfo.role;
      store.$state.user = storageUserInfo;
      store.$state.name = storageUserInfo.name;
      store.$state.restaurantName = storageUserInfo.restaurant?.name;
      store.$state.restaurantID = storageUserInfo.restaurant?.id;
      store.$state.outletType = storageUserInfo.restaurant?.outlet_type;
      store.$state.restaurantInfo = storageUserInfo.restaurant;
      return true;
    }

    return false;
  }

  /**
   * Get data to storage.
   * @param {String} key
   * @param {String} value
   */
  setToStorage(key, value) {
    try {
      this.storage.setItem(key, value);
    } catch (err) {
      console.error(`[Pinia.SyncStorage] setItem storage failed: ${err}`);
      return false;
    }
    return true;
  }

  /**
   * Get data from storage.
   * @param {String} key
   */
  getFromStorage(key) {
    try {
      return this.storage.getItem(key);
    } catch (err) {
      console.error(`[Pinia.SyncStorage] getItem storage failed: ${err}`);
    }
    return "";
  }
}

export default function (store, syncStorageOption) {
  const syncStorage = new SyncStorage(syncStorageOption);
  return syncStorage.subscribe(store);
}
