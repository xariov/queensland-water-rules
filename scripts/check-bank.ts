/** Prints structural bank errors, ignoring coverage minimums. */
import { allQuestions } from '../src/quiz/bank/index.ts';
import { topics } from '../src/quiz/topics.ts';
import { validateBank } from '../src/quiz/validateQuestion.ts';

const errors = validateBank(allQuestions, topics);
const structural = errors.filter((error) => !error.includes('minimum is 2'));
console.log(`questions: ${allQuestions.length} | total errors: ${errors.length} | structural: ${structural.length}`);
for (const error of structural) console.log(' -', error);
if (structural.length > 0) process.exit(1);
