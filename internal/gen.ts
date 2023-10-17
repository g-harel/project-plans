import { glob } from "npm:glob@10.3.1";
import * as m from "npm:mustache@4.2.0";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";

const plansRoot = "./plans";

interface Plan {
  path: string;
  info: PlanInfo;
  wireframePaths: string[];
  patternPaths: string[];
}

interface PlanInfo {
  name: string;
  genDocs?: boolean;
  pitch?: string;
  description?: string[];
  links?: string[];
  inspirationLinks?: string[];
  category?: string;
  hidden?: boolean;
}

const getPlans = async (): Promise<Plan[]> => {
  const plans: Plan[] = [];
  for await (const f of Deno.readDir(plansRoot)) {
    if (!f.isDirectory) continue;
    const path = "./" + join(plansRoot, f.name);
    const wireframePaths = await glob(`**/${f.name}/**/wireframe*.png`);
    const patternPaths = await glob(`**/${f.name}/**/*.svg`);

    if (wireframePaths.length === 0) {
      console.log(`missing wireframes: ${f.name}`);
    }

    let info: PlanInfo = { name: f.name };
    try {
      const infoFile = await Deno.readTextFile(join(path, "info.json"));
      info = Object.assign(info, JSON.parse(infoFile));
    } catch (e) {
      if ((e instanceof Deno.errors.NotFound)) {
        console.log("missing info: " + f.name);
      } else {
        console.error(e);
      }
    }

    plans.push({
      path,
      wireframePaths: wireframePaths.sort(),
      patternPaths: patternPaths.sort(),
      info,
    });
  }
  return plans.sort((a, b) => a.info.name < b.info.name ? -1 : 1);
};

const writeRepoReadme = async (plans: Plan[]) => {
  const wireframesByCategory = plans.reduce<Record<string, Plan[]>>(
    (acc, p) => {
      if (p.wireframePaths.length === 0) return acc;
      if (p.info.hidden) return acc;
      const category = p.info.category || "";
      if (!acc[category]) acc[category] = [];
      acc[category].push(p);
      return acc;
    },
    {},
  );
  await writeTemplate("./internal/templates/readme.mustache", "./README.md", {
    wireframesByCategory: Object.entries(wireframesByCategory).sort(),
  });
};

const writeDocs = async (plan: Plan) => {
  if (!plan.info.genDocs) return;
  await writeTemplate(
    "./internal/templates/docs.mustache",
    join(plan.path, "README.md"),
    { ...plan, wireframeWidths: Math.min(40, 80 / plan.wireframePaths.length) },
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

const strings = [
  "prints > mounts > wall",
  "prints",
  "experimental",
  "workshop",
  "workshop > jigs",
  "furniture",
  "",
];

interface Tree<T> {
  items: T[];
  categories: {
    [category: string]: Tree<T>;
  };
}

interface FlatBranch<T> {
  level: number;
  name: string;
  items: T[];
}

const parse = (lines: PlanInfo[]): FlatBranch<PlanInfo>[] => {
  // Create tree from input plans.
  const tree: Tree<PlanInfo> = {
    items: [],
    categories: {},
  };
  for (const line of lines) {
    if (line.category === undefined) {
      tree.items.push(line);
      continue;
    }

    let currentTreePointer = tree;
    for (const level of line.category.split(" > ")) {
      if (currentTreePointer.categories[level] === undefined) {
        currentTreePointer.categories[level] = { items: [], categories: {} };
      }
      currentTreePointer = currentTreePointer.categories[level];
    }
    currentTreePointer.items.push(line);
  }
  console.log(JSON.stringify(tree, null, 2));

  // Flatten tree + sort.
  const branches: FlatBranch<PlanInfo>[] = [];
  const depthFirst = (tree: Tree<PlanInfo>, name: string, level: number) => {
    branches.push({
      level,
      name,
      items: tree.items,
    });
    Object.entries(tree.categories).sort((a, b) => a[0] < b[0] ? 1 : -1)
      .forEach(([name, tree]) => depthFirst(tree, name, level++));
  };
  depthFirst(tree, "", 0);

  console.log(branches);
  return branches;
};

parse(strings.map((s, i) => ({ name: String(i), category: s })));
