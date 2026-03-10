package ui;

import algorithm.Dijkstra;
import algorithm.YenKShortest;
import graph.GraphDisplay;
import graph.TransportGraph;
import model.PathResult;
import recommendation.RecommendationEngine;
import util.PathPrinter;

import java.util.List;
import java.util.Scanner;

/**
 * Interactive command-line menu for the Ghana Transport Network system.
 * Handles Q9: multiple queries, dataset editing, and recommendations.
 */
public class InteractiveMenu {

    private static final String SEP = "=".repeat(70);
    private final TransportGraph graph;
    private final Scanner scanner;

    public InteractiveMenu(TransportGraph graph) {
        this.graph = graph;
        this.scanner = new Scanner(System.in);
    }

    public void run() {
        System.out.println(SEP);
        System.out.println("  GHANA ROAD TRANSPORT NETWORK - INTERACTIVE SYSTEM");
        System.out.println(SEP);

        boolean running = true;
        while (running) {
            printMainMenu();
            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> handleQuery();
                case "2" -> handleUpdateEdge();
                case "3" -> handleRemoveEdge();
                case "4" -> handleAddEdge();
                case "5" -> handleNeighbors();
                case "6" -> handleGraphStats();
                case "0" -> { running = false; System.out.println("  Goodbye!"); }
                default  -> System.out.println("  [!] Invalid option. Try again.");
            }
        }
    }

    // -----------------------------------------------------------------------

    private void printMainMenu() {
        System.out.println();
        System.out.println(SEP);
        System.out.println("  MAIN MENU");
        System.out.println("  1. Query routes between two towns");
        System.out.println("  2. Update road (distance/time changed)");
        System.out.println("  3. Remove road (bridge collapse / flood)");
        System.out.println("  4. Add new road");
        System.out.println("  5. Show neighbors of a town");
        System.out.println("  6. Show graph statistics");
        System.out.println("  0. Exit");
        System.out.println(SEP);
        System.out.print("  Enter choice: ");
    }

    // -----------------------------------------------------------------------

    private void handleQuery() {
        System.out.print("  Start town   : ");
        String from = scanner.nextLine().trim();
        System.out.print("  Destination  : ");
        String to = scanner.nextLine().trim();

        if (!graph.containsTown(from)) { System.out.printf("  [!] '%s' not found in graph.%n", from); return; }
        if (!graph.containsTown(to))   { System.out.printf("  [!] '%s' not found in graph.%n", to);   return; }

        // Q4 – Shortest distance path
        PathResult shortest = Dijkstra.shortestPath(graph, from, to, Dijkstra.Weight.DISTANCE);
        PathPrinter.printSinglePath(shortest, "SHORTEST DISTANCE PATH", from, to);

        // Q5 – Fastest time path
        PathResult fastest = Dijkstra.shortestPath(graph, from, to, Dijkstra.Weight.TIME);
        PathPrinter.printSinglePath(fastest, "FASTEST TIME PATH", from, to);

        // Q6 – Top 3 shortest paths
        List<PathResult> top3 = YenKShortest.kShortestPaths(graph, from, to, 3, Dijkstra.Weight.DISTANCE);
        PathPrinter.printTopK(top3, from, to);

        // Q8 – Cost comparison & recommendation
        RecommendationEngine.recommend(top3, from, to);
    }

    private void handleUpdateEdge() {
        System.out.print("  Source town      : ");
        String src = scanner.nextLine().trim();
        System.out.print("  Destination town : ");
        String dst = scanner.nextLine().trim();
        System.out.print("  New distance (km): ");
        int dist = parseIntSafe(scanner.nextLine().trim(), -1);
        System.out.print("  New time (min)   : ");
        int time = parseIntSafe(scanner.nextLine().trim(), -1);

        if (dist < 0 || time < 0) { System.out.println("  [!] Invalid distance or time."); return; }
        boolean ok = graph.updateEdge(src, dst, dist, time);
        System.out.printf("  %s%n", ok ? "Road updated successfully." : "[!] Road not found.");
    }

    private void handleRemoveEdge() {
        System.out.print("  Source town      : ");
        String src = scanner.nextLine().trim();
        System.out.print("  Destination town : ");
        String dst = scanner.nextLine().trim();
        boolean ok = graph.removeEdge(src, dst);
        System.out.printf("  %s%n", ok ? "Road removed successfully." : "[!] Road not found.");
    }

    private void handleAddEdge() {
        System.out.print("  Source town      : ");
        String src = scanner.nextLine().trim();
        System.out.print("  Destination town : ");
        String dst = scanner.nextLine().trim();
        System.out.print("  Distance (km)    : ");
        int dist = parseIntSafe(scanner.nextLine().trim(), -1);
        System.out.print("  Travel time (min): ");
        int time = parseIntSafe(scanner.nextLine().trim(), -1);

        if (dist < 0 || time < 0) { System.out.println("  [!] Invalid distance or time."); return; }
        graph.addEdge(src, dst, dist, time);
        System.out.println("  New road added successfully.");
    }

    private void handleNeighbors() {
        System.out.print("  Town name: ");
        String town = scanner.nextLine().trim();
        if (!graph.containsTown(town)) { System.out.printf("  [!] '%s' not found.%n", town); return; }
        GraphDisplay.printNeighbors(graph, town);
    }

    private void handleGraphStats() {
        GraphDisplay.printSummary(graph);
    }

    // -----------------------------------------------------------------------

    private int parseIntSafe(String s, int fallback) {
        try { return Integer.parseInt(s); } catch (NumberFormatException e) { return fallback; }
    }
}
