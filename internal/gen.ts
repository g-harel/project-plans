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
  inspirationLinks?: string[];
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
    date: new Date().toISOString().slice(0, 10),
    wireframes: plans.filter((p) => !!p.wireframePath),
  };

  const readme = m.default.render(
    await Deno.readTextFileSync("./internal/templates/readme.mustache"),
    templateData,
  );

  await Deno.writeTextFile("./README.md", readme.trim() + "\n");
};

const writeDocs = async (plan: Plan) => {
  if (!plan.info.genDocs) return;

  const readme = m.default.render(
    await Deno.readTextFileSync("./internal/templates/docs.mustache"),
    Object.assign(plan, {
      date: new Date().toISOString().slice(0, 10),
    }),
  );

  // TODO: Only write if changed.
  await Deno.writeTextFile(join(plan.path, "README.md"), readme.trim() + "\n");
};

const plans = await getPlans();
console.log(plans);

await writeRepoReadme(plans);
await Promise.all(plans.map(writeDocs));
