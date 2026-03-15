# Ghana Road Transport Network – Programming Challenge 2026

**Ashesi University | Department of Computer Science**

---

## What This Project Is

This is our solution to the Ghana Road Transport Network Programming Challenge 2026. The task was to model Ghana's intercity road network as a graph, implement core graph algorithms on it, and build tools that let someone explore routes, estimate costs, and manage road connectivity.

We built a Java CLI that handles all 10 challenge questions. We also extended the project with a REST API (Spring Boot) and a web frontend (Next.js) so that the full system can be explored interactively in a browser — a live, visual version of everything the CLI already does.

---

## Requirements

- **Java 17** (the Spring Boot API targets Java 17; the CLI compiles cleanly with Java 17+)
- **Node.js 18+** and npm — only needed if you want to run the web frontend
- **bash** — needed to run `build_and_run.sh` and `start-backend.sh` (already available on Linux/macOS; on Windows use Git Bash or WSL)
- Maven is **not** required upfront — `start-backend.sh` downloads it automatically if it is not found

### What You Need to Download (if not already installed)

- **Java 17 (JDK):** https://adoptium.net/temurin/releases/?version=17
- **Node.js (includes npm):** https://nodejs.org/
- **Git Bash (Windows):** https://git-scm.com/downloads
- **WSL (Windows alternative to Git Bash):** https://learn.microsoft.com/windows/wsl/install

Quick check commands after installation:

```bash
java -version
node -v
npm -v
bash --version
```

---

## Project Structure

```
career-fair-competition/
├── build_and_run.sh              ← CLI build & run script (requires bash)
├── start-backend.sh              ← API build & run script (requires bash, downloads Maven if needed)
├── pom.xml                       ← Maven build for the Spring Boot API
├── data/
│   └── ghana_cities_graph_2026.txt  ← Road network dataset
│
├── src/                          ← Java source code (CLI + API)
│   ├── Main.java                    ← Entry point for CLI mode
│   ├── model/
│   │   ├── Edge.java                ← Represents a road between two towns
│   │   ├── PathResult.java          ← Result holder for a path query
│   │   └── RouteRecommendation.java ← Cost analysis on a route
│   ├── graph/
│   │   ├── TransportGraph.java      ← Core adjacency-list graph
│   │   ├── GraphLoader.java         ← Parses the dataset into the graph
│   │   └── GraphDisplay.java        ← Text-based display helpers
│   ├── algorithm/
│   │   ├── Dijkstra.java            ← Shortest/fastest path (Q4, Q5)
│   │   ├── YenKShortest.java        ← Top-K loopless paths (Q6)
│   │   ├── EdgeRemover.java         ← Helper used by Yen's algorithm internally
│   │   └── ComplexityAnalyzer.java  ← Complexity measurement & scaling (Q10)
│   ├── recommendation/
│   │   └── RecommendationEngine.java  ← Cost analysis + best route pick (Q7, Q8)
│   ├── ui/
│   │   └── InteractiveMenu.java     ← Interactive CLI session (Q9)
│   ├── util/
│   │   └── PathPrinter.java         ← Formats paths for terminal output
│   └── api/
│       ├── TransportApiApplication.java  ← Spring Boot entry point
│       ├── TransportService.java         ← Business logic for the REST API
│       ├── WebConfig.java               ← CORS configuration
│       ├── controller/
│       │   ├── GraphController.java     ← GET /api/graph, /api/towns, /api/stats
│       │   ├── RouteController.java     ← GET /api/route/shortest|fastest|top3
│       │   └── EdgeController.java      ← POST/PUT/DELETE /api/edge
│       └── dto/
│           └── EdgeRequest.java         ← Request body for edge mutations
│
└── frontend/                     ← Next.js web interface
    ├── app/
    │   ├── page.tsx                 ← Main page with tabs and header
    │   ├── layout.tsx               ← App shell and toast notifications
    │   └── globals.css              ← Shared styles and utility classes
    ├── components/
    │   ├── RouteExplorer.tsx        ← Route search form
    │   ├── RouteResults.tsx         ← Displays shortest, fastest or top-3 results
    │   ├── NetworkGraph.tsx         ← Interactive force-directed graph view
    │   ├── NetworkEditor.tsx        ← Add, update, or remove roads
    │   ├── StatsSidebar.tsx         ← Network summary and cost model info
    │   └── SearchableSelect.tsx     ← Searchable town dropdown
    └── lib/
        └── api.ts                   ← All fetch calls to the backend API
```

