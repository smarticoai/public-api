# Enumeration: JackPotTemparature

## Enumeration Members

### COLD

• **COLD** = ``0``

cold, seed amount < current pot < (min amount - seed amount)/2

___

### WARM

• **WARM** = ``1``

warm, (min amount - seed amount)/2 < current pot < min amount

___

### HOT

• **HOT** = ``2``

hot, current pot > min amount, entered explosion range

___

### BURNING

• **BURNING** = ``3``

burning, current pot > min amount + 0.5 * (max amount - min amount). E.g. mid of allowed explosion range
