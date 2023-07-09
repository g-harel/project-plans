import { glob } from "npm:glob@10.3.1";
import { dirname } from "https://deno.land/std/path/mod.ts";

const wireframes: string[] = await glob("**/wireframe.png");

const getRootFromWireframe = (path: string) => {
  while (path.endsWith(".png") || path.endsWith("images")) {
    path = dirname(path);
  }
  return path;
};

const readme = `
# Project Plans

<p align="center">
${
  wireframes.map((img) =>
    "  " + `  
  <a href="./${getRootFromWireframe(img)}">
    <img src="${img}" width="50%"/>
  </a>`.trim()
  ).join("\n")
}
</p>

## LICENSE

[MIT](./LICENSE)
`.trim() + "\n";

await Deno.writeTextFile("./README.md", readme);
