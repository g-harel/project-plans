import { glob } from "npm:glob@10.3.1";
import { dirname } from "https://deno.land/std/path/mod.ts";
import sharp from "npm:sharp@0.32.2";

const wireframes: string[] = await glob("**/wireframe.png");

const getRootFromWireframe = (path: string) => {
  while (path.endsWith(".png") || path.endsWith("images")) {
    path = dirname(path);
  }
  return path;
};

const getWidth = async (img: string): Promise<number> => {
  const metadata = await sharp(img).metadata();
  console.log(metadata);
  return 0;
}

const readme = `
# Project Plans

<p align="center">
${
  wireframes.map((img) =>
    "  " + `  
  <a href="./${getRootFromWireframe(img)}">
    <img src="${img}" ${getWidth(img)} width="45%"/>
  </a>`.trim()
  ).join("\n")
}
</p>

## LICENSE

[MIT](./LICENSE)
`.trim() + "\n";

await Deno.writeTextFile("./README.md", readme);
