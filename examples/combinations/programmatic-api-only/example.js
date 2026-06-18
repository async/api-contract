import {
  bindApiHandlers,
  defineApiContract,
  defineOperation,
  invokeOperation
} from "@async/api-contract/interface";
import { jsonSchemaAdapter } from "@async/api-contract/schema";

const verifyInput = jsonSchemaAdapter({
  type: "object",
  required: ["workspace"],
  properties: {
    workspace: { type: "string" }
  }
}, {
  parse(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("input must be an object");
    }
    if (typeof value.workspace !== "string") throw new Error("workspace must be a string");
    return { workspace: value.workspace };
  }
});

const verifyOutput = jsonSchemaAdapter({
  type: "object",
  required: ["ok"],
  properties: {
    ok: { type: "boolean" },
    checked: { type: "string" }
  }
});

const contract = defineApiContract({
  packageName: "workspace-tool",
  operations: [
    defineOperation({
      id: "project.verify",
      title: "Verify project",
      input: verifyInput,
      output: verifyOutput,
      effects: ["filesystem.read"]
    })
  ]
});

const api = bindApiHandlers(contract, {
  "project.verify": async (input) => ({
    ok: true,
    checked: input.workspace
  })
});

console.log(JSON.stringify(await invokeOperation(api, "project.verify", {
  workspace: "acme-tool"
}), null, 2));
