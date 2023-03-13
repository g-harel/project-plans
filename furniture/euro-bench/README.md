# micro-workbench

## order of operations cutting

- named parts using `[_]` 
- result of operation noted with `[<part>] & [<cutoff>]`
- finished piece using `[_*]`
- cutoff that is never used again `[#]`

1. cross cut [A] 896mm +5 (12x) -> [C] & [D]
2. _flip & trim_** [C] to 896 (12x) -> [E] & [#]
3. cross trim edge [B] then cut to 60mm 2x per (5x) -> [F,F] & [G]
4. rip trim edge [E] then cut to 60mm 2x per (3x) -> [K,K] & [L]
4. cross cut [G,B] 608mm +5 (5x+4x) -> [H] & [#]
5. _flip & trim_** [H] to 608mm (9x) -> [I] & [#]
6. rip trim non-reference of [E] to 608mm (9x) -> [J*] & [#]

** _flip & trim_: flip the panel over when cutting the opposite edge to maintain the same reference edge.