import { glob } from "npm:glob@10.3.1";
import * as m from "npm:mustache@4.2.0";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";

const plansRoot = "./plans";

interface Plan {
  path: string;
  wireframePaths: string[];
  info: PlanInfo;
}

interface PlanInfo {
  name: string;
  genDocs?: boolean;
  pitch?: string;
  description?: string[];
  links?: string[];
  inspirationLinks?: string[];
  category?: string;
}

const getPlans = async (): Promise<Plan[]> => {
  const plans: Plan[] = [];
  for await (const f of Deno.readDir(plansRoot)) {
    if (!f.isDirectory) continue;
    const path = "./" + join(plansRoot, f.name);
    const wireframePaths = await glob(`**/${f.name}/**/wireframe*.png`);

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
      wireframePaths: wireframePaths.sort(),
      info,
    });
  }
  return plans.sort((a, b) => a.info.name < b.info.name ? -1 : 1);
};

const writeRepoReadme = async (plans: Plan[]) => {
  const foundKeys = plans.reduce<Record<any, boolean>>((acc, p) => {
    if (p.info.category) acc[p.info.category] = true;
    return acc;
   }, {});
  await writeTemplate("./internal/templates/readme.mustache", "./README.md", {
    wireframes: plans.filter((p) => !!p.wireframePaths.length),
    categories: [undefined, ...Object.keys(foundKeys)],
  });
};

const writeDocs = async (plan: Plan) => {
  if (!plan.info.genDocs) return;
  await writeTemplate(
    "./internal/templates/docs.mustache",
    join(plan.path, "README.md"),
    {...plan, wireframeWidths: Math.min(40, 80 / plan.wireframePaths.length)},
  );
};

const writeTemplate = async (template: string, out: string, args: any) => {
  const contents = m.default.render(
    await Deno.readTextFileSync(template),
    args,
  );

  try {
    // Don't write if contents haven't changed.
    const existingContents = await Deno.readTextFile(out);
    if (existingContents.trim().endsWith(contents.trim())) return;
  } catch (e) {
    // Write if something went wrong or file doesn't exist yet.
  }

  const dateLine = `<!-- ${new Date().toISOString().slice(0, 10)} -->`;
  const formatted = dateLine + "\n\n" + contents.trim() + "\n";
  await Deno.writeTextFile(out, formatted);
};

const plans = await getPlans();
await writeRepoReadme(plans);
await Promise.all(plans.map(writeDocs));
