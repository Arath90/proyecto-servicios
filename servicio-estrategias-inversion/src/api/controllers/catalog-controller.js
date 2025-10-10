// src/api/controllers/catalog-controller.js
const cds = require('@sap/cds');

// Models
const Instrument              = require('../models/mongodb/Instrument');
const MLDataset               = require('../models/mongodb/MLDataset');
const Execution               = require('../models/mongodb/Execution');
const DailyPnl                = require('../models/mongodb/DailyPnl');
const Order                   = require('../models/mongodb/Order');
const RiskLimit               = require('../models/mongodb/RiskLimit');
const Position                = require('../models/mongodb/Position');
const Signal                  = require('../models/mongodb/Signal');
const Backtest                = require('../models/mongodb/Backtest');
const Candle                  = require('../models/mongodb/Candle');
const MLModel                 = require('../models/mongodb/MLModel');
const NewsArticle             = require('../models/mongodb/NewsArticle');
const OptionChainSnapshot     = require('../models/mongodb/OptionChainSnapshot');
const OptionChainSnapshotItem = require('../models/mongodb/OptionChainSnapshotItem');
const OptionQuote             = require('../models/mongodb/OptionQuote');

const { registerCRUD } = require('../services/crud.service');

class CatalogController extends cds.ApplicationService {
  async init() {
    const {
      Instruments, MLDatasets, Executions, DailyPnls, Orders, RiskLimits,
      Positions, Signals, Backtests, Candles,
      MLModels, NewsArticles, OptionChainSnapshots, OptionChainSnapshotItems, OptionQuotes
    } = this.entities;

    const unique = (Model, whereFn, msg) => async (req) => {
      const w = whereFn?.(req); if (!w) return;
      const found = await Model.findOne(w);
      if (found) req.reject(409, msg);
    };

    registerCRUD(this, Instruments, Instrument, {
      uniqueCheck: unique(Instrument, r => ({ ib_conid: r.data.ib_conid }), 'ib_conid ya existe'),
    });
    registerCRUD(this, MLDatasets, MLDataset, {
      uniqueCheck: unique(MLDataset, r => ({ name: r.data.name }), 'MLDataset.name ya existe'),
    });
    registerCRUD(this, Executions, Execution, {
      uniqueCheck: unique(Execution, r => ({ exec_id: r.data.exec_id }), 'exec_id ya existe'),
    });
    registerCRUD(this, DailyPnls, DailyPnl, {
      uniqueCheck: unique(DailyPnl, r => ({ account: r.data.account, date: r.data.date }), 'DailyPnl duplicado'),
    });
    registerCRUD(this, Orders, Order);
    registerCRUD(this, RiskLimits, RiskLimit, {
      uniqueCheck: unique(RiskLimit, r => ({ account: r.data.account }), 'RiskLimit ya existe'),
    });
    registerCRUD(this, Positions, Position, {
      uniqueCheck: unique(Position, r => ({ account: r.data.account, instrument_id: r.data.instrument_id }), 'Position duplicada'),
    });
    registerCRUD(this, Signals, Signal, {
      uniqueCheck: unique(Signal, r => ({
        strategy_code: r.data.strategy_code, instrument_id: r.data.instrument_id, ts: r.data.ts, action: r.data.action
      }), 'Signal duplicada'),
    });
    registerCRUD(this, Backtests, Backtest, {
      uniqueCheck: unique(Backtest, r => ({
        strategy_code: r.data.strategy_code, dataset_id: r.data.dataset_id,
        period_start: r.data.period_start, period_end: r.data.period_end
      }), 'Backtest duplicado'),
    });
    registerCRUD(this, Candles, Candle, {
      uniqueCheck: unique(Candle, r => ({
        instrument_id: r.data.instrument_id, bar_size: r.data.bar_size, ts: r.data.ts
      }), 'Candle duplicada'),
    });

    registerCRUD(this, MLModels, MLModel);
    registerCRUD(this, NewsArticles, NewsArticle, {
      uniqueCheck: unique(NewsArticle, r => ({
        provider_code: r.data.provider_code, article_id: r.data.article_id
      }), 'Artículo duplicado'),
    });
    registerCRUD(this, OptionChainSnapshots, OptionChainSnapshot, {
      uniqueCheck: unique(OptionChainSnapshot, r => ({ underlying_id: r.data.underlying_id, ts: r.data.ts }), 'Snapshot duplicado'),
    });
    registerCRUD(this, OptionChainSnapshotItems, OptionChainSnapshotItem, {
      uniqueCheck: unique(OptionChainSnapshotItem, r => ({ snapshot_id: r.data.snapshot_id, option_id: r.data.option_id }), 'Item duplicado'),
    });
    registerCRUD(this, OptionQuotes, OptionQuote, {
      uniqueCheck: unique(OptionQuote, r => ({ instrument_id: r.data.instrument_id, ts: r.data.ts }), 'Quote duplicado'),
    });

    return super.init();
  }
}

module.exports = CatalogController;
