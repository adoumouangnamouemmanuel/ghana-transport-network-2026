package graph;

import model.Edge;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Provides text-based display utilities for the transport graph.
 */
public class GraphDisplay {

    private static final String SEPARATOR = "=".repeat(70);

    public static void printSummary(TransportGraph graph) {
        System.out.println(SEPARATOR);
        System.out.println("  GHANA TRANSPORT NETWORK  -  GRAPH SUMMARY");
        System.out.println(SEPARATOR);
        System.out.printf("  Total Towns (nodes) : %d%n", graph.getTownCount());
        System.out.printf("  Total Roads (edges) : %d%n", graph.getEdgeCount());
        System.out.println(SEPARATOR);
    }

    public static void printAllTowns(TransportGraph graph) {
        System.out.println(SEPARATOR);
        System.out.println("  ALL TOWNS");
        System.out.println(SEPARATOR);
        List<String> towns = new ArrayList<>(graph.getAllTowns());
        Collections.sort(towns);
        int col = 0;
        StringBuilder sb = new StringBuilder();
        for (String town : towns) {
            sb.append(String.format("  %-28s", town));
            if (++col % 3 == 0) {
                System.out.println(sb); sb.setLength(0);
            }
        }
        if (sb.length() > 0) System.out.println(sb);
        System.out.println(SEPARATOR);
    }

    public static void printAdjacencyList(TransportGraph graph) {
        System.out.println(SEPARATOR);
        System.out.println("  ADJACENCY LIST");
        System.out.printf("  %-28s %-28s %10s %10s%n", "SOURCE", "DESTINATION", "DIST(km)", "TIME(min)");
        System.out.println("-".repeat(70));
        List<String> towns = new ArrayList<>(graph.getAllTowns());
        Collections.sort(towns);
        for (String town : towns) {
            List<Edge> neighbors = graph.getNeighbors(town);
            // sort neighbours by destination name for readability
            neighbors = new ArrayList<>(neighbors);
            neighbors.sort(Comparator.comparing(Edge::getDestination));
            boolean first = true;
            for (Edge e : neighbors) {
                System.out.printf("  %-28s %-28s %10d %10d%n",
                        first ? town : "",
                        e.getDestination(),
                        e.getDistanceKm(),
                        e.getTravelTimeMinutes());
                first = false;
            }
        }
        System.out.println(SEPARATOR);
    }

    public static void printNeighbors(TransportGraph graph, String town) {
        List<Edge> neighbors = graph.getNeighbors(town);
        System.out.println(SEPARATOR);
        if (neighbors.isEmpty()) {
            System.out.printf("  No neighbors found for '%s'.%n", town);
        } else {
            System.out.printf("  NEIGHBORS OF: %s  (%d direct connections)%n",
                    graph.canonical(town), neighbors.size());
            System.out.println("-".repeat(70));
            System.out.printf("  %-28s %10s %12s%n", "DESTINATION", "DIST(km)", "TIME(min)");
            System.out.println("-".repeat(70));
            List<Edge> sorted = new ArrayList<>(neighbors);
            sorted.sort(Comparator.comparingInt(Edge::getDistanceKm));
            for (Edge e : sorted) {
                System.out.printf("  %-28s %10d %12d%n",
                        e.getDestination(), e.getDistanceKm(), e.getTravelTimeMinutes());
            }
        }
        System.out.println(SEPARATOR);
    }
}
