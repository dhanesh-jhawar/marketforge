import { repos } from '../../repositories/index.js';
import { historicalService } from '../historical/historicalService.js';
import { runScenario } from '../../engines/whatIfEngine/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { nowIso, uuid } from '../../utils/index.js';

export const whatIfService = {
  async getScenarios() {
    return repos.scenarios.findMany({ published: true });
  },

  async getScenarioById(id) {
    const s = await repos.scenarios.findById(id);
    if (!s) throw ApiError.notFound('Scenario not found');
    return s;
  },

  async runScenarioSimulation(userId, scenarioId, inputs = {}) {
    const scenario = await this.getScenarioById(scenarioId);
    const symbol = inputs.symbol || scenario.symbol || 'NIFTY50';
    const benchmark = scenario.benchmark || 'NIFTY50';
    const amount = Number(inputs.amount || scenario.params?.amount || 100000);
    const sipMonthly = inputs.sipMonthly ? Number(inputs.sipMonthly) : scenario.params?.sipMonthly;

    const candles = await historicalService.getHistory(symbol, {
      interval: '1d',
      from: scenario.startDate,
      to: scenario.endDate,
    });

    let benchmarkCandles = [];
    if (benchmark && benchmark !== symbol) {
      benchmarkCandles = await historicalService.getHistory(benchmark, {
        interval: '1d',
        from: scenario.startDate,
        to: scenario.endDate,
      }).catch(() => []);
    }

    const result = runScenario({
      candles,
      benchmarkCandles,
      amount,
      sipMonthly,
    });

    if (userId) {
      await repos.scenarioAttempts.insert({
        id: uuid(),
        userId,
        scenarioId,
        inputs: { symbol, benchmark, amount, sipMonthly },
        result,
        createdAt: nowIso(),
      });
    }

    return { scenario, result };
  },

  async runSimulation(userId, inputs = {}) {
    const symbol = inputs.symbol || 'RELIANCE';
    const benchmark = inputs.benchmark || 'NIFTY50';
    const amount = Number(inputs.amount || inputs.initialCapital || 100000);
    const sipMonthly = inputs.sipMonthly ? Number(inputs.sipMonthly) : undefined;

    const candles = await historicalService.getHistory(symbol, {
      interval: '1d',
      from: inputs.startDate || inputs.from,
      to: inputs.endDate || inputs.to,
    });

    let benchmarkCandles = [];
    if (benchmark && benchmark !== symbol) {
      benchmarkCandles = await historicalService.getHistory(benchmark, {
        interval: '1d',
        from: inputs.startDate || inputs.from,
        to: inputs.endDate || inputs.to,
      }).catch(() => []);
    }

    const result = runScenario({
      candles,
      benchmarkCandles,
      amount,
      sipMonthly,
    });

    return result;
  },
};
