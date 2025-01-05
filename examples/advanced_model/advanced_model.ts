// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { Field, List, ObjectType, Tuple } from "@eyrie/app";

@ObjectType({ description: "The Message." })
export class Message {
  @Field({ description: "The ID of the Message.", type: String })
  id!: string;

  @Field({ description: "The details of the Message.", type: List(String) })
  details!: string[];

  @Field({
    description: "The sender of the Message.",
    type: Tuple(Number, String),
  })
  sender!: [number, string];
}
