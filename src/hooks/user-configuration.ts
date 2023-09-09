import { useCallback, useContext } from "react";
import { useAppDispatch } from "./_internal-hooks";
import { useGetApiCredential } from "./get-api-credential";
import { ApiCredential } from "@/models/event";
import { submitApiCredentialFulfilled } from "@/status/actions";
import { FirstArg } from "@/utils/type-tool";
import { RegistrarContext } from "@/registrar-context";

type Result = {
  /**
   * apply credential
   */
  apply: (arags: { userDomain: string; token: string; email: string }) => void;

  state: {
    /**
     * credential
     */
    credential?: ApiCredential;

    setupFinished: boolean;
  };
};

export const useUserConfiguration = function useUserConfiguration(): Result {
  const context = useContext(RegistrarContext);
  const currentCredential = useGetApiCredential();
  const dispatch = useAppDispatch();
  const setupFinished = currentCredential !== undefined;
  const env = context.resolve("env");

  const apply = useCallback<Result["apply"]>(
    (args: FirstArg<Result["apply"]>) => {
      const cred = { ...args, ...env };

      dispatch(submitApiCredentialFulfilled(cred));
    },
    [env],
  );

  return {
    apply,
    state: {
      setupFinished,
      credential: currentCredential,
    },
  };
};
