import { glob } from "npm:glob@10.3.1";
import * as m from "npm:mustache@4.2.0";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";
import { z, ZodError } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { parseAll } from "jsr:@std/yaml";

const plansRoot = "./plans";

// Representation of a project parsed from a folder.
interface Plan {
  // Path of the project folder.
  path: string;

  // Contents of the handwritten project declaration.
  info: PlanInfo;

  // Cell-rendered image of each project item.
  wireframePaths: string[];

  // Project's SVG patterns.
  patternPaths: string[];

  // Completed project pictures.
  galleryPaths?: string[];

  // Structured work log items.
  logs?: LogItem[];
}

// Manually provided project setup.
interface PlanInfo {
  // Project name.
  name: string;

  // Whether the project is in-progress or not.
  inProgress?: boolean;

  // One-sentence description of the projects.
  pitch?: string;

  // Relevant resources, documentation, etc.
  links?: string[];

  // Similar projects and inspiration.
  inspirationLinks?: string[];

  // Category formatted by "folder" (a > b > c).
  category?: string;

  // Whether the project should be hidden from the top level index.
  hidden?: boolean;

  // What materials were used for the project.
  materials?: string[];

  // Which finishes were used for the project.
  finish?: string[];

  // Links to places where the project is published.
  publishedLinks?: string[];

  // Collection of fields used to generate plans on instructables.com
  introduction?: Section;
  supplies?: Section & ListFields<string[], "materials" | "tools">;
  steps?: (Titled & Section & ListFields<number, "__index">)[];
}

interface Titled {
  title: string;
}

type ListFields<T, K extends string> = {
  [k in K]: T;
};

interface Section {
  body: string[];
  assetPaths?: string[];
  imagePaths?: string[];
}

const LogItem = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string().date(),
  retcon: z.boolean().optional(),
  task: z.object({
    type: z.string().optional(),
    hours: z.number(),
  }),
  expense: z.object({
    retailer: z.string(),
    amount: z.number(),
    utilization: z.number().min(0).max(1),
  }).optional(),
});
type LogItem = z.infer<typeof LogItem>;

const getPlans = async (): Promise<Plan[]> => {
  const plans: Plan[] = [];

  // Find and sort list of plan subdirectories.
  const planDirs: string[] = [];
  for await (const f of Deno.readDir(plansRoot)) {
    if (!f.isDirectory) continue;
    planDirs.push(f.name);
  }
  planDirs.sort();

  for (const dir of planDirs) {
    const path = "./" + join(plansRoot, dir);
    const infoPaths = await glob(`**/${dir}/**/info.@(json|yaml)`);
    const wireframePaths = await glob(`**/${dir}/**/wireframe*.png`);
    const patternPaths = await glob(`**/${dir}/**/*.svg`);
    const galleryPaths = await glob(`**/${dir}/**/gallery*.@(jpg|png)`);
    const logPaths = await glob(`**/${dir}/log.@(json|yaml)`);

    let info: PlanInfo = { name: dir };
    const infoPath = infoPaths.sort().reverse()[0] || "missing-file.json";
    try {
      const infoFile = await Deno.readTextFile(infoPath);
      info = Object.assign(info, (parseAll(infoFile) as any)[0]);
    } catch (e) {
      if ((e instanceof Deno.errors.NotFound)) {
        console.log("%cmissing info: " + dir, "color: orange");
      } else {
        console.error(path, e);
      }
    }

    if (wireframePaths.length === 0) {
      if (!info.hidden) {
        console.log(`%cmissing wireframes: ${dir}`, "color: orange");
      }
    }

    const logs: LogItem[] = [];
    let lastItem: string = "";
    const logPath = logPaths[0];
    if (logPath) {
      try {
        const logFile = await Deno.readTextFile(logPath);
        let logItems: LogItem[] = (parseAll(logFile) as any)[0];
        for (const item of logItems) {
          lastItem = JSON.stringify(item);
          logs.push(LogItem.parse(item));
        }
      } catch (e) {
        if (e instanceof ZodError) {
          console.error(logPath, lastItem, e);
        } else if (!(e instanceof Deno.errors.NotFound)) {
          console.error(logPath, e);
        }
      }
    }

    plans.push({
      path,
      wireframePaths: wireframePaths.sort(),
      patternPaths: patternPaths.sort(),
      galleryPaths: galleryPaths.sort(),
      logs,
      info,
    });
  }

  return plans.sort((a, b) => a.info.name < b.info.name ? -1 : 1);
};

