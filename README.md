<!-- 2023-10-07 -->

# Project Plans

<p align="center">
  <a href="./plans/cross-lap-jig">
    <img src="plans/cross-lap-jig/images/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/dog-home">
    <img src="plans/dog-home/images/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/hub-sign">
    <img src="plans/hub-sign/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/clamping-square">
    <img src="plans/clamping-square/images/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/euro-bench">
    <img src="plans/euro-bench/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/knew-hook">
    <img src="plans/knew-hook/images/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/origami-coffee-table">
    <img src="plans/origami-coffee-table/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/scrap-cart">
    <img src="plans/scrap-cart/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/snuffle-frame">
    <img src="plans/snuffle-frame/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/suizan-hook">
    <img src="plans/suizan-hook/wireframe.png" width="45%"/>
  </a>
</p>

### prints
<p align="center">
  <a href="./plans/block-plane-mount">
    <img src="plans/block-plane-mount/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/board-hook">
    <img src="plans/board-hook/images/wireframe.png" width="45%"/>
  </a>
  <a href="./plans/plane-mount">
    <img src="plans/plane-mount/wireframe1.png" width="45%"/>
  </a>
</p>

## Development

### Layout

```
- README.md*             | Generated sitemap.
- internal               | Code to manage this repository.
  └ gen.ts               | Entrypoint for generating docs.
  └ ...                  |
- plans                  | Folder containing all projects.
  └ example.info.json    | Example info file with all possible fields.
  └ <name>               |
    └ info.json          | Structured data about the project
    └ README.md*         | Generated project-level documentation.
    └ model.f3d          | Exported Fusion360 project.
    └ model.stl          | Exported 3d model.
    └ plans.pdf          | Written project instructions.
    └ images             |
      └ wireframe.png    | Square hero image summarizing the form.
    └ ...                |
```

### Format

```bash
$ deno fmt
```

### Build

```bash
$ deno run --unstable --allow-env --allow-read --allow-write index.ts
```

## LICENSE

[MIT](./LICENSE)
