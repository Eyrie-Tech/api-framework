// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { HttpResponse, HttpResponses, List } from "@eyrie/app";
import { Message } from "./hook_model.ts";

@HttpResponses({ description: "Get Messages Responses" })
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

@HttpResponses({ description: "Send Message Responses" })
export class SendMessageResponses {
  @HttpResponse({
    description: "Successful response",
    status: "OK",
    type: Message,
    resolver(response): boolean {
      return typeof response === "object";
    },
  })
  ok!: Message;
}
