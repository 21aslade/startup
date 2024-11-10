 mov r0, 2
 str [0], r0
 mov r0, 3
 str [1], r0
 mov r6, 1
loop:
 ldr r0, [r5]
 ldr r1, [r6]
 call mult
 cmp r0, 0
 bne continue
 add r0, r6
continue:
 add r5, 1
 add r6, r5, 1
 str [r6], r0
 cmp r6, 255
 bne loop
 hlt

; mult(a: u8, b: u8) -> u8
mult:
 mov r2, r0
 mov r0, 0
 mov r3, 7
mult_loop:
 lsr r4, r1, r3
 and r4, 1
 beq mult_loop_end
 add r0, r2
mult_loop_end:
 lsl r0, 1
 sub r3, 1
 bpl mult_loop
mult_end:
 ret
