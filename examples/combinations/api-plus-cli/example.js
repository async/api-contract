import { defineApiContract, defineOperation } from "@async/api-contract/interface";
import { generateCliDescriptor, generateMachineCliRouter } from "@async/api-contract/generators";
import { jsonSchemaAdapter } from "@async/api-contract/schema";

const initInput = jsonSchemaAdapter({
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string" },
    directory: { type: "string", default: "." }
  }
});

const contract = defineApiContract({
  packageName: "workspace-tool",
  operations: [
    defineOperation({
      id: "project.init",
      title: "Initialize project",
      input: initInput,
      effects: ["filesystem.write"],
      cli: {
        command: ["project", "init"],
        interactive: true,
        flags: [
          { name: "name", type: "string", required: true },
          { name: "directory", type: "string", default: "." }
        ]
      }
    })
  ]
});

console.log(JSON.stringify({
  cli: generateCliDescriptor(contract, { binaryName: "workspace-tool" }),
  machineRouter: generateMachineCliRouter(contract, { binaryName: "workspace-tool" })
}, null, 2));
