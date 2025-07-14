// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import { Application } from "@eyrie/app";
import { MessageController } from "./hook_controller.ts";

const app = new Application();

app.registerVersion({
  version: "v1",
  controllers: [MessageController],
});

app.addHook("onRequest", (request: Request) => {
  request.headers.set("onRequest", "true");
});

await app.listen();
