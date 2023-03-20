# micro-workbench

## order of operations cutting

- named parts using `[_]` 
- finished piece using `[_]*`
- cutoff that is never used again `[#]`

[A] -> 1166mm x 608mm
[B] ->  765mm x 506mm
[C] -> 1167mm x 607mm

[done]  1. cross cut 896mm +5                  | 12x [A]          == 12x [A1] + 12x [A2]
[done]  2. _flip & trim_** to 896mm            | 12x [A1]         == 12x [A3] + 12x [#]
[    ]  3. cross trim then cut two 60mm strips | 5x [B]           == 10x [B1] + 5x [B2]
[    ]  4. rip trim then cut to 60mm strips    | 3x [A3]          ==  6x [A4]  + 3x [A5]
[    ]  4. cross cut 608mm +5                  | 4x [B] + 5x [B2] ==  9x [B3]  + 9x [#]
[    ]  5. _flip & trim_** to 608mm            | 9x [B3]          ==  9x [B4]  + 9x [#]
[    ]  6. rip trim non-reference to 608mm     | 9x [A3]          ==  9x [A7]* + 9x [#]
[    ]  7. rip trim then cut to 218mm          | 3x [A5]          ==  6x [A6]* + 3x [#]
[    ]  8. rip trim then cut to 218mm          | 9x [A2]          ==  9x [A8]  + 9x [#] 
[done]  9. cross trim then cut two 517mm       | 2x [C]           ==  3x [C1]  + 3x [#]
[done] 10. rip cut 416mm                       | 3x [C1]          ==  3x [C2]* + 3x [#]

** _flip & trim_: flip the panel over when cutting the opposite edge to maintain the same reference edge.