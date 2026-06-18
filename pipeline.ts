import { definePipeline, env, job, sh, task, trigger } from "@async/pipeline";

export default definePipeline({
  name: "api-contract",
  cache: "file:local",
  triggers: {
    pr: trigger.github({ events: ["pull_request"] }),
    main: trigger.github({ events: ["push"], branches: ["main"] }),
    release: trigger.github({ events: ["release"], types: ["published"] }),
    manual: trigger.manual()
  },
  sync: {
    github: {
      nodeVersion: 24,
      cache: false,
      dependencyCache: false,
      packagePreviews: true,
      pages: { target: "docs.site" }
    },
    tasks: {
      prefix: "pipeline",
      runners: ["package"],
      targets: [{ package: "@async/api-contract" }],
      jobs: ["publish", "release-doctor", "snapshot", "verify"],
      tasks: ["docs.site"],
      scripts: {
        "api-surface": "run-task api-surface",
        "api-surface:generate": "run-task api-surface-generate",
        "github:check": "github check",
        "github:generate": "github generate",
        "pages": "run-task docs.site",
        "publish:github:main": "publish github main --package .",
        "publish:github:pr": "publish github pr --package .",
        "publish:github:release": "publish github release --package .",
        "publish:npm": "publish npm --package .",
        "release:doctor": "release doctor --package .",
        "release:ensure": "release ensure --package .",
        "sync:check": "sync check",
        "sync:generate": "sync generate",
        "verify:force": "run verify --force"
      }
    }
  },
  namedInputs: {
    source: [
      "src/**/*.ts",
      "tests/**/*",
      "examples/**/*",
      "README.md",
      "CHANGELOG.md",
      "package.json",
      "pnpm-lock.yaml",
      "tsconfig.json"
    ],
    docs: [
      "README.md",
      "docs/**/*.md"
    ],
    pipeline: [
      "pipeline.ts",
      ".npmrc",
      "scripts/**/*.mjs",
      ".github/workflows/async-pipeline.yml",
      ".github/async-pipeline.lock.json",
      ".async-pipeline/tasks.lock.json"
    ],
    "api-surface": [
      "api-contract.json",
      "API_SURFACE.md"
    ],
    production: [
      "src/**/*.ts",
      "examples/**/*",
      "README.md",
      "CHANGELOG.md",
      "api-contract.json",
      "API_SURFACE.md",
      "package.json",
      "tsconfig.json"
    ]
  },
  tasks: {
    "docs.site": task({
      description: "Build the standardized GitHub Pages documentation site.",
      inputs: ["README.md", "docs/**/*.md", "scripts/build-pages.js"],
      outputs: [".async/pages/**"],
      cache: true,
      run: sh`node scripts/build-pages.js`
    }),
    "sync-check": task({
      description: "Generated workflow, lock, and package scripts still match pipeline.ts.",
      inputs: ["pipeline", "package.json"],
      cache: false,
      run: sh`pnpm async-pipeline sync check`
    }),
    "api-surface-generate": task({
      description: "Regenerate the @async/api-contract API surface review ledger from the checked-in manifest.",
      dependsOn: ["build"],
      inputs: ["api-contract.json"],
      outputs: ["API_SURFACE.md"],
      cache: false,
      run: sh`node dist/cli.js ledger --manifest api-contract.json --out API_SURFACE.md`
    }),
    "api-surface": task({
      description: "Validate the @async/api-contract manifest and generated review ledger through its own CLI.",
      dependsOn: ["build"],
      inputs: ["api-surface"],
      cache: true,
      run: [
        sh`node dist/cli.js check --manifest api-contract.json`,
        sh`node dist/cli.js ledger --manifest api-contract.json --check API_SURFACE.md`
      ]
    }),
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
      run: sh`pnpm run typecheck:contracts`
    }),
    test: task({
      dependsOn: ["typecheck", "typecheck-contracts"],
      inputs: ["source"],
      cache: true,
      run: sh`node --test tests/*.test.js`
    }),
    pack: task({
      dependsOn: ["test", "api-surface", "sync-check"],
      inputs: ["production", "pipeline", "api-surface"],
      cache: false,
      run: sh`pnpm pack:check`
    }),
    snapshot: task({
      description: "Pushes to main publish an immutable 0.0.0-main.sha.<sha> snapshot to GitHub Packages and move the main dist-tag while the commit is still the branch head.",
      dependsOn: ["pack"],
      inputs: ["production"],
      cache: false,
      run: sh`pnpm async-pipeline publish github main --package .`
    }),
    "publish-github": task({
      description: "Stable mirror to GitHub Packages (latest tag). Runs before npm publish so the fallback registry is never behind the primary release path.",
      dependsOn: ["release-ensure"],
      inputs: ["production"],
      cache: false,
      run: sh`pnpm async-pipeline publish github release --package .`
    }),
    "release-ensure": task({
      description: "Create or verify the release tag and GitHub Release before package publishing.",
      dependsOn: ["pack"],
      inputs: ["production"],
      cache: false,
      run: sh`pnpm async-pipeline release ensure --package .`
    }),
    publish: task({
      dependsOn: ["publish-github"],
      inputs: ["production"],
      cache: false,
      run: [
        sh`pnpm async-pipeline publish npm --package .`,
        sh`pnpm async-pipeline release doctor --package .`
      ]
    }),
    "release-doctor": task({
      description: "Verify that the stable version exists on npm, GitHub Packages, and GitHub Releases after the publish job completes.",
      inputs: ["production"],
      cache: false,
      run: sh`pnpm async-pipeline release doctor --package .`
    })
  },
  jobs: {
    verify: job({
      target: "pack",
      trigger: ["pr", "main", "release"]
    }),
    snapshot: job({
      target: "snapshot",
      trigger: ["main"],
      env: {
        GITHUB_TOKEN: env.secret("GITHUB_TOKEN")
      },
      github: {
        permissions: {
          contents: "write",
          packages: "write"
        }
      }
    }),
    publish: job({
      target: "publish",
      trigger: ["manual", "release"],
      environment: {
        name: "npm-publish",
        url: "https://www.npmjs.com/package/@async/api-contract"
      },
      requires: {
        provenance: true
      },
      env: {
        GITHUB_TOKEN: env.secret("GITHUB_TOKEN"),
        NODE_AUTH_TOKEN: env.secret("NPM_TOKEN")
      },
      github: {
        permissions: {
          contents: "write",
          packages: "write"
        }
      }
    }),
    "release-doctor": job({
      target: "release-doctor",
      trigger: ["manual"],
      env: {
        GITHUB_TOKEN: env.secret("GITHUB_TOKEN")
      },
      github: {
        permissions: {
          contents: "read",
          packages: "read"
        }
      }
    })
  }
});
