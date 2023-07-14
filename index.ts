import { glob } from "npm:glob@10.3.1";
import { dirname } from "https://deno.land/std/path/mod.ts";
// import {
//   ImageMagick,
//   IMagickImage,
//   initializeImageMagick,
// } from "https://deno.land/x/imagemagick_deno@0.0.24/mod.ts";

// await initializeImageMagick();

const wireframes: string[] = await glob("**/wireframe.png");

interface Project {
  name: string;
  pitch: string;
  description: string[];
  wireframe: string;
}

const getProjects = async (): Promise<Project[]> => {
  const projects: Project[] = [];
  for await (const f of Deno.readDir("plans")) {
    if (f.isDirectory) {
      projects.push({
        name: f.name,
        pitch: "",
        description: [],
        wireframe: await glob(`**/${f.name}/**/wireframe.png`).then((r: string[]) => r ? r[0] : ""),
      });
    }
  }
  return projects.sort((a, b) => a.name < b.name ? -1 : 1);
};

const getWidth = async (img: string): Promise<number> => {
  // const data: Uint8Array = await Deno.readFile(img);
  // ImageMagick.read(data, (img: IMagickImage) => {
  //   console.log(img.baseWidth);
  // });
  return 0;
};

const projects = await getProjects();
console.log(projects);

const readme = `
# Project Plans

<p align="center">
${
  projects.filter((p) => !!p.wireframe).map((p) =>
    "  " + `  
  <a href="./plans/${p.name}">
    <img src="${p.wireframe}" width="45%"/>
  </a>`.trim()
  ).join("\n")
}
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
`.trim() + "\n";

await Deno.writeTextFile("./README.md", readme);
