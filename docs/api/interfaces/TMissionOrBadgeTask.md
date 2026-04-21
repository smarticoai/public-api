# Interface: TMissionOrBadgeTask

TMissionOrBadgeTask describes the information of tasks that belings to mission or badge. See also TMissionOrBadge

## Properties

### id

> **id**: `number`

ID of the task

***

### name

> **name**: `string`

Name of the task, translated to the user language

***

### is\_completed

> **is\_completed**: `boolean`

Indicator if the task is completed

***

### progress

> **progress**: `number`

The progress of the task in percents

***

### points\_reward

> **points\_reward**: `number`

Reward for completing the task in points

***

### execution\_count\_expected?

> `optional` **execution\_count\_expected?**: `number`

This is the total number of times the user needs to execute to complete task. e.g. he needs to bet 100 times. Here will be 100

***

### execution\_count\_actual?

> `optional` **execution\_count\_actual?**: `number`

This is the number of times the user has executed 'activity' of the task. e.g. he bet 5 times out of 100. Here will be 5
