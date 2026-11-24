import { SessionContext } from "./sessionContext";
import { authClient } from "../authClient";

export function SessionProvider({ children }) {
  const sessionState = authClient.useSession();

  return (
    <SessionContext.Provider value={sessionState}>
      {children}
    </SessionContext.Provider>
  );
}
