# SmartMaintain AI

SmartMaintain AI is a local predictive maintenance application for MSME factory teams. It turns manually logged inspection readings into explainable machine-health predictions, remaining useful life estimates, work orders, supervisor knowledge, SOPs, workforce assignments, alerts, and a factory copilot.

## Run Locally

```powershell
npm start
```

Open:

```text
http://127.0.0.1:4545
```

The app uses only Node.js built-in modules, so there are no npm packages to install.

## What Is Included

- Machine health dashboard with 0-100 health scores and risk levels
- Manual inspection form for temperature, vibration, noise, oil quality, and power
- Explainable AI-style failure predictions for bearing wear, overheating, belt drift, and electrical overload
- Remaining useful life estimates based on condition and service age
- Smart alerts and one-click work order creation
- Tacit knowledge capture from senior supervisors
- SOP checklist generation from captured knowledge
- Worker assignment engine based on skill, availability, shift, and machine risk
- AI factory copilot for maintenance, assignment, SOP, and explanation questions

## Main Files

```text
src/index.js
src/api/server.js
src/services/smartmaintain/analytics.js
src/services/smartmaintain/store.js
web/index.html
web/app.js
web/styles.css
data/smartmaintain.db.json
```

`data/smartmaintain.db.json` is created automatically on first run and stores the demo factory state.

## API Endpoints

- `GET /api/health`
- `GET /api/snapshot`
- `POST /api/inspections`
- `POST /api/knowledge`
- `POST /api/work-orders`
- `POST /api/workforce/absence`
- `POST /api/copilot`

## Notes

This version is a production-shaped local prototype. It uses deterministic, explainable scoring logic instead of a trained ML model so it can run offline immediately. The same API boundaries can later be connected to FastAPI, PostgreSQL, XGBoost, Isolation Forest, LSTM RUL models, WhatsApp alerts, and a cloud SaaS deployment.