---

## About the Dataset

The raw dataset (`ghana_cities_graph_2026.txt`) contained **557 road entries**. When we loaded them, we noticed that **6 pairs of towns appeared twice** — once listed as A → B and again as B → A, but with slightly different distance and travel time values. This was unexpected, because the problem specification says roads are bidirectional and implies the same weight applies in both directions.

We treated these 6 as duplicates and removed them. Our assumption is that the discrepancy comes from measurement inconsistencies in the source data, and that a road between two towns should have one canonical distance and one travel time regardless of direction. The `addEdge` method in `TransportGraph.java` enforces this: it stores both directions of every road using the same weight, and it silently overwrites any earlier entry for the same pair. This means whichever direction is loaded last wins, giving us a clean and deterministic way to resolve conflicts without crashing or needing manual data correction.

After deduplication, the graph holds the correct set of unique bidirectional roads.

---

## How to Run

### Option 1 – CLI (all 10 questions, terminal output)

This mode runs the full question sequence — loading the graph, running path queries, printing results, launching the interactive menu, and outputting the complexity analysis.

> Note: CLI compilation excludes `src/api/*` on purpose. Those files are Spring Boot classes and require Maven-managed dependencies.

**Using the script (requires bash):**

```bash
chmod +x build_and_run.sh
./build_and_run.sh
```

**Manual compile and run:**

```bash
mkdir -p out
find src -name "*.java" ! -path "src/api/*" | xargs javac -encoding UTF-8 --release 17 -d out
java -cp out Main data/ghana_cities_graph_2026.txt
```

**Using IntelliJ IDEA:**
Open the project, navigate to `src/Main.java`, and click the green **Run** button next to `main()`. IntelliJ handles compilation automatically — no terminal needed.

---

### Option 2 – Web Interface (browser-based exploration)

The web interface has two parts: a Spring Boot API that serves the graph over HTTP, and a Next.js frontend that calls it. Start the backend first.

**Step 1 – Start the backend API**

Using the script (requires bash):

```bash
chmod +x start-backend.sh
./start-backend.sh
```

This downloads Maven into a local `.mvn-dist/` folder if it is not already there, then builds and starts the API.

If you already have Maven installed and on your PATH:

```bash
mvn spring-boot:run
```

**Using IntelliJ IDEA:**
Open the project, navigate to `src/api/TransportApiApplication.java`, and click the green **Run** button. IntelliJ will use the project's Maven configuration automatically.

The API starts on `http://localhost:8081`. You will see the graph loading output in the terminal once it is ready.

**Step 2 – Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

> The frontend needs the backend running first. If the API is not up, the town lists will be empty and route queries will fail silently.

---

## Questions Addressed

| Part | Question | Description                                                                          | Where It Lives                                                      |
| ---- | -------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| A    | Q1       | Load data, count towns and roads                                                     | `GraphLoader`, `GraphDisplay`                                       |
| A    | Q2       | Build the graph, show adjacency list and graph                                       | `TransportGraph`, `GraphDisplay`, network visualization in frontend |
| A    | Q3       | `get_neighbors(town)` function                                                       | `TransportGraph.getNeighbors()`                                     |
| B    | Q4       | Shortest distance path (Dijkstra)                                                    | `Dijkstra.shortestPath(DISTANCE)`                                   |
| B    | Q5       | Fastest time path (Dijkstra)                                                         | `Dijkstra.shortestPath(TIME)`                                       |
| C    | Q6       | Top 3 shortest paths with distances                                                  | `YenKShortest.kShortestPaths()`                                     |
| D    | Q7       | Fuel cost for a route                                                                | `RouteRecommendation`                                               |
| D    | Q8       | Total cost + best route recommendation                                               | `RecommendationEngine.recommend()`                                  |
| E    | Q9       | Interactive system — query, top 3 paths, cost comparison, recommendation, edit roads | `InteractiveMenu`                                                   |
| E    | Q10      | Time complexity analysis / scalability estimate 100–5000 nodes                       | `ComplexityAnalyzer`                                                |

