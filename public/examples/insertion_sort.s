init:
 mov r2, 5
 mov r0, r2
 mov r1, 42
 str [r0], r1
 add r0, 1
 mov r1, 73
 str [r0], r1
 add r0, 1
 mov r1, 58
 str [r0], r1
 add r0, 1
 mov r1, 91
 str [r0], r1
 add r0, 1
 mov r1, 34
 str [r0], r1
 add r0, 1
 mov r1, 15
 str [r0], r1
 add r0, 1
 mov r1, 67
 str [r0], r1
 add r0, 1
 mov r1, 29
 str [r0], r1
 add r0, 1
 mov r1, 88
 str [r0], r1
 add r0, 1
 mov r1, 55
 str [r0], r1
 add r0, 1

main:
 sub r1, r0, r2
 mov r0, r2
 call insertion_sort
 hlt
 

; sort(buffer: r0, count: r1)
insertion_sort:
 mov r6, 0
outer_loop:
 add r6, 1
 cmp r6, r1
 beq done
 mov r2, r6
inner_loop:
 add r3, r0, r2
 ldr r4, [r3]
 sub r3, 1
 ldr r5, [r3]
 cmp r4, r5
 bhs outer_loop
 str [r3], r4
 add r3, 1
 str [r3], r5
 sub r2, 1
 bne inner_loop
 b outer_loop
done:
 ret
