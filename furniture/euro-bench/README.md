# micro-workbench

## order of operations cutting

- named parts using `[_]` 
- finished piece using `[_]*`
- cutoff that is never used again `[#]`

[A] -> 1166mm x 608mm
[B] ->  765mm x 506mm
[C] -> 1167mm x 607mm

[x] cross cut 896mm +5                  | 12x [A]          == 12x [A1] + 12x [A2]
[x] _flip & trim_** to 896mm            | 12x [A1]         == 12x [A3] + 12x [#]
[x] cross trim then cut two 60mm strips | 5x [B]           == 10x [B1] + 5x [B2]
[x] rip trim then cut to 60mm strips    | 3x [A3]          ==  6x [A4]  + 3x [A5]
[x] cross cut 608mm +5                  | 4x [B] + 5x [B2] ==  9x [B3]  + 9x [#]
[x] _flip & trim_** to 608mm            | 9x [B3]          ==  9x [B4]  + 9x [#]
[x] rip trim non-reference to 608mm     | 9x [A3]          ==  9x [A7]* + 9x [#]
[x] rip trim then cut to 218mm          | 3x [A5]          ==  6x [A6]* + 3x [#]
[x] rip trim then cut to 218mm          | 9x [A2]          ==  9x [A8]  + 9x [#] 
[x] cross trim then cut two 517mm       | 2x [C]           ==  3x [C1]  + 3x [#]
[x] rip cut 416mm                       | 3x [C1]          ==  3x [C2]* + 3x [#]
[x] _cut everything else (TODO)_
[ ] cut out holes in 9x fronts 4x sides
[ ] router holes in all fronts and sides
[ ] test applying laminate on scrap
[ ] test using parf parts on laminated scrap
[ ] laminate 3x tops
[ ] parf two sides
[ ] parf 2x laminated tops
[ ] chamfer parf holes
[ ] soften underside/inside of dogholes in 2x tops 2x sides
[ ] assemble 3x base frames
[ ] cut 2x alignment metre sticks
[ ] router slot in base 6x sides + 3x bottoms + 3x base frames
[ ] assemble bases with glue and nails
[ ] pre-drill then screw base pieces
[ ] round over base pieces
[ ] attach wheels
[ ] assemble tops with glue and nails (minus tabletop)
[ ] attach tabletops centered & using screws
[ ] flush trim tabletops
[ ] round over tops


** _flip & trim_: flip the panel over when cutting the opposite edge to maintain the same reference edge.