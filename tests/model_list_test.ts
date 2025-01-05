// Copyright 2024-2025 the API framework authors. All rights reserved. MIT license.

// import type {
//   ClassType,
//   Context,
//   Field,
//   HttpMethod,
//   InputType,
//   List,
// } from "@eyrie/app";
// import type {
//   assertEquals,
//   assertInstanceOf,
//   assertStrictEquals,
// } from "@std/assert";
// import type { STATUS_CODE } from "@std/http/status";
// import type { createControllerWithPostRoute } from "./utils/controller_utils.ts";
// import type {
//   setupApplication,
//   setupPermissions,
// } from "./utils/setup_utils.ts";

// [
//   {
//     test: "Field() registers a model of type object with string array field",
//     testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
//       @InputType({ description: "Input" })
//       class Input {
//         @Field({ description: "string", type: List(String) })
//         string!: string[];
//       }
//       const input: Input = { string: ["hello", "there"] };
//       return [Input as unknown as T, input as InstanceType<T>];
//     },
//   },
//   // {
//   //   test: "response of type object with number array field",
//   //   testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
//   //     @InputType({ description: "Input" })
//   //     class Input {
//   //       @Field({ description: "number", type: List(Number) })
//   //       number!: number[];
//   //     }
//   //     const input: Input = { number: [1234.56, 78.9] };
//   //     return [Input as unknown as T, input as InstanceType<T>];
//   //   },
//   // },
//   // {
//   //   test: "response of type object with boolean array field",
//   //   testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
//   //     @InputType({ description: "Input" })
//   //     class Input {
//   //       @Field({ description: "boolean", type: List(Boolean) })
//   //       boolean!: boolean[];
//   //     }
//   //     const input: Input = { boolean: [true, false] };
//   //     return [Input as unknown as T, input as InstanceType<T>];
//   //   },
//   // },
//   // {
//   //   test: "response of type object with nested object array field",
//   //   testInput: <T extends ClassType>(): [T, InstanceType<T>] => {
//   //     @InputType({ description: "NestedInput" })
//   //     class NestedOutput {
//   //       @Field({ description: "Nested String", type: String })
//   //       nestedString!: string;
//   //     }

//   //     @InputType({ description: "Input" })
//   //     class Input {
//   //       @Field({ description: "Nested object", type: List(NestedOutput) })
//   //       nestedOutput!: NestedOutput[];
//   //     }
//   //     const input: Input = {
//   //       nestedOutput: [
//   //         { nestedString: "Nested string 1" },
//   //         { nestedString: "Nested string 2" },
//   //       ],
//   //     };
//   //     return [Input as unknown as T, input as InstanceType<T>];
//   //   },
//   // },
// ].forEach(({ test, testInput }) => {
//   Deno.test({
//     name: test,
//     permissions: setupPermissions(),
//     async fn() {
//       // Arrange
//       const [Input, inputBody] = testInput();
//       const { controller, input } = createControllerWithPostRoute(
//         "/messages",
//         { path: "/", body: Input },
//       );
//       await using setup = await setupApplication([controller]);
//       const url = new URL("/v1/messages", setup.origin);
//       const headers = new Headers({ "content-type": "application/json" });

//       // Act
//       const response = await fetch(url, {
//         method: HttpMethod.POST,
//         body: JSON.stringify(inputBody),
//         headers,
//       });
//       const text = await response.text();

//       // Assert
//       assertStrictEquals(response.status, STATUS_CODE.OK, text);
//       assertInstanceOf(input.ctx, Context);
//       assertEquals(input.params, {});
//       assertInstanceOf(input.body, Input);
//       assertEquals(JSON.parse(JSON.stringify(input.body)), inputBody);
//     },
//   });
// });
