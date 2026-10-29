import test from 'node:test';
import assert from 'node:assert/strict';
import { assessOrderRisk } from '../src/engines/riskEngine/index.js';
import { evaluateOrder } from '../src/engines/matchingEngine/index.js';
import { applyTrade, summarize } from '../src/engines/portfolioEngine/index.js';
import { scoreQuiz } from '../src/engines/learningEngine/index.js';
import { runLumpSum } from '../src/engines/whatIfEngine/index.js';

test('Risk Engine - strictly deterministic calculation', () => {
  const result = assessOrderRisk({
    order: { symbol: 'INFY', side: 'BUY', orderType: 'MARKET', product: 'CNC', quantity: 10 },
    price: 1500,
    security: { symbol: 'INFY', sector: 'Information Technology' },
    holdings: [],
    funds: { availableCash: 100000, blockedMargin: 0 },
  });

  assert.equal(result.orderValue, 15000);
  assert.equal(result.canPlace, true);
  assert.ok(result.riskScore >= 0 && result.riskScore <= 100);
  assert.equal(result.potentialLossAt5Pct, 750);
  assert.equal(result.potentialLossAt10Pct, 1500);
});

test('Risk Engine - blocks when insufficient funds', () => {
  const result = assessOrderRisk({
    order: { symbol: 'INFY', side: 'BUY', orderType: 'MARKET', product: 'CNC', quantity: 100 },
    price: 1500,
    security: { symbol: 'INFY', sector: 'Information Technology' },
    holdings: [],
    funds: { availableCash: 1000, blockedMargin: 0 },
  });

  assert.equal(result.canPlace, false);
  assert.ok(result.violations.some((v) => v.severity === 'BLOCKING'));
});

test('Matching Engine - limit order logic', () => {
  const buyLimit = { symbol: 'TCS', side: 'BUY', orderType: 'LIMIT', limitPrice: 3500, quantity: 5 };
  const quoteAbove = { ltp: 3550, ask: 3550, bid: 3549 };
  const quoteBelow = { ltp: 3490, ask: 3491, bid: 3490 };

  assert.equal(evaluateOrder(buyLimit, quoteAbove).fill, false);
  const fillBelow = evaluateOrder(buyLimit, quoteBelow);
  assert.equal(fillBelow.fill, true);
  assert.equal(fillBelow.price, 3490);
});

test('Portfolio Engine - average cost accounting', () => {
  const initialHolding = { quantity: 10, avgPrice: 100 };
  const buyTrade = { side: 'BUY', quantity: 10, price: 120 };
  const { holding } = applyTrade(initialHolding, buyTrade);

  assert.equal(holding.quantity, 20);
  assert.equal(holding.avgPrice, 110);
});

test('Learning Engine - quiz scoring', () => {
  const quiz = {
    questions: [
      { id: 'q1', answer: 1, explanation: 'Test explanation', skillArea: 'market_basics' },
      { id: 'q2', answer: 0, explanation: 'Test explanation', skillArea: 'risk_management' }
    ],
    passPct: 50,
  };

  const scored = scoreQuiz(quiz, { q1: 1, q2: 0 });
  assert.equal(scored.scorePct, 100);
  assert.equal(scored.passed, true);
});

test('What-If Engine - lump sum return', () => {
  const candles = [
    { time: 1000, close: 100 },
    { time: 2000, close: 150 }
  ];
  const sim = runLumpSum(candles, 10000);
  assert.equal(sim.finalValue, 15000);
  assert.equal(sim.returnPct, 50);
});
