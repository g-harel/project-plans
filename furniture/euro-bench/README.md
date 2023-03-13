# micro-workbench

## order of operations cutting

- named parts using `[_]` 
- finished piece using `[_]*`
- cutoff that is never used again `[#]`

1. cross cut 896mm +5                  | 12x [A]          == 12x [A1] + 12x [A2]
2. _flip & trim_** to 896mm            | 12x [A1]         == 12x [A3] + 12x [#]
3. cross trim then cut two 60mm strips | 5x [B]           == 10x [B1] + 5x [B2]
4. rip trim then cut to 60mm strips    | 3x [A3]          == 6x [A4]  + 3x [A5]
4. cross cut 608mm +5                  | 4x [B] + 5x [B2] == 9x [B3]  + 9x [#]
5. _flip & trim_** to 608mm            | 9x [B3]          == 9x [B4]  + 9x [#]
6. rip trim non-reference to 608mm     | 9x [A3]          == 9x [A5]* + 9x [#]

** _flip & trim_: flip the panel over when cutting the opposite edge to maintain the same reference edge.