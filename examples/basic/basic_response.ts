// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { HttpResponse, HttpResponses, List } from "@eyrie/app";
import { Message } from "./basic_model.ts";

@HttpResponses({ description: "Responses" })
export class GetMessagesResponses {
  @HttpResponse({
    description: "Successful response",
    status: "OK",
    type: List(Message),
    resolver(response): boolean {
      return Array.isArray(response);
    },
  })
  ok!: Message[];
}
