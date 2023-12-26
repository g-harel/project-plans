import { glob } from "npm:glob@10.3.1";
import * as m from "npm:mustache@4.2.0";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";

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
}

// Manually provided project setup.
interface PlanInfo {
  // Project name.
  name: string;

  // Whether project-specific docs should be generated.
  genDocs?: boolean;

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

  // TODO(2023-12-21): replace description
  introduction?: Section;
  supplies?: Section & ListFields<"materials" | "tools">;
  steps?: (Titled & Section)[];
}

interface Titled {
  title: string;
}

type ListFields<T extends string> = {
  [k in T]: string[];
};

interface Section {
  body: string[];
  mediaPaths?: string[];
  imagePaths?: string[];
}

const getPlans = async (): Promise<Plan[]> => {
  const plans: Plan[] = [];
  for await (const f of Deno.readDir(plansRoot)) {
    if (!f.isDirectory) continue;
    const path = "./" + join(plansRoot, f.name);
    const wireframePaths = await glob(`**/${f.name}/**/wireframe*.png`);
    const patternPaths = await glob(`**/${f.name}/**/*.svg`);
    const galleryPaths = await glob(`**/${f.name}/**/gallery*.@(jpg|png)`);

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

    if (wireframePaths.length === 0) {
      if (!info.hidden) {
        console.log(`missing wireframes: ${f.name}`);
      }
    }

    plans.push({
      path,
      wireframePaths: wireframePaths.sort(),
      patternPaths: patternPaths.sort(),
      galleryPaths: galleryPaths.sort(),
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
  } catch (_) {
    // Write if something went wrong or file doesn't exist yet.
  }

  const dateLine = `<!-- ${new Date().toISOString().slice(0, 10)} -->`;
  const formatted = dateLine + "\n\n" + contents.trim() + "\n";
  await Deno.writeTextFile(out, formatted);
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
await Promise.all(plans.map(writeDocs));
