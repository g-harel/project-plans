import { glob } from "npm:glob@10.3.1";
import * as m from "npm:mustache@4.2.0";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";

const plansRoot = "./plans";

interface Plan {
  path: string;
  wireframePath: string;
  info: PlanInfo;
}

interface PlanInfo {
  name: string;
  genDocs?: boolean;
  pitch?: string;
  description?: string[];
  links?: string[];
}

const getPlans = async (): Promise<Plan[]> => {
  const plans: Plan[] = [];
  for await (const f of Deno.readDir(plansRoot)) {
    if (!f.isDirectory) continue;
    const path = "./" + join(plansRoot, f.name);
    const wireframePaths = await glob(`**/${f.name}/**/wireframe.png`);
    const wireframePath = wireframePaths.length ? wireframePaths[0] : "";

    let info: PlanInfo = { name: f.name };
    try {
      const infoFile = await Deno.readTextFile(join(path, "info.json"));
      info = Object.assign(info, JSON.parse(infoFile));
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        console.error(e);
      }
    }

    plans.push({
      path,
      wireframePath,
      info,
    });
  }
  return plans.sort((a, b) => a.info.name < b.info.name ? -1 : 1);
};

const writeRepoReadme = async (plans: Plan[]) => {
  const templateData = {
    wireframes: plans.filter((p) => !!p.wireframePath),
  };

  const readme = m.default.render(
    `
# Project Plans

<p align="center">
{{#wireframes}}
  <a href="{{{path}}}">
    <img src="{{{wireframePath}}}" width="45%"/>
  </a>
{{/wireframes}}
</p>

## Development

### Layout

plans
└ <name>
  └ README.md
  └ model.f3d
  └ model.stl
  └ plans.pdf
  └ images
    └ wireframe.png
	└ ...

### Format

\`\`\`bash
$ deno fmt
\`\`\`

### Build

\`\`\`bash
$ deno run --unstable --allow-env --allow-read --allow-write index.ts
\`\`\`

## LICENSE

[MIT](./LICENSE)
`,
    templateData,
  );

  await Deno.writeTextFile("./README.md", readme.trim() + "\n");
};

const writeDocs = async (plan: Plan) => {
  if (!plan.info.genDocs) return;

  const readme = m.default.render(
    `
# {{info.name}}

> {{info.pitch}}
`,
    plan,
  );

  await Deno.writeTextFile(join(plan.path, "README.md"), readme.trim() + "\n");
};

const plans = await getPlans();
console.log(plans);

await writeRepoReadme(plans);
await Promise.all(plans.map(writeDocs));
