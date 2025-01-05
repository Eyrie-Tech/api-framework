// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

import {
  type ClassType,
  Context,
  Controller,
  Field,
  HttpMethod,
  type InjectableRegistration,
  InputType,
  Post,
  RouteDecoratorError,
} from "@eyrie/app";
import {
  assert,
  assertEquals,
  assertInstanceOf,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { createControllerWithPostRoute } from "./utils/controller_utils.ts";
import { setupApplication, setupPermissions } from "./utils/setup_utils.ts";

Deno.test({
  name: "Post() registers a POST route",
  permissions: setupPermissions(),
  async fn() {
    // Arrange
    const { controller, input } = createControllerWithPostRoute(
      "/messages",
      { path: "/" },
    );
    await using setup = await setupApplication([controller]);
    const url = new URL("/v1/messages", setup.origin);

    // Act
    const response = await fetch(url, { method: HttpMethod.POST });
    const text = await response.text();

    // Assert
    assertStrictEquals(response.status, STATUS_CODE.OK, text);
    assertStrictEquals(response.statusText, STATUS_TEXT[STATUS_CODE.OK], text);
    assertStrictEquals(text, "");
    assertInstanceOf(input.ctx, Context);
    assertEquals(input.params, {});
    assert(input.body === undefined);
  },
});

[
  {
    test:
      "Post() registers a POST route with a request body containing a string scalar type field",
    testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
      @InputType({ description: "Input" })
      class Input {
        @Field({ description: "String", type: String })
        string!: string;
      }
      const input: Input = { string: "Hello" };
      return [Input as T, input as InstanceType<T>];
    },
  },
  {
    test:
      "Post() registers a POST route with a request body containing a boolean scalar type field",
    testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
      @InputType({ description: "Input" })
      class Input {
        @Field({ description: "Boolean", type: Boolean })
        boolean!: boolean;
      }
      const input: Input = { boolean: true };
      return [Input as T, input as InstanceType<T>];
    },
  },
  {
    test:
      "Post() registers a POST route with a request body containing a number scalar type field",
    testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
      @InputType({ description: "Input" })
      class Input {
        @Field({ description: "Number", type: Number })
        number!: number;
      }
      const input: Input = { number: 7 };
      return [Input as T, input as InstanceType<T>];
    },
  },
  {
    test:
      "Post() registers a POST route with a request body containing a nested object type field",
    testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
      @InputType({ description: "NestedInput" })
      class NestedInput {
        @Field({ description: "Nested String", type: String })
        string!: string;
      }
      @InputType({ description: "Input" })
      class Input {
        @Field({ description: "NestedInput", type: NestedInput })
        nested!: NestedInput;
      }
      const input: Input = { nested: { string: "Hello nested!" } };
      return [Input as T, input as InstanceType<T>];
    },
  },
  {
    test:
      "Post() registers a POST route with a request body containing multiple type fields",
    testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
      @InputType({ description: "NestedInput" })
      class NestedInput {
        @Field({ description: "Nested String", type: String })
        nestedString!: string;
        @Field({ description: "Nested Number", type: Number })
        nestedNumber!: number;
        @Field({ description: "Nested Boolean", type: Boolean })
        nestedBoolean!: boolean;
      }
      @InputType({ description: "Input" })
      class Input {
        @Field({ description: "String", type: String })
        string!: string;
        @Field({ description: "Boolean", type: Boolean })
        boolean!: boolean;
        @Field({ description: "Number", type: Number })
        number!: number;
        @Field({ description: "NestedInput", type: NestedInput })
        nested!: NestedInput;
      }
      const input: Input = {
        string: "Hello root!",
        boolean: true,
        number: 7,
        nested: {
          nestedString: "Hello nested!",
          nestedNumber: 8,
          nestedBoolean: false,
        },
      };
      return [Input as T, input as InstanceType<T>];
    },
  },
].forEach(({ test, testInput }) => {
  Deno.test({
    name: test,
    permissions: setupPermissions(),
    async fn() {
      // Arrange
      const [Input, inputBody] = testInput();
      const { controller, input } = createControllerWithPostRoute(
        "/messages",
        { path: "/", body: Input },
      );
      await using setup = await setupApplication([controller]);
      const url = new URL("/v1/messages", setup.origin);
      const headers = new Headers({ "content-type": "application/json" });

      // Act
      const response = await fetch(url, {
        method: HttpMethod.POST,
        body: JSON.stringify(inputBody),
        headers,
      });
      const text = await response.text();

      // Assert
      assertStrictEquals(response.status, STATUS_CODE.OK, text);
      assertStrictEquals(
        response.statusText,
        STATUS_TEXT[STATUS_CODE.OK],
        text,
      );
      assertStrictEquals(text, "");
      assertInstanceOf(input.ctx, Context);
      assertEquals(input.params, {});
      assertInstanceOf(input.body, Input);
      assertEquals(JSON.parse(JSON.stringify(input.body)), inputBody);
    },
  });
});

