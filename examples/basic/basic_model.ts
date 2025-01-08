// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { Field, InputType, ObjectType } from "@eyrie/app";

@ObjectType({ description: "The Message." })
export class Message {
  @Field({ description: "The ID of the Message.", type: String })
  id!: string;

  @Field({ description: "The text content of the Message.", type: String })
  content!: string;
}

@InputType({ description: "Send Message DTO." })
export class SendMessageDto {
  @Field({ description: "The text content of the Message.", type: String })
  content!: string;
}
