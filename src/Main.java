import algorithm.ComplexityAnalyzer;
import algorithm.Dijkstra;
import algorithm.YenKShortest;
import graph.GraphDisplay;
import graph.GraphLoader;
import graph.TransportGraph;
import model.PathResult;
import recommendation.RecommendationEngine;
import ui.InteractiveMenu;
import util.PathPrinter;

import java.io.IOException;
import java.util.List;

/**
 * Ghana Road Transport Network – Career Fair Programming Competition 2026
 *
 * Entry point: loads the dataset, runs sample queries,
 * performs analysis, then launches the interactive menu.
 *
 * Usage:
 *   java Main [path/to/data.txt]
 * Default data file: data/ghana_cities_graph_2026.txt
 */
public class Main {

    private static final String DEFAULT_DATA_FILE = "data/ghana_cities_graph_2026.txt";

    public static void main(String[] args) {

        String dataFile = args.length > 0 ? args[0] : DEFAULT_DATA_FILE;

        // ----------------------------------------------------------------
        // Load graph
        // ----------------------------------------------------------------
        TransportGraph graph;
        try {
            graph = GraphLoader.load(dataFile);
        } catch (IOException e) {
            System.err.println("[ERROR] Cannot read data file: " + dataFile);
            System.err.println(e.getMessage());
            return;
        }

        // Optional: View all towns or full adjacency list
        // GraphDisplay.printAllTowns(graph);
        // GraphDisplay.printAdjacencyList(graph);

        // ================================================================
        // PART A – Q1: Summary statistics
        // ================================================================
        System.out.println("\n" + "═".repeat(70));
        System.out.println("  PART A – Q1: DATA LOADING SUMMARY");
        GraphDisplay.printSummary(graph);

        // ================================================================
        // PART A – Q2: Adjacency list (first 10 towns for brevity)
        // ================================================================
        System.out.println("\n  PART A – Q2: ADJACENCY LIST (first 10 towns shown)");
        System.out.println("  (Full list available in interactive menu option 6)");
        int shown = 0;
        for (String town : graph.getAllTowns()) {
            if (shown++ >= 10) break;
            GraphDisplay.printNeighbors(graph, town);
        }

        // ================================================================
        // PART A – Q3: Neighbor lookup demo
        // ================================================================
        System.out.println("\n  PART A – Q3: get_neighbors() DEMO");
        String demoTown = "Accra";
        GraphDisplay.printNeighbors(graph, demoTown);

        // ================================================================
        // PART B – Q4 & Q5: Shortest & Fastest between Accra and Tamale
        // ================================================================
        String startTown = "Accra";
        String endTown   = "Tamale";

        System.out.println("\n  PART B – Q4 & Q5: SHORTEST / FASTEST PATH");

        PathResult shortestDist = Dijkstra.shortestPath(graph, startTown, endTown, Dijkstra.Weight.DISTANCE);
        PathPrinter.printSinglePath(shortestDist, "Q4 – SHORTEST DISTANCE", startTown, endTown);

        PathResult fastestTime = Dijkstra.shortestPath(graph, startTown, endTown, Dijkstra.Weight.TIME);
        PathPrinter.printSinglePath(fastestTime, "Q5 – FASTEST TIME", startTown, endTown);

        // ================================================================
        // PART C – Q6: Top 3 shortest paths
        // ================================================================
        System.out.println("\n  PART C – Q6: TOP 3 SHORTEST PATHS");
        List<PathResult> top3 = YenKShortest.kShortestPaths(graph, startTown, endTown, 3, Dijkstra.Weight.DISTANCE);
        PathPrinter.printTopK(top3, startTown, endTown);

        // ================================================================
        // PART D – Q7 & Q8: Cost recommendation
        // ================================================================
        System.out.println("\n  PART D – Q7 & Q8: COST ANALYSIS & RECOMMENDATION");
        RecommendationEngine.recommend(top3, startTown, endTown);

        // ================================================================
        // PART E – Q10: Complexity analysis
        // ================================================================
        System.out.println("\n  PART E – Q10: ALGORITHM COMPLEXITY ANALYSIS");
        ComplexityAnalyzer.printScalabilityAnalysis();

        // ================================================================
        // PART E – Q9: Interactive menu
        // ================================================================
        System.out.println("\n  PART E – Q9: INTERACTIVE SYSTEM");
        InteractiveMenu menu = new InteractiveMenu(graph);
        menu.run();
    }
}