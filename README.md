# Ghana Road Transport Network – Programming Challenge 2026
**Ashesi University | Department of Computer Science**

---

## Overview
A modular Java solution for all 10 questions of the Ghana Road Transport Network Programming Challenge.

---

## Requirements
- Java 21 (or Java 16+ with `--enable-preview` for `record` types)
- The data file: `data/ghana_cities_graph_2026.txt`

---

## Project Structure

```
ghana_transport/
├── build_and_run.sh          ← Build & run script (Linux/macOS)
├── data/
│   └── ghana_cities_graph_2026.txt
└── src/
    ├── Main.java                             ← Entry point
    ├── model/
    │   ├── Edge.java                         ← Road/edge between two towns
    │   ├── PathResult.java                   ← Result of a path search
    │   └── RouteRecommendation.java          ← Cost analysis for a route
    ├── graph/
    │   ├── TransportGraph.java               ← Adjacency list graph (bidirectional)
    │   ├── GraphLoader.java                  ← Reads the CSV/TXT dataset
    │   └── GraphDisplay.java                 ← Text-based display utilities
    ├── algorithm/
    │   ├── Dijkstra.java                     ← Q4 & Q5: Shortest/fastest path
    │   ├── YenKShortest.java                 ← Q6: Top-K shortest paths
    │   ├── EdgeRemover.java                  ← Internal helper for Yen's algorithm
    │   └── ComplexityAnalyzer.java           ← Q10: Complexity & scalability analysis
    ├── recommendation/
    │   └── RecommendationEngine.java         ← Q7 & Q8: Cost analysis & recommendation
    ├── ui/
    │   └── InteractiveMenu.java              ← Q9: Interactive CLI menu
    └── util/
        └── PathPrinter.java                  ← Formatted output for paths
```

---

## How to Run

### Linux / macOS
```bash
chmod +x build_and_run.sh
./build_and_run.sh
```

### Manual (any OS)
```bash
# From the ghana_transport/ directory:
mkdir -p out
find src -name "*.java" | xargs javac --enable-preview --release 21 -d out
java --enable-preview -cp out Main data/ghana_cities_graph_2026.txt
```

---

## Questions Addressed

| Part | Question | Description                              | Implementation                     |
|------|----------|------------------------------------------|------------------------------------|
| A    | Q1       | Load data, count towns & roads           | `GraphLoader`, `GraphDisplay`      |
| A    | Q2       | Build directed graph, show adjacency list| `TransportGraph`, `GraphDisplay`   |
| A    | Q3       | `get_neighbors(town)`                    | `TransportGraph.getNeighbors()`    |
| B    | Q4       | Shortest distance path (Dijkstra)        | `Dijkstra.shortestPath(DISTANCE)`  |
| B    | Q5       | Fastest time path (Dijkstra)             | `Dijkstra.shortestPath(TIME)`      |
| C    | Q6       | Top 3 shortest distance paths            | `YenKShortest.kShortestPaths()`    |
| D    | Q7       | Fuel cost calculation                    | `RouteRecommendation.distanceCost` |
| D    | Q8       | Total cost + best route recommendation  | `RecommendationEngine.recommend()` |
| E    | Q9       | Interactive system (edit, query, update) | `InteractiveMenu`                  |
| E    | Q10      | Time complexity + scalability chart      | `ComplexityAnalyzer`               |

---

## Key Design Decisions & Assumptions

1. **Bidirectional roads**: The dataset lists each edge once; the system stores both directions (A→B and B→A with the same distance/time), as specified.

2. **Graph representation**: Adjacency list using `LinkedHashMap<String, List<Edge>>`. Insertion-order is preserved for display. Town names are normalised to lowercase for lookup but displayed in original casing.

3. **Dijkstra weight**: A single `Weight` enum (`DISTANCE` / `TIME`) is passed to `Dijkstra.shortestPath()`, making it reusable for Q4 and Q5.

4. **Top-3 paths (Yen's Algorithm)**: Yen's K-shortest loopless paths algorithm is implemented. It temporarily removes edges/nodes during spur-path computation and restores them afterward. This guarantees simple (no-cycle) paths.

5. **Cost model**:
   - Fuel consumption: 8 km/litre
   - Fuel price: GHS 11.95/litre
   - `distance_cost = (distance / 8) × 11.95`
   - `time_cost = travel_time_minutes × 0.50`
   - `total_cost = distance_cost + time_cost`
   - Recommendation: path with **lowest total cost**.

6. **Q9 – Interactive system**: Supports querying routes, updating edge weights (road improvements/deterioration), removing edges (bridge collapse), and adding new edges (new road construction). All changes persist for the session.

7. **Q10 – Complexity**:
   - Dijkstra: **O((V + E) log V)** with binary-heap PQ
   - Yen's K-shortest: **O(K · V · (V + E) log V)**
   - For sparse road networks (E ≈ 6V), this simplifies to **O(V log V)** for Dijkstra.

---

## Complexity Analysis Summary (Q10)

| Nodes (V) | Dijkstra Ops (approx) | Yen K=3 Ops (approx) |
|-----------|----------------------|----------------------|
| 100       | ~4.6K                | ~1.4M                |
| 500       | ~27K                 | ~40M                 |
| 1,000     | ~60K                 | ~179M                |
| 5,000     | ~358K                | ~5.4B                |

At 5,000 nodes Dijkstra remains very fast; Yen's becomes expensive for large K.