// TODO: uncomment
// [
//   {
//     test: "response of type string",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       const outputBody: string = "hello";
//       return [String as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type number",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       const outputBody: number = 1234.56;
//       return [Number as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type boolean",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       const outputBody: boolean = true;
//       return [Boolean as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type object with string field",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @ObjectType({ description: "Output" })
//       class Output {
//         @Field({ description: "string", type: String })
//         string!: string;
//       }
//       const outputBody: Output = { string: "hello" };
//       return [Output as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type object with number field",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @ObjectType({ description: "Output" })
//       class Output {
//         @Field({ description: "number", type: Number })
//         number!: number;
//       }
//       const outputBody: Output = { number: 1234.56 };
//       return [Output as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type object with boolean field",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @ObjectType({ description: "Output" })
//       class Output {
//         @Field({ description: "boolean", type: Boolean })
//         boolean!: boolean;
//       }
//       const outputBody: Output = { boolean: true };
//       return [Output as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type object with nested object field",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @InputType({ description: "NestedInput" })
//       class NestedOutput {
//         @Field({ description: "Nested String", type: String })
//         nestedString!: string;
//       }

//       @ObjectType({ description: "Output" })
//       class Output {
//         @Field({ description: "Nested object", type: NestedOutput })
//         nestedOutput!: NestedOutput;
//       }
//       const outputBody: Output = {
//         nestedOutput: { nestedString: "Nested string" },
//       };
//       return [Output as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type object with string array field",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @ObjectType({ description: "Output" })
//       class Output {
//         @Field({ description: "string", type: List(String) })
//         string!: string[];
//       }
//       const outputBody: Output = { string: ["hello", "there"] };
//       return [Output as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type object with number array field",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @ObjectType({ description: "Output" })
//       class Output {
//         @Field({ description: "number", type: List(Number) })
//         number!: number[];
//       }
//       const outputBody: Output = { number: [1234.56, 78.9] };
//       return [Output as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type object with boolean array field",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @ObjectType({ description: "Output" })
//       class Output {
//         @Field({ description: "boolean", type: List(Boolean) })
//         boolean!: boolean[];
//       }
//       const outputBody: Output = { boolean: [true, false] };
//       return [Output as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
//   {
//     test: "response of type object with nested object array field",
//     testResponse: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @InputType({ description: "NestedInput" })
//       class NestedOutput {
//         @Field({ description: "Nested String", type: String })
//         nestedString!: string;
//       }

//       @ObjectType({ description: "Output" })
//       class Output {
//         @Field({ description: "Nested object", type: List(NestedOutput) })
//         nestedOutput!: NestedOutput[];
//       }
//       const outputBody: Output = {
//         nestedOutput: [
//           { nestedString: "Nested string 1" },
//           { nestedString: "Nested string 2" },
//         ],
//       };
//       return [Output as unknown as T, outputBody as InstanceType<T>];
//     },
//   },
// ].forEach(({ test, testResponse }) => {
//   Deno.test({
//     name: `Post() registers a POST route with a ${test}`,
//     permissions: setupPermissions(),
//     async fn() {
//       // Arrange
//       const [Output, outputResponse] = testResponse();
//       const { controller, input } = createControllerWithPostRoute(
//         "/test",
//         { path: "/", response: Output },
//         () => outputResponse,
//       );
//       await using setup = await setupApplication([controller]);
//       const url = new URL("/v1/test", setup.origin);
//       const headers = new Headers({ "content-type": "application/json" });

//       // Act
//       const response = await fetch(url, {
//         method: HttpMethod.POST,
//         headers,
//       });
//       const text = await response.text();

//       // Assert
//       assertStrictEquals(response.status, STATUS_CODE.OK, text);
//       assertStrictEquals(
//         response.statusText,
//         STATUS_TEXT[STATUS_CODE.OK],
//         text,
//       );
//       assertEquals(
//         typeof outputResponse === "object" ? JSON.parse(text) : String(text),
//         typeof outputResponse === "object"
//           ? outputResponse
//           : String(outputResponse),
//       );
//       assertInstanceOf(input.ctx, Context);
//       assertEquals(input.params, {});
//       assertEquals(input.body, undefined);
//     },
//   });
// });

Deno.test({
  name: "Post() throws an error if registered on a static route",
  permissions: setupPermissions(),
  fn() {
    // Arrange, Act & Assert
    assertThrows(
      () => {
        @Controller("/")
        // deno-lint-ignore no-unused-vars
        class StaticController {
          public register(): InjectableRegistration {
            return { dependencies: [] };
          }

          @Post({ path: "/static" })
          public static getRoute(
            _ctx: Context,
            _params: unknown,
          ): void {
          }
        }
      },
      RouteDecoratorError,
      "Post() registration failed for 'StaticController.getRoute': private and static field registration is unsupported",
    );
  },
});
