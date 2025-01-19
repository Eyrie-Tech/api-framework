// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { HttpResponse, HttpResponses } from "@eyrie/app";
import { Message } from "./di_model.ts";

@HttpResponses({ description: "Responses" })
export class GetMessageResponses {
  @HttpResponse({
    description: "Successful response",
    status: "OK",
    type: Message,
    resolver(): boolean {
      return true;
    },
  })
  ok!: Message;
}
