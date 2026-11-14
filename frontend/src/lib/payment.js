/* Payment checkpoints for client jobs (shared by /track and /admin).
   - Deposit: after "Quote approved"; work starts once it is received.
   - Final payment: the balance, due before "Handover" (report, certificate). */
import { JOB_STEPS } from './jobSteps.js';

export const BANK = {
  holder: 'Arulalagan',
  bank: 'Commercial Bank',
  account: '8100000999',
};

export const DEPOSIT_GATE = 1; // steps from this index need the deposit
export const FINAL_GATE = 4; // this step (Handover) needs the final payment

export const formatLKR = (amount) =>
  amount === null || amount === undefined ? '' : `LKR ${Number(amount).toLocaleString('en-US')}`;

export function paymentGates(job) {
  const p = job.payment || {};
  const done = job.completed_steps;
  const depositPaid = Boolean(p.deposit_paid_at);
  const finalPaid = Boolean(p.final_paid_at);
  return {
    depositPaid,
    finalPaid,
    deposit: {
      kind: 'deposit',
      state: depositPaid ? 'paid' : done >= DEPOSIT_GATE ? 'due' : 'upcoming',
      percent: p.deposit_percent ?? 25,
      amount: p.deposit_amount ?? null,
      reference: p.deposit_reference,
      paidAt: p.deposit_paid_at,
    },
    final: {
      kind: 'final',
      state: finalPaid ? 'paid' : done >= FINAL_GATE && depositPaid ? 'due' : 'upcoming',
      percent: 100 - (p.deposit_percent ?? 25),
      amount: p.balance_amount ?? null,
      reference: p.final_reference,
      paidAt: p.final_paid_at,
    },
  };
}

/* done / now / next, or locked when an unpaid checkpoint stands in front of the step */
export function stepStateWithPayments(index, job) {
  const { depositPaid, finalPaid } = paymentGates(job);
  if (index < job.completed_steps) return 'done';
  if ((index >= DEPOSIT_GATE && !depositPaid) || (index === FINAL_GATE && !finalPaid)) return 'locked';
  if (index === job.completed_steps) return 'now';
  return 'next';
}

/* What the job's status badge should say */
export function jobStatus(job) {
  const g = paymentGates(job);
  if (job.completed_steps >= JOB_STEPS.length) return { text: 'Completed', tone: 'done' };
  if (g.deposit.state === 'due') return { text: 'Deposit due', tone: 'due' };
  if (g.final.state === 'due') return { text: 'Final payment due', tone: 'due' };
  return { text: JOB_STEPS[job.completed_steps], tone: 'live' };
}
