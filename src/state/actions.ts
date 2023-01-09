import { createAction } from "@reduxjs/toolkit";
import { ApiCredential } from "@/model/event";

type ApiCredentialPayload = {
  jiraToken: string;
  email: string;
  userDomain: string;
};

export const submitApiCredential = createAction<ApiCredentialPayload>("submitApiCredential");
export const submitApiCredentialFulfilled = createAction<ApiCredential>("submitApiCredentialFulfilled");
