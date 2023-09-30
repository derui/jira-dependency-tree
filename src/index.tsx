import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { v4 } from "uuid";
import { install } from "@twind/core";
import { env } from "./env";
import { createStore, RootState } from "./status/store";
import { createDependencyRegistrar } from "./utils/dependency-registrar";
import { Dependencies } from "./dependencies";
import { restoreApiCredential } from "./status/actions";
import { App } from "./app";
import config from "./twind.config.cjs";
import { RegistrarContext } from "./registrar-context";
import { getLatestCache } from "./status/middlewares/dexie";

// wiring depencencies

const registrar = createDependencyRegistrar<Dependencies>();
registrar.register("env", env);
registrar.register("generateId", () => v4());

const state = await getLatestCache();

const store = createStore(true, state);

const restoreCache = async function restoreCache() {
  const cache = await getLatestCache<RootState>();

  if (!cache) {
    return;
  }

  const { email, token, userDomain } = cache.apiCredential.credential ?? {};

  if (email && token && userDomain) {
    store.dispatch(
      restoreApiCredential({
        apiBaseUrl: env.apiBaseUrl,
        apiKey: env.apiKey,
        email: email,
        token: token,
        userDomain: userDomain,
      }),
    );
  }
};

restoreCache();

install(config, process.env.NODE_ENV === "production");

const root = createRoot(document.getElementById("root")!);

root.render(
  <RegistrarContext.Provider value={registrar}>
    <Provider store={store}>
      <App />
    </Provider>
  </RegistrarContext.Provider>,
);
