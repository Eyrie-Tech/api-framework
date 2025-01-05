// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import type { Message } from "@examples/di/di_model.ts";
import { MessageService } from "@examples/di/di_service.ts";
import {
  Controller,
  Get,
  type Injectable,
  type InjectableRegistration,
} from "@eyrie/app";
import { GetMessageResponses } from "./di_response.ts";

@Controller("/messages")
export class MessageController implements Injectable {
  readonly #messageService: MessageService;

  constructor(messageService: MessageService) {
    this.#messageService = messageService;
  }

  // Registration of this dependency is added within the class
  // and mandated by the presence of the `Controller` decorator.
  // As a function or promise, users retain full flexibility for
  // registration of dependencies.
  public register(): InjectableRegistration {
    return { dependencies: [{ class: MessageService }] };
  }

  @Get({
    description: "Get latest Message.",
    path: "/",
    responses: GetMessageResponses,
  })
  public getLatestMessage(): Message {
    return this.#messageService.getLatestMessage();
  }
}
