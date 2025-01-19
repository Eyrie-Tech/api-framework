// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  Controller,
  Get,
  type Injectable,
  type InjectableRegistration,
  type Responses,
} from "@eyrie/app";
import { GetMessagesResponses } from "./advanced_response.ts";
import { MessageService } from "./advanced_service.ts";

@Controller("/messages")
export class MessageController implements Injectable {
  readonly #messageService: MessageService;

  constructor(messageService: MessageService) {
    this.#messageService = messageService;
  }

  public register(): InjectableRegistration {
    return { dependencies: [{ class: MessageService }] };
  }

  @Get({
    path: "/",
    description: "Description",
    responses: GetMessagesResponses,
  })
  public getMessages(): Responses<GetMessagesResponses> {
    return this.#messageService.getMessages();
  }
}
