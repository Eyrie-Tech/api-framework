// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  type Context,
  Controller,
  Get,
  type Injectable,
  type InjectableRegistration,
  Post,
} from "@eyrie/app";
import { type Message, SendMessageDto } from "./basic_model.ts";
import {
  GetMessagesResponses,
  SendMessageResponses,
} from "./basic_response.ts";

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
  public getMessages(_context: Context, _params: unknown): Message[] {
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

  @Post({
    description: "Send Message.",
    path: "/",
    responses: SendMessageResponses,
    body: SendMessageDto,
  })
  public sendMessage(
    _context: Context,
    _params: unknown,
    body: SendMessageDto,
  ): Message {
    return {
      ...body,
      id: Math.ceil(Math.random() * 1000).toString(),
    };
  }
}
