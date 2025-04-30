import { setSessionStorage } from "./sessionStorageUtil";

export const performLogout = () => {
    setSessionStorage("isAuthenticated", false);
    setSessionStorage("token", "");
};
