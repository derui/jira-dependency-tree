import { createRoot } from "react-dom/client";
import { BehaviorSubject } from "rxjs";
import { createDraftSafeSelector } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { v4 } from "uuid";
import { install } from "@twind/core";
import { SettingArgument } from "./models/setting";
import { makeStorageDriver, StorageSink } from "./drivers/storage";
import { env } from "./env";
import { createStore, RootState } from "./status/store";
import { createDependencyRegistrar } from "./utils/dependency-registrar";
import { Dependencies } from "./dependencies";
import { restoreApiCredential } from "./status/actions";
import { App } from "./app";
import config from "./twind.config.cjs";
import { RegistrarContext } from "./registrar-context";

// wiring depencencies

const registrar = createDependencyRegistrar<Dependencies>();
registrar.register("env", env);
registrar.register("generateId", () => v4());

const store = createStore();

// wiring storage driver
const storageDriver = makeStorageDriver("jiraDependencyTree", localStorage);

const storageSubject = new BehaviorSubject<StorageSink | undefined>(undefined);

storageDriver(storageSubject)
  .select<SettingArgument>("settings")
  .subscribe((v) => {
    const email = v.credentials?.email;
    const userDomain = v.userDomain;
    const token = v.credentials?.jiraToken;

    if (email && userDomain && token) {
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
  });

const selectCredential = createDraftSafeSelector(
  (state: RootState) => state,
  (state) => state.apiCredential.credential,
);

store.subscribe(() => {
  const credential = selectCredential(store.getState());

  if (credential) {
    storageSubject.next({
      settings: {
        userDomain: credential.userDomain,
        credentials: {
          email: credential.email,
          jiraToken: credential.token,
        },
      },
    } as SettingArgument);
  }
});

install(config, process.env.NODE_ENV === "production");

const root = createRoot(document.getElementById("root")!);

root.render(
  <RegistrarContext.Provider value={registrar}>
    <Provider store={store}>
      <App />
    </Provider>
  </RegistrarContext.Provider>,
);
