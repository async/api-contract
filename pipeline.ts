import { definePipeline, env, job, sh, task, trigger } from "@async/pipeline";

export default definePipeline({
  name: "api-contract",
  cache: "file:local",
  triggers: {
    pr: trigger.github({ events: ["pull_request"] }),
    main: trigger.github({ events: ["push"], branches: ["main"] }),
    release: trigger.github({ events: ["release"] }),
    manual: trigger.manual()
  },
  sync: {
    github: {
      nodeVersion: 24,
      cache: true
    },
    tasks: {
      prefix: "pipeline",
      runners: ["package"],
      targets: [{ package: "@async/api-contract" }],
      jobs: ["verify", "publish"],
      scripts: {
        "github:check": "github check",
        "github:generate": "github generate",
        "sync:check": "sync check"
      }
    }
  },
  namedInputs: {
    source: [
      "src/**/*.ts",
      "test/**/*",
      "examples/**/*",
      "README.md",
      "CHANGELOG.md",
      "package.json",
      "pnpm-lock.yaml",
      "tsconfig.json"
    ],
    pipeline: [
      "pipeline.ts",
      "scripts/**/*.mjs",
      ".github/workflows/async-pipeline.yml",
      ".github/async-pipeline.lock.json",
      ".async-pipeline/tasks.lock.json"
    ],
    production: [
      "src/**/*.ts",
      "examples/**/*",
      "README.md",
      "CHANGELOG.md",
      "package.json",
      "tsconfig.json"
    ]
  },
  tasks: {
    build: task({
      inputs: ["production"],
      outputs: ["dist/**"],
      cache: true,
      run: sh`pnpm build`
    }),
    typecheck: task({
      dependsOn: ["build"],
      inputs: ["source"],
      cache: true,
      run: sh`pnpm typecheck`
    }),
    "typecheck-contracts": task({
      dependsOn: ["build"],
      inputs: ["source"],
      cache: true,
      run: sh`pnpm typecheck:contracts`
    }),
    test: task({
      dependsOn: ["typecheck", "typecheck-contracts"],
      inputs: ["source"],
      cache: true,
      run: sh`node --test test/*.test.js`
    }),
    "sync-check": task({
      inputs: ["pipeline"],
      cache: false,
      run: sh`pnpm async-pipeline sync check`
    }),
    pack: task({
      dependsOn: ["test", "sync-check"],
      inputs: ["production", "pipeline"],
      cache: false,
      run: sh`pnpm pack:check`
    }),
    "publish-npm": task({
      description: "Publish the stable package to npm with provenance, skipping if the package version already exists.",
      dependsOn: ["pack"],
      inputs: ["production", "pipeline"],
      cache: false,
      run: sh`node scripts/publish-npm.mjs`
    })
  },
  jobs: {
    verify: job({
      target: "pack",
      trigger: ["pr", "main", "manual", "release"]
    }),
    publish: job({
      target: "publish-npm",
      trigger: ["release", "manual"],
      environment: {
        name: "npm-publish",
        url: "https://www.npmjs.com/package/@async/api-contract"
      },
      requires: {
        provenance: true
      },
      env: {
        NODE_AUTH_TOKEN: env.secret("NPM_TOKEN")
      }
    })
  }
});
