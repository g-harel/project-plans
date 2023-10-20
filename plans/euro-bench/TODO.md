```
- named parts using `[_]`
- finished piece using `[_]*`
- cutoff that is never used again `[#]`

[A] -> 1166mm x 608mm
[B] ->  765mm x 506mm
[C] -> 1167mm x 607mm

cutlist
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
laminate
    [x] test applying laminate on scrap
    [x] test using parf parts on laminated scrap
    [x] cut 3x laminates for tops
    [x] laminate 3x tops
    [x] parf 2x laminated tops
    [x] chamfer laminated tops on both sides
tops
    [x] parf 2x sides
    [x] cut out holes in 9x fronts 4x sides
    [x] router hole corners in all fronts and sides
    [x] round hole edges in all fronts and sides
    [x] add joinery to fronts
    [x] add joinery to sides
    [x] add joinery to tops
    [x] assemble tops (tabletop first)
    [x] lightly sand sides of tops
    [x] test vertical roundover
    [x] round over & sand tops
bases
    [x] add joinery to base frames
    [x] assemble 3x base frames
    [x] router 6x6mm slot in 6x base sides
    [x] router 6x6mm slot in 3x base bottoms
    [x] router 6x6mm slot in 3x base frames
    [x] make hole in racking insert
    [x] add joinery to base parts
    [x] assemble bases
    [x] attach casters
    [ ] round over & sand base pieces
[x] trim bases to tops
[x] attach tops and bases

** _flip & trim_: flip the panel over when cutting the opposite edge to maintain the same reference edge.
```
