// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  Controller,
  Get,
  type Injectable,
  type InjectableRegistration,
} from "@eyrie/app";
import type { Message } from "./basic_model.ts";
import { GetMessagesResponses } from "./basic_response.ts";

@Controller("/messages")
export class MessageController implements Injectable {
  register(): InjectableRegistration {
    return { dependencies: [] };
  }

  @Get({
    description: "Get Messages.",
    path: "/",
    responses: GetMessagesResponses,
  })
  public getMessages(): Message[] {
    return [
      {
        id: "1",
        content: "Hello",
      },
      {
        id: "2",
        content: "Hiya",
      },
    ];
  }
}