---

## Key Design Decisions

**Graph representation**
We used a `LinkedHashMap<String, List<Edge>>` as the adjacency list. `LinkedHashMap` preserves insertion order, which keeps the town list consistent and predictable when printed. Town name lookups are case-insensitive (keys stored in lowercase), but the original casing is kept separately in a `canonicalNames` map so output is always readable.

**Dijkstra reused for both Q4 and Q5**
Rather than writing two separate path-finding methods, `Dijkstra.shortestPath()` takes a `Weight` enum (`DISTANCE` or `TIME`). The same algorithm runs either way — it just reads a different field from each edge. This keeps the code compact and avoids any risk of the two implementations drifting apart over time.

**Yen's K-Shortest Paths for Q6**
Finding the top-3 shortest paths requires an algorithm that avoids returning the same path twice or paths with cycles. We implemented Yen's algorithm, which works by systematically exploring "spur paths" branching off each previously found best path. During spur computation, edges and nodes are temporarily disabled and then restored afterwards — the `EdgeRemover` class handles this cleanly so the main graph is never permanently modified mid-query.

**Handling the 6 duplicate edges**
See the [About the Dataset](#about-the-dataset) section above. The short version: when a town pair appears twice with conflicting weights, we keep the last one loaded. The `addEdge` method handles this automatically.

**Cost model (Q7 and Q8)**

- Fuel efficiency: **8 km per litre**
- Fuel price: **GHS 11.95 per litre**
- `distance_cost = (distance_km / 8) × 11.95`
- `time_cost = travel_time_minutes × 0.50`
- `total_cost = distance_cost + time_cost`
- The recommended route is the one with the lowest total cost.

**Q9 – Interactive session**
The interactive menu supports multiple back-to-back queries without restarting the program. For each town pair queried, it shows the top-3 shortest-distance paths, the fastest-time path, a side-by-side cost comparison for all three routes, and a final recommendation. The session also allows editing road weights (for road improvements or deterioration), removing roads entirely (bridge collapse, flooding), and adding new roads. All changes apply to the in-memory graph and persist until the program exits.

**REST API for the frontend**
The Spring Boot API wraps the same `TransportGraph` and algorithm classes used in the CLI. It loads the graph at startup and exposes it as a singleton bean, so all API requests share one consistent graph instance. CORS is configured to allow `localhost:3000` so the frontend can reach it during development without any proxy setup.

**Graphical network view (Q2)**
The competition requires showing all towns and distances visually. The web frontend satisfies this with an interactive force-directed graph (rendered on an HTML canvas) where every node is a town and every edge is labelled with its distance and travel time. The same view also highlights found routes in colour when a query is run.

---

## Complexity Analysis (Q10)

| Algorithm        | Time Complexity          | Notes                      |
| ---------------- | ------------------------ | -------------------------- |
| Dijkstra         | O((V + E) log V)         | Binary heap priority queue |
| Yen's K-shortest | O(K · V · (V + E) log V) | K=3 for this challenge     |

For the Ghana road network where E ≈ 6V (sparse), Dijkstra simplifies to roughly O(V log V) in practice.

**Scaling estimates from 100 to 5,000 nodes:**

| Nodes (V) | Dijkstra ops (approx) | Yen K=3 ops (approx) |
| --------- | --------------------- | -------------------- |
| 100       | ~4.6K                 | ~1.4M                |
| 500       | ~27K                  | ~40M                 |
| 1,000     | ~60K                  | ~179M                |
| 5,000     | ~358K                 | ~5.4B                |

Dijkstra stays fast across the full range — at 5,000 nodes it is still well under a millisecond on modern hardware. Yen's cost grows much faster with K and V, but for K=3 on a few hundred nodes it completes in well under a second.
