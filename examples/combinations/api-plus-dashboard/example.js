import { defineApiContract, defineOperation } from "@async/api-contract/interface";
import { generateDashboardManifest } from "@async/api-contract/generators";
import { jsonSchemaAdapter } from "@async/api-contract/schema";

const reportInput = jsonSchemaAdapter({
  type: "object",
  required: ["projectName"],
  properties: {
    projectName: { type: "string" },
    includeReceipts: { type: "boolean", default: true }
  }
});

const contract = defineApiContract({
  packageName: "project-console",
  title: "Project Console",
  operations: [
    defineOperation({
      id: "project.report",
      title: "Create project report",
      input: reportInput,
      effects: ["filesystem.read"],
      dashboard: {
        group: "Project",
        view: "form",
        resultView: "summary",
        sort: 10,
        transport: "machine-cli"
      }
    })
  ]
});

console.log(JSON.stringify(generateDashboardManifest(contract, {
  binaryName: "project-console"
}), null, 2));
