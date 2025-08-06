# YouTube Market Analysis

A web-based platform with an intuitive chat interface designed to automate YouTube market analyses and provide actionable insights for content strategy and competitive analysis.

## Table of Contents

* [About the Project](#about-the-project)
* [Features](#features)
* [Target Users & Use Cases](#target-users--use-cases)
* [Workflow Pipeline](#workflow-pipeline)
* [Tech Stack](#tech-stack)
* [Optimization Considerations](#optimization-considerations)
* [Constraints & Risks](#constraints--risks)
* [Expected Outputs & Report Format](#expected-outputs--report-format)
* [Future Enhancements](#future-enhancements)
* [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation (Backend)](#installation-backend)
    * [Installation (Frontend)](#installation-frontend)
* [Usage](#usage)
* [Project Structure](#project-structure)
* [Running Tests](#running-tests)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

## About The Project

This project aims to automate end-to-end workflows for niche market analysis on YouTube, such as for cricket channels or Turkish dubbed dramas. By leveraging AI-driven query generation and data retrieval automation, it enhances efficiency and accuracy in market analysis. The platform provides actionable insights through interactive visualizations and downloadable reports.

## Features

* **Automated Niche Market Analysis:** Automates end-to-end workflows for niche market analysis.
* **Actionable Insights:** Provides actionable insights through visualizations and downloadable reports.
* **AI-Driven Query Generation:** Leverages LLMs for targeted Youtube query generation.
* **Efficient Data Retrieval:** Optimizes YouTube Data API calls through asynchronous and batched processes.
* **Performance Analysis:** Analyzes data to determine top-performing channels, average views per video, and upload frequency.
* **Interactive Analytics Dashboard:** Offers an interactive analytics dashboard.
* **PDF Report Generation:** Enables the generation of downloadable PDF reports.

## Target Users & Use Cases

### Primary Users
* Market Analysts
* Content Strategists
* Channel Managers

### Key Use Cases
* Identifying top-performing channels within specific niches.
* Monitoring competitor content strategies – LLM Categorization (Next Development Phase).
* Generating periodic performance reports for internal stakeholders.

## Workflow Pipeline

1.  **Generate Targeted Queries:** LLM generates targeted Youtube queries for niche identification.
2.  **Query YouTube Data API:** Filter channels based on subscriber thresholds.
3.  **Resolve Channel IDs:** Resolve and map channel names to unique channel IDs.
4.  **Retrieve Video Data:** Retrieve video data (views, upload dates) for selected timeframes (default: 1 month, maximum: 1 year).
5.  **Optimize API Calls:** Conduct asynchronous and batched API calls to optimize response times.
6.  **Data Analysis:** Analyze data to determine top-performing channels, average views per video, and upload frequency.
7.  **Visualize & Report:** Visualize results interactively and enable PDF report generation.

## Tech Stack

| Function                   | Technology Choices       |
| :------------------------- | :----------------------- |
| LLM & Prompt Orchestration | OpenAI GPT-4, LangChain |
| Backend                    | Python, FastAPI     |
| Frontend                   | React, TypeScript   |
| Visualization Libraries    | Plotly, D3.js   |
| PDF Generation             | Puppeteer or Playwright |

## Optimization Considerations

* **API Management:** Handle rate limits through batching, asynchronous patterns, and retries.
* **Caching Strategy:** Implement Redis caching for common queries.
* **Pagination:** Employ cursor-based pagination to efficiently manage large datasets.

## Constraints & Risks

* **LLM Costs:** Potential high operational costs with extensive LLM usage.
* **YouTube API Quotas:** Risk of hitting daily API limits.
* **Latency:** Possible delays in processing large data volumes.
* **PDF Rendering:** Performance bottlenecks in dynamic PDF generation.
* **Compliance:** Adherence to data privacy standards (GDPR/CCPA).

## Expected Outputs & Report Format

### Graphs & Metrics
* Top channels ranked by total views.
* Average views per video.
* Total uploads per channel.

### Deliverables
* Interactive analytics dashboard.
* Downloadable PDF reports.

## Future Enhancements (Stretch Goals)

* Scheduled automated reporting (weekly/monthly).
* Slack and email integrations for alerts and notifications.
* Customizable dashboards for different stakeholders.
* Anomaly detection and proactive alerting.
* Specialized Market Analysis.
* Content Tagging – Understanding new popular formats.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* Python 3.x
* Node.js & npm (or Yarn)
* Docker (recommended for development)
* Git
* YouTube Data API Key
* OpenAI API Key

### Installation (Backend)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/youtube-market-analysis.git](https://github.com/YOUR_USERNAME/youtube-market-analysis.git)
    cd youtube-market-analysis/backend
    ```
2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate # On Windows use `venv\Scripts\activate`
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Set up environment variables:**
    Create a `.env` file in the `backend/` directory with your API keys and other configurations.
    ```
    YOUTUBE_API_KEY=your_youtube_api_key
    OPENAI_API_KEY=your_openai_api_key
    # Add other necessary environment variables (e.g., Redis host)
    ```
5.  **Run the FastAPI application:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will typically be accessible at `http://127.0.0.1:8000`.

### Installation (Frontend)

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend # From the backend directory, or from root: `cd youtube-market-analysis/frontend`
    ```
2.  **Install dependencies:**
    ```bash
    npm install # or yarn install
    ```
3.  **Configure API endpoint:**
    You might need to configure the `VITE_API_URL` or similar in a `.env` file in the `frontend/` directory, pointing to your running backend.
    ```
    VITE_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
    ```
4.  **Run the development server:**
    ```bash
    npm run dev # or yarn dev
    ```
    The frontend will typically be accessible at `http://127.0.0.1:5173` (or similar).

## Usage

Once both the backend and frontend services are running, open your web browser to the frontend URL. You can use the chat interface to input your market analysis queries, and the dashboard will display the results.

## Project Structure
youtube-market-analysis/
├── backend/            # FastAPI service
│   ├── app/
│   │   ├── api/        # route handlers
│   │   ├── core/       # settings, logging
│   │   ├── models/     # Pydantic schemas, DB models
│   │   ├── services/   # business logic (e.g. YouTube API calls)
│   │   └── utils/      # helpers (caching, pagination)
│   ├── tests/          # pytest test modules
│   ├── requirements.txt # pinned deps
│   └── Dockerfile
│
├── frontend/           # React + TypeScript UI
│   ├── public/
│   ├── src/
│   │   ├── components/ # reusable UI bits
│   │   ├── pages/      # top-level views
│   │   ├── services/   # API client wrappers
│   │   ├── hooks/      # custom React hooks
│   │   └── App.tsx
│   ├── tests/          # Jest / RTL tests
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts  # or your chosen bundler setup
│
├── docs/               # design docs, runbooks, API spec
│
├── scripts/            # helper scripts (db migrations, seeders)
│
├── configs/            # shared configuration (eslint, prettier)
│
├── .github/
│   └── workflows/      # CI (lint/test), CD pipelines
│
├── README.md           # high-level project overview
└── LICENSE
## Running Tests

* **Backend Tests:**
    ```bash
    cd backend
    pytest
    ```
* **Frontend Tests:**
    ```bash
    cd frontend
    npm test # or yarn test
    ```

## Contributing

Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request. Ensure your code adheres to the existing style and passes all tests.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Shahraiz Chishty 
Dot Republic Media