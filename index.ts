import { glob } from "npm:glob@10.3.1";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";
// import {
//   ImageMagick,
//   IMagickImage,
//   initializeImageMagick,
// } from "https://deno.land/x/imagemagick_deno@0.0.24/mod.ts";

// await initializeImageMagick();

const plansRoot = "./plans";

interface Plan {
  name: string;
  path: string;
  pitch: string;
  description: string[];
  wireframePath: string;
}

const getPlans = async (): Promise<Plan[]> => {
  const plans: Plan[] = [];
  for await (const f of Deno.readDir(plansRoot)) {
    if (!f.isDirectory) continue;
    const path = "./" + join(plansRoot, f.name);
    const wireframePaths = await glob(`**/${f.name}/**/wireframe.png`);
    const wireframePath = wireframePaths.length ? wireframePaths[0] : "";
    plans.push({
      name: f.name,
      path,
      pitch: "",
      description: [],
      wireframePath,
    });
  }
  return plans.sort((a, b) => a.name < b.name ? -1 : 1);
};

const getWidth = async (img: string): Promise<number> => {
  // const data: Uint8Array = await Deno.readFile(img);
  // ImageMagick.read(data, (img: IMagickImage) => {
  //   console.log(img.baseWidth);
  // });
  return 0;
};

const plans = await getPlans();
console.log(plans);

const readme = `
# Project Plans

<p align="center">
${
  plans.filter((p) => !!p.wireframePath).map((p) =>
    "  " + `  
  <a href="${p.path}">
    <img src="${p.wireframePath}" width="45%"/>
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