const writeRepoReadme = async (plans: Plan[]) => {
  const r = parse(
    plans.filter((p) => !!p.wireframePaths.length && !p.info.hidden),
    (p) => p.info.category || "",
  );
  await writeTemplate("./internal/templates/readme.mustache", "./README.md", {
    wireframeCategories: r.map((r) => {
      if (r.name) r.name = "#".repeat(r.level + 1) + " " + r.name;
      return r;
    }),
  }, (date) => `<!-- ${date} -->`);
};

const writeDataFile = (plans: Plan[]) => {
  return writeTemplate(
    "./internal/templates/plans.mustache",
    "./plans.json",
    { json: JSON.stringify(plans) },
    (_date) => "", // JSON doesn't support comments
  );
};

const writeDocs = async (plan: Plan) => {
  if (plan.info.steps) {
    for (let i = 0; i < plan.info.steps.length; i++) {
      plan.info.steps[i].__index = i + 1;
    }
  }
  if (plan.logs?.length) {
    let hours = 0;
    let cost = 0;
    for (const log of plan.logs) {
      hours += log.task.hours;
      cost += (log.expense?.amount || 0) * (log.expense?.utilization || 1);
    }
    // TODO 2024-10-01 show in output.
    console.log(`${plan.info.name} ${hours.toFixed(2)}h $${cost.toFixed(2)}`);
  }
  await writeTemplate(
    "./internal/templates/docs.mustache",
    join(plan.path, "README.md"),
    { ...plan, wireframeWidths: Math.min(40, 80 / plan.wireframePaths.length) },
    (date) => `<!-- ${date} -->`,
  );
};

const writeTemplate = async (
  templatePath: string,
  outPath: string,
  dataContext: any,
  headerGen: (date: string) => string,
) => {
  const contents = m.default.render(
    await Deno.readTextFileSync(templatePath),
    dataContext,
  );

  try {
    // Don't write if contents haven't changed.
    const existingContents = await Deno.readTextFile(outPath);
    if (
      existingContents
        .replace(/\s/g, "")
        .endsWith(contents.replace(/\s/g, ""))
    ) return;
  } catch (_) {
    // Write if something went wrong or file doesn't exist yet.
  }

  const header = headerGen(new Date().toISOString().slice(0, 10));
  const formatted = (header + "\n\n" + contents).trim() + "\n";
  await Deno.writeTextFile(outPath, formatted);
};

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

const parse = <T>(
  lines: T[],
  categorizer: (line: T) => string,
): FlatBranch<T>[] => {
  // Create tree from input plans.
  const tree: Tree<T> = {
    items: [],
    categories: {},
  };
  for (const line of lines) {
    const category = categorizer(line);
    let currentTreePointer = tree;
    for (const level of category.split(" > ")) {
      if (currentTreePointer.categories[level] === undefined) {
        currentTreePointer.categories[level] = { items: [], categories: {} };
      }
      currentTreePointer = currentTreePointer.categories[level];
    }
    currentTreePointer.items.push(line);
  }

  // Flatten tree + sort.
  const branches: FlatBranch<T>[] = [];
  const depthFirst = (tree: Tree<T>, name: string, level: number) => {
    if (level) branches.push({ level, name, items: tree.items });
    Object.entries(tree.categories).sort((a, b) => a[0] > b[0] ? 1 : -1)
      .forEach(([name, tree]) => depthFirst(tree, name, level + 1));
  };
  depthFirst(tree, "", 0);

  return branches;
};

const plans = await getPlans();
await writeRepoReadme(plans);
await writeDataFile(plans);
await Promise.all(plans.map(writeDocs));
